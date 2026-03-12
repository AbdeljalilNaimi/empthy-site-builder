import { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, X, Loader2, Bot, Sparkles, ChevronDown, ShieldAlert, Shield, ShieldCheck, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { CityHealthProvider } from '@/data/providers';
import { getVerifiedProviders } from '@/services/firestoreProviderService';
import { DoctorProfileCard } from '@/components/medical-assistant/DoctorProfileCard';
import { supabase } from '@/integrations/supabase/client';

interface TriageMessage {
  role: "user" | "assistant";
  content: string;
  doctorIds?: string[];
  recommendedSpecialty?: string;
  urgencyLevel?: "low" | "medium" | "high";
}

interface SimplifiedDoctor {
  id: string;
  name: string;
  specialty?: string;
  city: string;
  type: string;
}

export const AIHealthAssistant = () => {
  const location = useLocation();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getVerifiedProviders().then(setProviders).catch(console.error);
  }, []);

  const simplifiedDoctors: SimplifiedDoctor[] = useMemo(() => {
    return providers.map(p => ({ id: p.id, name: p.name, specialty: p.specialty, city: p.city, type: p.type }));
  }, [providers]);

  const t = useMemo(() => ({
    fr: {
      welcome: "Bonjour ! 👋 Décrivez vos symptômes et je vous orienterai vers le spécialiste adapté.",
      placeholder: "Décrivez vos symptômes...",
      noSpecialist: "Pas de spécialiste en",
      noSpecialistSuffix: "sur la plateforme.",
      recommended: "Spécialistes recommandés :",
    },
    ar: {
      welcome: "مرحباً! 👋 صف أعراضك وسأوجهك للأخصائي المناسب.",
      placeholder: "صف أعراضك...",
      noSpecialist: "لا يوجد أخصائي في",
      noSpecialistSuffix: "على المنصة.",
      recommended: "الأخصائيون الموصى بهم:",
    },
    en: {
      welcome: "Hello! 👋 Describe your symptoms and I'll guide you to the right specialist.",
      placeholder: "Describe your symptoms...",
      noSpecialist: "No specialist in",
      noSpecialistSuffix: "on the platform.",
      recommended: "Recommended specialists:",
    },
  }[language] || {
    welcome: "", placeholder: "", noSpecialist: "", noSpecialistSuffix: "", recommended: "",
  }), [language]);

  // Initialize welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: t.welcome }]);
    }
  }, [isOpen]);

  // Auto-scroll
  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("symptom-triage", {
        body: {
          userSymptoms: trimmed,
          availableDoctors: simplifiedDoctors,
          language,
        },
      });

      if (error) {
        setMessages(prev => [...prev, { role: "assistant", content: error.message || "Erreur." }]);
        setIsLoading(false);
        return;
      }
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.analysis || "Analyse non disponible.",
        doctorIds: data.doctorIds || [],
        recommendedSpecialty: data.recommendedSpecialty || "",
        urgencyLevel: data.urgencyLevel || undefined,
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getDoctorById = (id: string) => providers.find(p => p.id === id);

  // Hide on docs and medical-assistant pages
  if (location.pathname.startsWith('/docs') || location.pathname.startsWith('/medical-assistant')) {
    return null;
  }

  // Floating button when closed
  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative group"
          aria-label="Ouvrir l'assistant santé IA"
        >
          <div className="relative flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-card border border-border rounded-xl shadow-lg transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-xl group-hover:shadow-primary/10">
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500"
            />
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-md">
                <Bot className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-white relative z-10" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]" />
                </motion.div>
              </div>
            </motion.div>
            <div className="relative z-10 flex flex-col items-start">
              <span className="font-medium text-xs sm:text-sm text-foreground tracking-tight">
                Assistant IA
              </span>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -top-1.5 -right-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500 rounded-full border border-background shadow-md"
          >
            <motion.span
              className="w-1 h-1 bg-white rounded-full"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[8px] font-bold text-white uppercase tracking-wider">Live</span>
          </motion.div>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
      >
        <Card className={cn(
          "shadow-2xl flex flex-col transition-all duration-300 overflow-hidden border-border/60",
          isMinimized
            ? "w-72 sm:w-80 h-14 sm:h-16"
            : "w-[calc(100vw-2rem)] sm:w-[400px] md:w-[440px] h-[calc(100vh-6rem)] sm:h-[560px] md:h-[620px] max-h-[85vh]"
        )}>
          {/* Header */}
          <div
            className="flex items-center justify-between p-3 sm:p-4 border-b bg-gradient-to-r from-teal-600 to-cyan-600 text-white cursor-pointer shrink-0"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-1.5">
                  Triage Médical IA
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                </h3>
                {!isMinimized && (
                  <p className="text-xs opacity-80 hidden sm:block">Évaluation de vos symptômes</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", isMinimized && "rotate-180")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col flex-1 min-h-0"
              >
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={cn("max-w-[85%] space-y-2", msg.role === "user" ? "order-1" : "")}>
                          <div className={cn(
                            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                            msg.role === "user"
                              ? "bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-md shadow-sm"
                              : "bg-muted/70 border border-border/40 rounded-bl-md"
                          )}>
                            {msg.content}
                          </div>

                          {/* Urgency badge */}
                          {msg.role === "assistant" && msg.urgencyLevel && (
                            <div className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit",
                              msg.urgencyLevel === "high" && "bg-destructive/10 text-destructive border border-destructive/20",
                              msg.urgencyLevel === "medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                              msg.urgencyLevel === "low" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                            )}>
                              {msg.urgencyLevel === "high" && <ShieldAlert className="w-3 h-3" />}
                              {msg.urgencyLevel === "medium" && <Shield className="w-3 h-3" />}
                              {msg.urgencyLevel === "low" && <ShieldCheck className="w-3 h-3" />}
                              {msg.urgencyLevel === "high" && "Urgence élevée"}
                              {msg.urgencyLevel === "medium" && "Modéré"}
                              {msg.urgencyLevel === "low" && "Faible"}
                            </div>
                          )}

                          {/* Doctor cards */}
                          {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length > 0 && (
                            <div className="flex flex-col gap-2 mt-2">
                              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t.recommended}</p>
                              {msg.doctorIds.map((id) => {
                                const doc = getDoctorById(id);
                                if (!doc) return null;
                                return (
                                  <DoctorProfileCard
                                    key={id}
                                    id={doc.id}
                                    name={doc.name}
                                    specialty={doc.specialty}
                                    city={doc.city}
                                    language={language}
                                    image={doc.image}
                                  />
                                );
                              })}
                            </div>
                          )}

                          {/* No specialist */}
                          {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length === 0 && msg.recommendedSpecialty && (
                            <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-muted-foreground">
                              {t.noSpecialist} <strong>{msg.recommendedSpecialty}</strong> {t.noSpecialistSuffix}
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1 order-2">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-muted/70 border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex gap-1">
                              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            </span>
                            <span className="text-xs text-muted-foreground">Analyse...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={scrollAnchorRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-border/50 bg-gradient-to-t from-muted/40 to-transparent shrink-0">
                  <div className="flex gap-2 items-end">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.placeholder}
                      disabled={isLoading}
                      className="min-h-[44px] max-h-[100px] resize-none text-sm rounded-xl border-border/60 bg-background/80"
                      rows={1}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                      className={cn(
                        "shrink-0 rounded-xl h-11 w-11 transition-all",
                        input.trim()
                          ? "bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-md shadow-teal-500/20"
                          : "bg-muted text-muted-foreground shadow-none"
                      )}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
