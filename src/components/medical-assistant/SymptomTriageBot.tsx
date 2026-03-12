import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, ShieldAlert, ShieldCheck, Shield, Stethoscope, HeartPulse, Thermometer, Brain, Baby, Eye, Bone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CityHealthProvider } from "@/data/providers";
import { getVerifiedProviders } from "@/services/firestoreProviderService";
import { DoctorProfileCard } from "./DoctorProfileCard";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const QUICK_SYMPTOMS = {
  fr: [
  { icon: HeartPulse, label: "Douleur thoracique", query: "J'ai une douleur dans la poitrine" },
  { icon: Thermometer, label: "Fièvre", query: "J'ai de la fièvre depuis 2 jours" },
  { icon: Brain, label: "Maux de tête", query: "J'ai des maux de tête fréquents et intenses" },
  { icon: Bone, label: "Douleur dos", query: "J'ai mal au dos depuis plusieurs jours" },
  { icon: Eye, label: "Problème de vue", query: "Ma vue a baissé récemment" },
  { icon: Baby, label: "Suivi grossesse", query: "Je cherche un suivi de grossesse" }],

  ar: [
  { icon: HeartPulse, label: "ألم في الصدر", query: "لدي ألم في الصدر" },
  { icon: Thermometer, label: "حمى", query: "أعاني من الحمى منذ يومين" },
  { icon: Brain, label: "صداع", query: "أعاني من صداع متكرر وشديد" },
  { icon: Bone, label: "ألم الظهر", query: "أعاني من ألم في الظهر منذ عدة أيام" },
  { icon: Eye, label: "مشكلة في النظر", query: "تراجعت رؤيتي مؤخراً" },
  { icon: Baby, label: "متابعة الحمل", query: "أبحث عن متابعة الحمل" }],

  en: [
  { icon: HeartPulse, label: "Chest pain", query: "I have chest pain" },
  { icon: Thermometer, label: "Fever", query: "I've had a fever for 2 days" },
  { icon: Brain, label: "Headache", query: "I have frequent and intense headaches" },
  { icon: Bone, label: "Back pain", query: "I've had back pain for several days" },
  { icon: Eye, label: "Vision issue", query: "My vision has decreased recently" },
  { icon: Baby, label: "Pregnancy care", query: "I'm looking for pregnancy follow-up" }]

};

