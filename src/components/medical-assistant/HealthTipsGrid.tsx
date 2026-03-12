import { motion } from "framer-motion";
import { 
  Apple, Dumbbell, Moon, Brain, Shield, Heart, 
  Droplets, Sun, Leaf, Activity 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const HEALTH_TIPS = [
  {
    icon: Apple,
    title: "Nutrition équilibrée",
    category: "Nutrition",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    tips: [
      "Mangez 5 fruits et légumes par jour",
      "Privilégiez les protéines maigres",
      "Limitez le sucre et le sel"
    ],
    featured: true
  },
  {
    icon: Dumbbell,
    title: "Activité physique",
    category: "Exercice",
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10",
    tips: [
      "30 minutes de marche quotidienne",
      "Étirez-vous chaque matin",
      "Prenez les escaliers"
    ]
  },
  {
    icon: Moon,
    title: "Sommeil réparateur",
    category: "Sommeil",
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-500/10",
    tips: [
      "7-8 heures de sommeil par nuit",
      "Évitez les écrans avant de dormir",
      "Maintenez un horaire régulier"
    ]
  },
  {
    icon: Brain,
    title: "Santé mentale",
    category: "Mental",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    tips: [
      "Pratiquez la méditation",
      "Parlez de vos émotions",
      "Prenez des pauses régulières"
    ]
  },
  {
    icon: Shield,
    title: "Prévention",
    category: "Prévention",
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-500/10",
    tips: [
      "Vaccinations à jour",
      "Check-ups annuels",
      "Lavage des mains régulier"
    ]
  },
  {
    icon: Droplets,
    title: "Hydratation",
    category: "Nutrition",
    color: "from-blue-500 to-sky-500",
    bgColor: "bg-blue-500/10",
    tips: [
      "2 litres d'eau par jour",
      "Limitez les sodas",
      "Commencez la journée avec de l'eau"
    ]
  },
  {
    icon: Heart,
    title: "Santé cardiaque",
    category: "Prévention",
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-500/10",
    tips: [
      "Surveillez votre tension",
      "Réduisez le stress",
      "Évitez le tabac"
    ]
  },
  {
    icon: Sun,
    title: "Vitamine D",
    category: "Nutrition",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
    tips: [
      "15 min de soleil par jour",
      "Aliments enrichis en vitamine D",
      "Suppléments si nécessaire"
    ]
  }
];

interface HealthTipsGridProps {
  language: string;
}

export function HealthTipsGrid({ language }: HealthTipsGridProps) {
  const t = {
    fr: { dailyTip: "Conseil du jour", learnMore: "En savoir plus", tips: "conseils" },
    ar: { dailyTip: "نصيحة اليوم", learnMore: "اقرأ المزيد", tips: "نصائح" },
    en: { dailyTip: "Tip of the day", learnMore: "Learn more", tips: "tips" }
  }[language] || { dailyTip: "Conseil du jour", learnMore: "En savoir plus", tips: "conseils" };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Featured tip (first one)
  const featuredTip = HEALTH_TIPS[0];
  const otherTips = HEALTH_TIPS.slice(1);

  return (
    <div className="space-y-6">
      {/* Featured Tip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={cn(
          "overflow-hidden border-0 shadow-xl",
          "bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-teal-500/5"
        )}>
          <div className="relative">
            <div className="absolute top-4 left-4">
              <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                ✨ {t.dailyTip}
              </Badge>
            </div>
            <CardHeader className="pt-12">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br", featuredTip.color, "shadow-lg"
                )}>
                  <featuredTip.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{featuredTip.title}</CardTitle>
                  <Badge variant="outline" className="mt-1">{featuredTip.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {featuredTip.tips.map((tip, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                    <span className="text-muted-foreground">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Other Tips Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {otherTips.map((tip, index) => (
          <motion.div key={tip.title} variants={item}>
            <Card className={cn(
              "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer",
              "border border-border/50 hover:border-teal-500/30"
            )}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    "bg-gradient-to-br", tip.color
                  )}>
                    <tip.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tip.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      {tip.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {tip.tips.slice(0, 2).map((tipText, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Leaf className="w-3 h-3 mt-1 text-teal-500 flex-shrink-0" />
                      {tipText}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
