import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, AlertTriangle, Phone, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { SymptomTriageBot } from "@/components/medical-assistant/SymptomTriageBot";

export default function MedicalAssistantPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = useMemo(() => {
    const translations = {
      fr: {
        title: "Assistant Médical IA",
        subtitle: "Évaluation intelligente de vos symptômes",
        online: "En ligne",
        disclaimer: "Ne remplace pas un avis médical. Urgence → appelez le",
      },
      ar: {
        title: "المساعد الطبي الذكي",
        subtitle: "تقييم ذكي لأعراضك",
        online: "متصل",
        disclaimer: "لا يحل محل الاستشارة الطبية. طوارئ → اتصل بـ",
      },
      en: {
        title: "AI Medical Assistant",
        subtitle: "Intelligent symptom assessment",
        online: "Online",
        disclaimer: "Does not replace medical advice. Emergency → call",
      },
    };
    return translations[language as keyof typeof translations] || translations.fr;
  }, [language]);

  return (
    <div className={cn(
      "h-screen flex flex-col bg-background",
      language === "ar" && "rtl"
    )}>
      {/* Compact Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="shrink-0 backdrop-blur-xl bg-background/90 border-b border-border/40 z-50"
      >
        <div className="max-w-4xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-lg h-8 w-8"
              >
                <ArrowLeft className={cn("h-4 w-4", language === "ar" && "rotate-180")} />
              </Button>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20">
                    <Bot className="w-4.5 h-4.5 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                </div>

                <div>
                  <h1 className="font-semibold text-sm flex items-center gap-1">
                    {t.title}
                    <Sparkles className="w-3 h-3 text-teal-500" />
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{t.online}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Disclaimer inline */}
              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground bg-amber-500/8 border border-amber-500/15 rounded-lg px-2.5 py-1.5">
                <Shield className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{t.disclaimer}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1 rounded-lg shadow-md shadow-destructive/20 h-8 text-xs px-3"
                onClick={() => window.location.href = "tel:15"}
              >
                <Phone className="w-3 h-3" />
                <span className="font-bold">15</span>
              </Button>
            </div>
          </div>

          {/* Mobile disclaimer */}
          <div className="md:hidden flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>{t.disclaimer} 15</span>
          </div>
        </div>
      </motion.header>

      {/* Chat area — fills remaining height */}
      <main className="flex-1 min-h-0">
        <SymptomTriageBot />
      </main>
    </div>
  );
}
