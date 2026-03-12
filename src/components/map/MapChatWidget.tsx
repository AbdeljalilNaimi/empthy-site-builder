import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Send, Bot, Loader2, Stethoscope, AlertTriangle, ShieldAlert, ShieldCheck, Shield, User, MapPin as MapPinIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { DoctorProfileCard } from '@/components/medical-assistant/DoctorProfileCard';
import type { CityHealthProvider } from '@/data/providers';

// ── Types ──────────────────────────────────────────────────────

interface MapBotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface TriageMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  doctorIds?: string[];
  recommendedSpecialty?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

interface MapChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  providers: CityHealthProvider[];
  onFlyToProvider: (id: string) => void;
  language?: string;
}

type ActiveTab = 'map' | 'triage';

// ── Helpers ────────────────────────────────────────────────────

function parseResponse(content: string): { text: string; flyIds: string[] } {
  const flyIds: string[] = [];
  const text = content.replace(/\[FLY:([^\]]+)\]/g, (_, id) => {
    flyIds.push(id.trim());
    return '';
  }).trim();
  return { text, flyIds };
}

// ── Translations ───────────────────────────────────────────────

function getTx(language: string, providerCount: number) {
  const map = {
    fr: {
      title: 'CityHealth Assistant',
      tabMap: '📍 Assistant Carte',
      tabTriage: '🩺 Triage Médical',
      mapPlaceholder: 'Posez votre question...',
      mapWelcome: `Bonjour ! Je suis MapBot. Je connais les ${providerCount} prestataires affichés sur la carte. Comment puis-je vous aider ?`,
      mapSuggestions: ['Médecin le plus proche', 'Urgences 24h', 'Meilleure note'],
      triagePlaceholder: 'Décrivez vos symptômes en détail...',
      triageWelcome: 'Bonjour ! 👋 Décrivez vos symptômes et je vous orienterai vers le spécialiste le plus adapté parmi les professionnels affichés sur la carte.',
      triageDisclaimer: "Attention : Cet assistant IA ne remplace pas une consultation médicale et ne pose pas de diagnostic. En cas d'urgence grave, appelez immédiatement les secours.",
      recommended: 'Spécialistes recommandés :',
      noSpecialist: "Nous n'avons malheureusement pas de spécialiste en",
      noSpecialistSuffix: 'inscrit sur la plateforme pour le moment.',
      error: "Désolé, une erreur s'est produite. Réessayez.",
      seeOnMap: 'Voir sur carte',
    },
    ar: {
      title: 'مساعد CityHealth',
      tabMap: '📍 مساعد الخريطة',
      tabTriage: '🩺 تقييم الأعراض',
      mapPlaceholder: 'اطرح سؤالك...',
      mapWelcome: `مرحباً! أنا MapBot. أعرف ${providerCount} مزوداً معروضاً على الخريطة. كيف يمكنني مساعدتك؟`,
      mapSuggestions: ['أقرب طبيب', 'طوارئ 24 ساعة', 'أعلى تقييم'],
      triagePlaceholder: 'صف أعراضك بالتفصيل...',
      triageWelcome: 'مرحباً! 👋 صف أعراضك وسأوجهك إلى الأخصائي المناسب من بين المهنيين المعروضين على الخريطة.',
      triageDisclaimer: 'تنبيه: هذا المساعد الذكي لا يحل محل الاستشارة الطبية ولا يقدم تشخيصاً. في حالة الطوارئ الشديدة، اتصل بالإسعاف فوراً.',
      recommended: 'الأخصائيون الموصى بهم:',
      noSpecialist: 'للأسف لا يوجد لدينا أخصائي في',
      noSpecialistSuffix: 'مسجل على المنصة حالياً.',
      error: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
      seeOnMap: 'على الخريطة',
    },
    en: {
      title: 'CityHealth Assistant',
      tabMap: '📍 Map Assistant',
      tabTriage: '🩺 Symptom Triage',
      mapPlaceholder: 'Ask your question...',
      mapWelcome: `Hello! I'm MapBot. I know the ${providerCount} providers shown on the map. How can I help you?`,
      mapSuggestions: ['Nearest doctor', '24h Emergency', 'Best rated'],
      triagePlaceholder: 'Describe your symptoms in detail...',
      triageWelcome: "Hello! 👋 Describe your symptoms and I'll guide you to the most suitable specialist among those shown on the map.",
      triageDisclaimer: 'Warning: This AI assistant does not replace a medical consultation and does not provide diagnoses. In case of serious emergency, call emergency services immediately.',
      recommended: 'Recommended specialists:',
      noSpecialist: "Unfortunately, we don't have a specialist in",
      noSpecialistSuffix: 'registered on the platform at this time.',
      error: 'Sorry, an error occurred. Please try again.',
      seeOnMap: 'See on map',
    },
  };
  return map[language as keyof typeof map] || map.fr;
}

