import React, { useState, useEffect } from 'react';

export interface NotificationPreferences {
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "HH:MM"
  quietHoursEnd: string;
  maxPerHour: number; // 0 = unlimited
  urgentOnly: boolean;
}

const DEFAULTS: NotificationPreferences = {
  soundEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  maxPerHour: 0,
  urgentOnly: false,
};

export function OptionsPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['notificationPrefs'], (result) => {
      if (result.notificationPrefs) {
        setPrefs({ ...DEFAULTS, ...result.notificationPrefs });
      }
    });
  }, []);

  function update<K extends keyof NotificationPreferences>(key: K, value: NotificationPreferences[K]) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    chrome.storage.local.set({ notificationPrefs: prefs }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleReset() {
    setPrefs(DEFAULTS);
    chrome.storage.local.set({ notificationPrefs: DEFAULTS });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-sky-500 text-white px-6 py-5">
          <h1 className="text-lg font-bold flex items-center gap-2">🏥 CityHealth — Préférences</h1>
          <p className="text-xs opacity-80 mt-1">Configurez vos notifications SOS Don de Sang</p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Sound toggle */}
          <ToggleRow
            label="🔔 Son de notification"
            description="Jouer un son lors d'une alerte SOS"
            checked={prefs.soundEnabled}
            onChange={(v) => update('soundEnabled', v)}
          />

          {/* Urgent only */}
          <ToggleRow
            label="🚨 Urgences critiques uniquement"
            description="Ne notifier que les urgences de niveau « critique »"
            checked={prefs.urgentOnly}
            onChange={(v) => update('urgentOnly', v)}
          />

          {/* Quiet hours */}
          <div className="border border-gray-200 rounded-lg p-4">
            <ToggleRow
              label="🌙 Heures calmes"
              description="Désactiver les notifications pendant une plage horaire"
              checked={prefs.quietHoursEnabled}
              onChange={(v) => update('quietHoursEnabled', v)}
            />

            {prefs.quietHoursEnabled && (
              <div className="mt-4 flex items-center gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">De</label>
                  <input
                    type="time"
                    value={prefs.quietHoursStart}
                    onChange={(e) => update('quietHoursStart', e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <span className="text-gray-400 mt-4">→</span>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">À</label>
                  <input
                    type="time"
                    value={prefs.quietHoursEnd}
                    onChange={(e) => update('quietHoursEnd', e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Max per hour */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              📊 Limite de notifications par heure
            </label>
            <p className="text-xs text-gray-400 mb-2">0 = illimité</p>
            <input
              type="range"
              min={0}
              max={10}
              value={prefs.maxPerHour}
              onChange={(e) => update('maxPerHour', Number(e.target.value))}
              className="w-full accent-sky-500"
            />
            <div className="text-sm text-center font-semibold text-sky-600 mt-1">
              {prefs.maxPerHour === 0 ? 'Illimité' : `${prefs.maxPerHour} / heure`}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-sky-500 text-white rounded-md py-2 text-sm font-medium hover:bg-sky-600 transition-colors"
            >
              {saved ? '✓ Enregistré' : 'Enregistrer'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 border border-gray-300 text-gray-600 rounded-md py-2 text-sm hover:bg-gray-100 transition-colors"
            >
              Réinitialiser
            </button>
          </div>

          {/* Privacy & Permissions */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mt-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">🔒 Confidentialité & Permissions</h3>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-start gap-2">
                <span className="shrink-0">🔔</span>
                <span><strong className="text-gray-600">Notifications :</strong> Uniquement pour les alertes vitales de don de sang.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">💾</span>
                <span><strong className="text-gray-600">Stockage :</strong> Pour sauvegarder vos préférences en toute sécurité sur cet appareil.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <div className="pt-0.5">
        <div
          className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-sky-500' : 'bg-gray-300'}`}
          onClick={() => onChange(!checked)}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
          />
        </div>
      </div>
      <div className="flex-1" onClick={() => onChange(!checked)}>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </label>
  );
}