export function SymptomTriageBot() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<TriageMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<CityHealthProvider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsLoadingProviders(true);
    getVerifiedProviders().
    then(setProviders).
    catch(console.error).
    finally(() => setIsLoadingProviders(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const simplifiedDoctors: SimplifiedDoctor[] = useMemo(() => {
    return providers.map((p) => ({ id: p.id, name: p.name, specialty: p.specialty, city: p.city, type: p.type }));
  }, [providers]);

  const t = useMemo(() => ({
    fr: {
      welcome: "Bonjour ! 👋 Décrivez vos symptômes et je vous orienterai vers le spécialiste le plus adapté.",
      welcomeSub: "Choisissez un symptôme courant ou décrivez le vôtre",
      noSpecialist: "Nous n'avons malheureusement pas de spécialiste en",
      noSpecialistSuffix: "inscrit sur la plateforme pour le moment.",
      recommended: "Spécialistes recommandés",
      placeholder: "Décrivez vos symptômes...",
      helper: "Entrée pour envoyer · Shift+Entrée pour un retour à la ligne"
    },
    ar: {
      welcome: "مرحباً! 👋 صف أعراضك وسأوجهك إلى الأخصائي المناسب.",
      welcomeSub: "اختر عرضاً شائعاً أو صف أعراضك",
      noSpecialist: "للأسف لا يوجد لدينا أخصائي في",
      noSpecialistSuffix: "مسجل على المنصة حالياً.",
      recommended: "الأخصائيون الموصى بهم",
      placeholder: "صف أعراضك...",
      helper: "Enter للإرسال · Shift+Enter لسطر جديد"
    },
    en: {
      welcome: "Hello! 👋 Describe your symptoms and I'll guide you to the right specialist.",
      welcomeSub: "Pick a common symptom or describe yours",
      noSpecialist: "Unfortunately, we don't have a specialist in",
      noSpecialistSuffix: "registered on the platform at this time.",
      recommended: "Recommended specialists",
      placeholder: "Describe your symptoms...",
      helper: "Enter to send · Shift+Enter for new line"
    }
  })[language] || {
    welcome: "", welcomeSub: "", noSpecialist: "", noSpecialistSuffix: "", recommended: "", placeholder: "", helper: ""
  }, [language]);

  const quickSymptoms = QUICK_SYMPTOMS[language as keyof typeof QUICK_SYMPTOMS] || QUICK_SYMPTOMS.fr;
  const hasConversation = messages.length > 0;

  const sendMessage = async (text?: string) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading || isLoadingProviders) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("symptom-triage", {
        body: { userSymptoms: trimmed, availableDoctors: simplifiedDoctors, language }
      });

      if (error) {
        setMessages((prev) => [...prev, { role: "assistant", content: error.message || "Une erreur est survenue." }]);
        setIsLoading(false);
        return;
      }
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.analysis || "Analyse non disponible.",
        doctorIds: data.doctorIds || [],
        recommendedSpecialty: data.recommendedSpecialty || "",
        urgencyLevel: data.urgencyLevel || undefined
      }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de connexion. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getDoctorById = (id: string) => providers.find((p) => p.id === id);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 py-6 space-y-5">
          {/* Welcome state */}
          {!hasConversation &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-8 sm:py-16">

              {/* Big icon */}
              







              <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">{t.welcome}</h2>
              <p className="text-sm text-muted-foreground text-center mb-8">{t.welcomeSub}</p>

              {/* Quick symptom chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-lg">
                {quickSymptoms.map((symptom, i) =>
              <motion.button
                key={symptom.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(symptom.query)}
                className={cn(
                  "flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm text-left",
                  "bg-card border border-border/60 hover:border-teal-500/40",
                  "hover:bg-teal-500/5 hover:shadow-md transition-all duration-200",
                  "group cursor-pointer"
                )}>

                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 group-hover:bg-teal-500/20 transition-colors">
                      <symptom.icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">{symptom.label}</span>
                  </motion.button>
              )}
              </div>
            </motion.div>
          }

          {/* Chat messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>

                {/* Bot avatar */}
                {msg.role === "assistant" &&
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
              }

                <div className={cn("max-w-[85%] sm:max-w-[75%] space-y-2.5", msg.role === "user" ? "order-1" : "")}>
                  {/* Message bubble */}
                  <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user" ?
                  "bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-br-md shadow-sm" :
                  "bg-muted/60 border border-border/30 rounded-bl-md"
                )}>
                    {msg.role === "assistant" ?
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-ul:mb-2 prose-li:mb-0.5">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div> :

                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  }
                  </div>

                  {/* Urgency badge */}
                  {msg.role === "assistant" && msg.urgencyLevel &&
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold w-fit",
                    msg.urgencyLevel === "high" && "bg-destructive/10 text-destructive border border-destructive/20",
                    msg.urgencyLevel === "medium" && "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
                    msg.urgencyLevel === "low" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  )}>

                      {msg.urgencyLevel === "high" && <ShieldAlert className="w-3.5 h-3.5" />}
                      {msg.urgencyLevel === "medium" && <Shield className="w-3.5 h-3.5" />}
                      {msg.urgencyLevel === "low" && <ShieldCheck className="w-3.5 h-3.5" />}
                      {msg.urgencyLevel === "high" && (language === "ar" ? "عاجل" : language === "en" ? "High urgency" : "Urgence élevée")}
                      {msg.urgencyLevel === "medium" && (language === "ar" ? "متوسط" : language === "en" ? "Moderate" : "Modéré")}
                      {msg.urgencyLevel === "low" && (language === "ar" ? "منخفض" : language === "en" ? "Low urgency" : "Faible")}
                    </motion.div>
                }

                  {/* Doctor cards */}
                  {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length > 0 &&
                <div className="flex flex-col gap-2.5 mt-2">
                      <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase px-1">{t.recommended}</p>
                      {msg.doctorIds.map((id, idx) => {
                    const doc = getDoctorById(id);
                    if (!doc) return null;
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}>

                            <DoctorProfileCard
                          id={doc.id}
                          name={doc.name}
                          specialty={doc.specialty}
                          city={doc.city}
                          language={language}
                          image={doc.image} />

                          </motion.div>);

                  })}
                    </div>
                }

                  {/* No specialist */}
                  {msg.role === "assistant" && msg.doctorIds && msg.doctorIds.length === 0 && msg.recommendedSpecialty &&
                <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                      {t.noSpecialist} <strong>{msg.recommendedSpecialty}</strong> {t.noSpecialistSuffix}
                    </div>
                }
                </div>

                {/* User avatar */}
                {msg.role === "user" &&
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 mt-1 order-2">
                    <User className="w-4 h-4 text-primary" />
                  </div>
              }
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-muted/60 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    {language === "ar" ? "جاري التحليل..." : language === "en" ? "Analyzing..." : "Analyse en cours..."}
                  </span>
                </div>
              </div>
            </motion.div>
          }
        </div>
      </div>

      {/* Input area — pinned bottom */}
      <div className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="flex gap-2.5 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              className={cn(
                "w-full resize-none text-sm rounded-xl border border-border/60 bg-muted/30 px-4 py-3",
                "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/40",
                "transition-all duration-200 max-h-[120px]"
              )}
              disabled={isLoading || isLoadingProviders} />

          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || isLoadingProviders}
            size="icon"
            className={cn(
              "shrink-0 rounded-xl h-11 w-11 transition-all duration-200",
              input.trim() ?
              "bg-gradient-to-br from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/25" :
              "bg-muted text-muted-foreground shadow-none"
            )}>

            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/40 mt-1.5">
          {isLoadingProviders ?
          language === "ar" ? "جاري تحميل الأطباء..." : language === "en" ? "Loading providers..." : "Chargement des prestataires..." :
          t.helper}
        </p>
      </div>
    </div>);

}