// ── Component ──────────────────────────────────────────────────

export const MapChatWidget = ({ isOpen, onClose, providers, onFlyToProvider, language = 'fr' }: MapChatWidgetProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  // Map tab state
  const [mapMessages, setMapMessages] = useState<MapBotMessage[]>([]);
  const [mapInput, setMapInput] = useState('');
  const [mapLoading, setMapLoading] = useState(false);

  // Triage tab state
  const [triageMessages, setTriageMessages] = useState<TriageMessage[]>([]);
  const [triageInput, setTriageInput] = useState('');
  const [triageLoading, setTriageLoading] = useState(false);

  const mapEndRef = useRef<HTMLDivElement>(null);
  const triageEndRef = useRef<HTMLDivElement>(null);

  const tx = useMemo(() => getTx(language, providers.length), [language, providers.length]);

  // Simplified doctors for triage
  const simplifiedDoctors = useMemo(() =>
    providers
      .filter(p => p.isPublic && p.verificationStatus === 'verified')
      .map(p => ({ id: p.id, name: p.name, specialty: p.specialty, city: p.city, type: p.type })),
    [providers]
  );

  const getDoctorById = useCallback((id: string) => providers.find(p => p.id === id), [providers]);

  // ── Init welcome messages ────────────────────────────────

  useEffect(() => {
    if (isOpen && mapMessages.length === 0) {
      setMapMessages([{ id: 'welcome', role: 'assistant', content: tx.mapWelcome }]);
    }
    if (isOpen && triageMessages.length === 0) {
      setTriageMessages([{ id: 'welcome', role: 'assistant', content: tx.triageWelcome }]);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => { mapEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mapMessages]);
  useEffect(() => { triageEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [triageMessages]);

  // ── MAP BOT LOGIC ────────────────────────────────────────

  const mapSystemPrompt = useMemo(() =>
    `Tu es MapBot, un assistant médical intelligent intégré à la carte de recherche de prestataires de santé à Sidi Bel Abbès (Algérie).
Tu as accès à la liste complète des prestataires actuellement affichés sur la carte. Tu aides les utilisateurs à trouver le bon prestataire.

PRESTATAIRES DISPONIBLES (${providers.length} au total):
${providers.map(p => `- ID:${p.id} | ${p.name} (${p.specialty || p.type}) | ${p.address} | Note: ${p.rating}/5${p.emergency ? ' | URGENCES 24/7' : ''}${p.distance ? ` | ${p.distance}km` : ''}`).join('\n')}

INSTRUCTIONS IMPORTANTES:
- Quand tu recommandes un prestataire spécifique, inclus le tag [FLY:ID_DU_PRESTATAIRE] pour centrer la carte dessus.
- Exemple: "Je vous recommande Dr. Benali [FLY:provider-123] qui est cardiologue..."
- Réponds TOUJOURS dans la langue de l'utilisateur (FR/AR/EN).
- Sois concis, utile et professionnel.
- Ne pas inventer de prestataires qui ne sont pas dans la liste.
- Si la liste est vide, dis à l'utilisateur d'élargir ses critères de recherche.`,
    [providers]
  );

  const sendMapMessage = useCallback(async (text?: string) => {
    const content = text || mapInput.trim();
    if (!content || mapLoading) return;
    const userMsg: MapBotMessage = { id: Date.now().toString(), role: 'user', content };
    setMapMessages(prev => [...prev, userMsg]);
    if (!text) setMapInput('');
    setMapLoading(true);

    try {
      const history = mapMessages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }));
      const { data, error } = await supabase.functions.invoke('map-bot', {
        body: { messages: [...history, { role: 'user', content }], systemPrompt: mapSystemPrompt, model: 'google/gemini-3-flash-preview' }
      });
      if (error) throw error;
      const rawContent = data?.content || data?.message || tx.error;
      const { text: parsed, flyIds } = parseResponse(rawContent);
      setMapMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: parsed || rawContent }]);
      flyIds.forEach(id => { if (providers.find(p => p.id === id)) onFlyToProvider(id); });
    } catch {
      setMapMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: tx.error }]);
    } finally {
      setMapLoading(false);
    }
  }, [mapInput, mapLoading, mapMessages, mapSystemPrompt, providers, onFlyToProvider, tx.error]);

  // ── TRIAGE LOGIC ─────────────────────────────────────────

  const sendTriageMessage = useCallback(async () => {
    const content = triageInput.trim();
    if (!content || triageLoading) return;
    setTriageMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content }]);
    setTriageInput('');
    setTriageLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('symptom-triage', {
        body: { userSymptoms: content, availableDoctors: simplifiedDoctors, language }
      });
      if (error) throw error;
      setTriageMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.analysis || 'Analyse non disponible.',
        doctorIds: data.doctorIds || [],
        recommendedSpecialty: data.recommendedSpecialty || '',
        urgencyLevel: data.urgencyLevel || undefined,
      }]);
    } catch {
      setTriageMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: tx.error }]);
    } finally {
      setTriageLoading(false);
    }
  }, [triageInput, triageLoading, simplifiedDoctors, language, tx.error]);

  const hasMapUserMessages = mapMessages.some(m => m.role === 'user');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute bottom-24 right-6 z-[500] w-96 rounded-2xl shadow-2xl border border-border/60 bg-card/95 backdrop-blur-sm flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100% - 120px)', height: 500 }}
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-primary text-primary-foreground flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              {activeTab === 'map' ? <Bot size={16} /> : <Stethoscope size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{tx.title}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20 rounded-full" onClick={onClose}>
              <X size={14} />
            </Button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-border/50 flex-shrink-0 bg-card">
            <button
              className={cn('flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors',
                activeTab === 'map' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveTab('map')}
            >
              {tx.tabMap}
            </button>
            <button
              className={cn('flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors',
                activeTab === 'triage' ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-500' : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => setActiveTab('triage')}
            >
              {tx.tabTriage}
            </button>
          </div>

          {/* ══════════ MAP TAB ══════════ */}
          {activeTab === 'map' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {mapMessages.map(msg => (
                  <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={12} className="text-primary" />
                      </div>
                    )}
                    <div className={cn('max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                      msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {mapLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Bot size={12} className="text-primary" /></div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2"><Loader2 size={14} className="animate-spin text-muted-foreground" /></div>
                  </div>
                )}
                <div ref={mapEndRef} />
              </div>

              {/* Quick suggestions */}
              {!hasMapUserMessages && !mapLoading && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                  {tx.mapSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMapMessage(s)}
                      className="px-2.5 py-1 text-[10px] rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-150 font-medium"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-border/50 flex gap-2 flex-shrink-0">
                <Input
                  value={mapInput}
                  onChange={e => setMapInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMapMessage(); } }}
                  placeholder={tx.mapPlaceholder}
                  className="h-9 text-xs rounded-full bg-muted border-0 focus-visible:ring-1"
                  disabled={mapLoading}
                />
                <Button size="icon" className="h-9 w-9 rounded-full flex-shrink-0" onClick={() => sendMapMessage()} disabled={!mapInput.trim() || mapLoading}>
                  <Send size={14} />
                </Button>
              </div>
            </>
          )}

          {/* ══════════ TRIAGE TAB ══════════ */}
          {activeTab === 'triage' && (
            <>
              {/* Disclaimer */}
              <div className="mx-3 mt-2 mb-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-1.5 flex-shrink-0">
                <AlertTriangle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">{tx.triageDisclaimer}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                {triageMessages.map(msg => (
                  <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Stethoscope size={12} className="text-teal-600" />
                      </div>
                    )}
                    <div className="max-w-[85%] space-y-2">
                      <div className={cn('rounded-2xl px-3 py-2 text-xs leading-relaxed',
                        msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
                      )}>
                        {msg.content}
                      </div>

                      {/* Urgency badge */}
                      {msg.role === 'assistant' && msg.urgencyLevel && (
                        <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium w-fit',
                          msg.urgencyLevel === 'high' && 'bg-destructive/10 text-destructive border border-destructive/20',
                          msg.urgencyLevel === 'medium' && 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
                          msg.urgencyLevel === 'low' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
                        )}>
                          {msg.urgencyLevel === 'high' && <ShieldAlert className="w-3 h-3" />}
                          {msg.urgencyLevel === 'medium' && <Shield className="w-3 h-3" />}
                          {msg.urgencyLevel === 'low' && <ShieldCheck className="w-3 h-3" />}
                          {msg.urgencyLevel === 'high' && (language === 'ar' ? 'عاجل' : language === 'en' ? 'High urgency' : 'Urgence élevée')}
                          {msg.urgencyLevel === 'medium' && (language === 'ar' ? 'متوسط' : language === 'en' ? 'Moderate' : 'Modéré')}
                          {msg.urgencyLevel === 'low' && (language === 'ar' ? 'منخفض' : language === 'en' ? 'Low urgency' : 'Faible')}
                        </div>
                      )}

                      {/* Doctor cards */}
                      {msg.role === 'assistant' && msg.doctorIds && msg.doctorIds.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1">
                          <p className="text-[10px] font-medium text-muted-foreground">{tx.recommended}</p>
                          {msg.doctorIds.map((id, idx) => {
                            const doc = getDoctorById(id);
                            if (!doc) return null;
                            return (
                              <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                                <DoctorProfileCard
                                  id={doc.id}
                                  name={doc.name}
                                  specialty={doc.specialty}
                                  city={doc.city}
                                  language={language}
                                  image={doc.image}
                                  onFlyTo={() => onFlyToProvider(doc.id)}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {/* No specialist */}
                      {msg.role === 'assistant' && msg.doctorIds && msg.doctorIds.length === 0 && msg.recommendedSpecialty && (
                        <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-2 text-[10px] text-muted-foreground">
                          {tx.noSpecialist} <strong>{msg.recommendedSpecialty}</strong> {tx.noSpecialistSuffix}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User size={12} className="text-primary" />
                      </div>
                    )}
                  </div>
                ))}
                {triageLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0"><Stethoscope size={12} className="text-teal-600" /></div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2"><Loader2 size={14} className="animate-spin text-muted-foreground" /></div>
                  </div>
                )}
                <div ref={triageEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border/50 flex gap-2 flex-shrink-0">
                <Textarea
                  value={triageInput}
                  onChange={e => setTriageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTriageMessage(); } }}
                  placeholder={tx.triagePlaceholder}
                  className="min-h-[36px] max-h-[80px] resize-none text-xs rounded-xl"
                  rows={1}
                  disabled={triageLoading}
                />
                <Button size="icon" className="h-9 w-9 rounded-full flex-shrink-0 bg-teal-600 hover:bg-teal-700" onClick={sendTriageMessage} disabled={!triageInput.trim() || triageLoading}>
                  {triageLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
