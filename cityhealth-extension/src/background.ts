import { supabase, APP_URL } from './supabaseClient';

let userBloodGroup: string | null = null;

interface NotificationPreferences {
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  maxPerHour: number;
  urgentOnly: boolean;
}

let prefs: NotificationPreferences = {
  soundEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  maxPerHour: 0,
  urgentOnly: false,
};

let notificationsThisHour = 0;
let lastHourReset = Date.now();

function loadPrefs() {
  chrome.storage.local.get(['notificationPrefs'], (result) => {
    if (result.notificationPrefs) prefs = { ...prefs, ...result.notificationPrefs };
  });
}

function isInQuietHours(): boolean {
  if (!prefs.quietHoursEnabled) return false;
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const { quietHoursStart: start, quietHoursEnd: end } = prefs;
  if (start <= end) return hhmm >= start && hhmm < end;
  return hhmm >= start || hhmm < end;
}

function canNotify(): boolean {
  if (isInQuietHours()) return false;
  if (prefs.maxPerHour > 0) {
    if (Date.now() - lastHourReset > 3600000) {
      notificationsThisHour = 0;
      lastHourReset = Date.now();
    }
    if (notificationsThisHour >= prefs.maxPerHour) return false;
  }
  return true;
}

function loadBloodGroup() {
  chrome.storage.local.get(['bloodGroup'], (result) => {
    userBloodGroup = result.bloodGroup || null;
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.bloodGroup) userBloodGroup = changes.bloodGroup.newValue || null;
    if (changes.notificationPrefs) prefs = { ...prefs, ...changes.notificationPrefs.newValue };
  }
});

function subscribeToEmergencies() {
  supabase
    .channel('ext-blood-emergencies')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'blood_emergencies', filter: 'status=eq.active' },
      (payload) => {
        const emergency = payload.new as any;
        if (!userBloodGroup) return;
        if (prefs.urgentOnly && emergency.urgency_level !== 'critical') return;
        if (emergency.blood_type_needed !== userBloodGroup) return;
        if (!canNotify()) return;

        notificationsThisHour++;

        chrome.storage.local.get(['sosAlertCount', 'sosAlertHistory'], (result) => {
          const count = (result.sosAlertCount || 0) + 1;
          const history = result.sosAlertHistory || [];
          history.unshift({
            id: emergency.id,
            blood_type: emergency.blood_type_needed,
            provider: emergency.provider_name || '',
            urgency: emergency.urgency_level,
            time: new Date().toISOString(),
          });
          chrome.storage.local.set({ sosAlertCount: count, sosAlertHistory: history.slice(0, 5) });
        });

        chrome.notifications.create(`blood-emergency-${emergency.id}`, {
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: `🚨 Urgence Sang ${emergency.blood_type_needed}`,
          message: `Besoin vital détecté. Cliquez pour aider.`,
          priority: 2,
          requireInteraction: true,
          silent: !prefs.soundEnabled,
        });
      }
    )
    .subscribe();
}

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('blood-emergency-')) {
    chrome.tabs.create({ url: `${APP_URL}/don-de-sang` });
    chrome.notifications.clear(notificationId);
  }
});

chrome.runtime.onInstalled.addListener(() => { loadBloodGroup(); loadPrefs(); subscribeToEmergencies(); });
chrome.runtime.onStartup.addListener(() => { loadBloodGroup(); loadPrefs(); subscribeToEmergencies(); });
loadBloodGroup();
loadPrefs();
subscribeToEmergencies();
