import { useState } from 'react';
import { Check, Crown, Star, Zap, ArrowRight, ArrowLeft, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

type BillingPeriod = 'monthly' | 'annual';

const i18n = {
  fr: {
    badge: 'Tarification transparente',
    audienceLabel: 'Pour les professionnels de santé',
    citizenFreeNote: 'Les citoyens naviguent et recherchent gratuitement — ces forfaits sont réservés aux praticiens souhaitant être référencés.',
    title: 'Des forfaits adaptés à vos besoins',
    subtitle: 'Tous les forfaits sont',
    subtitleBold: 'entièrement gratuits la première année',
    subtitleEnd: '. Aucune carte bancaire requise.',
    monthly: 'Mensuel',
    annual: 'Annuel',
    popular: 'Le plus populaire',
    freeYear: 'Gratuit la 1ère année',
    bottomNote: 'Aucun engagement • Annulation à tout moment • Support inclus dans tous les forfaits',
  },
  ar: {
    badge: 'أسعار شفافة',
    audienceLabel: 'لمقدمي الرعاية الصحية',
    citizenFreeNote: 'يتصفح المواطنون ويبحثون مجاناً — هذه الباقات مخصصة للممارسين الراغبين في التسجيل.',
    title: 'باقات مصممة لاحتياجاتك',
    subtitle: 'جميع الباقات',
    subtitleBold: 'مجانية بالكامل في السنة الأولى',
    subtitleEnd: '. لا حاجة لبطاقة بنكية.',
    monthly: 'شهري',
    annual: 'سنوي',
    popular: 'الأكثر شعبية',
    freeYear: 'مجاني في السنة الأولى',
    bottomNote: 'بدون التزام • إلغاء في أي وقت • الدعم مشمول في جميع الباقات',
  },
  en: {
    badge: 'Transparent pricing',
    audienceLabel: 'For Healthcare Providers',
    citizenFreeNote: 'Citizens always browse for free — these plans are for providers who want to list their practice and reach thousands of patients.',
    title: 'Plans tailored to your needs',
    subtitle: 'All plans are',
    subtitleBold: 'completely free for the first year',
    subtitleEnd: '. No credit card required.',
    monthly: 'Monthly',
    annual: 'Annual',
    popular: 'Most popular',
    freeYear: 'Free for 1st year',
    bottomNote: 'No commitment • Cancel anytime • Support included in all plans',
  },
};

const plans = [
  {
    name: 'Basic',
    icon: Zap,
    monthlyPrice: { fr: 'Gratuit', ar: 'مجاني', en: 'Free' },
    annualPrice: { fr: 'Gratuit', ar: 'مجاني', en: 'Free' },
    period: { monthly: '', annual: '' },
    subtitle: { fr: 'Pour démarrer votre présence en ligne', ar: 'لبدء تواجدك على الإنترنت', en: 'To start your online presence' },
    features: {
      fr: ['Profil public standard', 'Localisation sur la carte interactive', 'Accès au réseau "Urgence Sang"', 'Badge "Vérifié" standard'],
      ar: ['ملف شخصي عام قياسي', 'الظهور على الخريطة التفاعلية', 'الوصول إلى شبكة "طوارئ الدم"', 'شارة "موثّق" قياسية'],
      en: ['Standard public profile', 'Location on interactive map', 'Access to "Blood Emergency" network', 'Standard "Verified" badge'],
    },
    cta: { fr: 'Commencer gratuitement', ar: 'ابدأ مجاناً', en: 'Start for free' },
    popular: false,
    tier: 'basic' as const,
  },
  {
    name: 'Standard',
    icon: Star,
    monthlyPrice: { fr: '2 500 DA', ar: '2,500 د.ج', en: '2,500 DA' },
    annualPrice: { fr: '24 000 DA', ar: '24,000 د.ج', en: '24,000 DA' },
    period: { monthly: { fr: '/ mois', ar: '/ شهر', en: '/ month' }, annual: { fr: '/ an', ar: '/ سنة', en: '/ year' } },
    subtitle: { fr: 'Idéal pour développer votre activité', ar: 'مثالي لتطوير نشاطك', en: 'Ideal for growing your business' },
    features: {
      fr: ['Tout le forfait Basic inclus', 'Prise de rendez-vous en ligne', 'Mode "Pharmacie de Garde"', 'Affichage des avis patients', 'Galerie photos de l\'établissement'],
      ar: ['كل ميزات الباقة الأساسية', 'حجز المواعيد عبر الإنترنت', 'وضع "صيدلية المناوبة"', 'عرض تقييمات المرضى', 'معرض صور المؤسسة'],
      en: ['All Basic plan features', 'Online appointment booking', '"On-duty Pharmacy" mode', 'Patient reviews display', 'Facility photo gallery'],
    },
    cta: { fr: 'Choisir le Standard', ar: 'اختر Standard', en: 'Choose Standard' },
    popular: true,
    tier: 'standard' as const,
  },
  {
    name: 'Premium',
    icon: Crown,
    monthlyPrice: { fr: '4 900 DA', ar: '4,900 د.ج', en: '4,900 DA' },
    annualPrice: { fr: '47 000 DA', ar: '47,000 د.ج', en: '47,000 DA' },
    period: { monthly: { fr: '/ mois', ar: '/ شهر', en: '/ month' }, annual: { fr: '/ an', ar: '/ سنة', en: '/ year' } },
    subtitle: { fr: 'Visibilité maximale & outils avancés', ar: 'أقصى ظهور وأدوات متقدمة', en: 'Maximum visibility & advanced tools' },
    features: {
      fr: ['Tout le forfait Standard inclus', 'Badge exclusif "Premium Vérifié"', 'Apparition en tête des résultats', 'Recommandation par l\'Assistant IA', 'Statistiques avancées du dashboard'],
      ar: ['كل ميزات باقة Standard', 'شارة حصرية "بريميوم موثّق"', 'الظهور في أعلى النتائج', 'ترشيح من المساعد الذكي', 'إحصائيات متقدمة في لوحة التحكم'],
      en: ['All Standard plan features', 'Exclusive "Premium Verified" badge', 'Top search results placement', 'AI Assistant recommendation', 'Advanced dashboard statistics'],
    },
    cta: { fr: 'Devenir Premium', ar: 'انضم إلى Premium', en: 'Go Premium' },
    popular: false,
    tier: 'premium' as const,
  },
];

export const PricingSection = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [billing, setBilling] = useState<BillingPeriod>('monthly');
  const t = i18n[language];
  const isRTL = language === 'ar';
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          {/* Audience Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-primary/10 border border-primary/20 rounded-full">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">{t.audienceLabel}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            {t.title}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed mb-2">
            {t.subtitle} <span className="font-semibold text-foreground">{t.subtitleBold}</span>{t.subtitleEnd}
          </p>
          <p className="text-xs text-muted-foreground/80 max-w-md mx-auto italic">
            {t.citizenFreeNote}
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center bg-muted rounded-full p-1 gap-0.5">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300',
                billing === 'monthly'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {billing === 'monthly' && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.monthly}</span>
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300',
                billing === 'annual'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {billing === 'annual' && (
                <motion.div
                  layoutId="billing-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {t.annual}
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  -20%
                </span>
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isPremium = plan.tier === 'premium';
            const isPopular = plan.popular;
            const price = billing === 'monthly' ? plan.monthlyPrice[language] : plan.annualPrice[language];
            const period = typeof plan.period[billing] === 'string'
              ? plan.period[billing] as string
              : (plan.period[billing] as Record<string, string>)[language];

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className="relative"
              >
                {/* Popular label */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-0 right-0 flex justify-center z-10">
                    <span className="bg-primary text-primary-foreground text-[11px] font-semibold px-4 py-1 rounded-full shadow-md shadow-primary/25">
                      {t.popular}
                    </span>
                  </div>
                )}

                <div
                  className={cn(
                    'h-full rounded-2xl p-[1px] transition-all duration-300',
                    isPopular
                      ? 'bg-gradient-to-b from-primary/60 via-primary/20 to-primary/5 shadow-xl shadow-primary/10'
                      : isPremium
                        ? 'bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent'
                        : 'bg-border hover:bg-primary/20'
                  )}
                >
                  <div className={cn(
                    'h-full rounded-[15px] bg-card flex flex-col p-6',
                    isPopular && 'pt-8'
                  )}>
                    {/* Plan header */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center',
                          isPremium
                            ? 'bg-amber-500/10'
                            : isPopular
                              ? 'bg-primary/10'
                              : 'bg-muted'
                        )}>
                          <Icon className={cn(
                            'h-4.5 w-4.5',
                            isPremium
                              ? 'text-amber-500'
                              : isPopular
                                ? 'text-primary'
                                : 'text-muted-foreground'
                          )} />
                        </div>
                        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{plan.subtitle[language]}</p>
                    </div>

                    {/* Price with animation */}
                    <div className="mb-5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={billing}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-baseline gap-1"
                        >
                          <span className="text-4xl font-extrabold tracking-tight text-foreground">{price}</span>
                          {period && (
                            <span className="text-sm text-muted-foreground font-medium">{period}</span>
                          )}
                        </motion.div>
                      </AnimatePresence>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Check className="h-3 w-3" />
                          {t.freeYear}
                        </span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border mb-5" />

                    {/* Features */}
                    <ul className="space-y-3 flex-1 mb-6">
                      {plan.features[language].map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <div className={cn(
                            'w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                            isPremium
                              ? 'bg-amber-500/10'
                              : 'bg-primary/10'
                          )}>
                            <Check className={cn(
                              'h-2.5 w-2.5',
                              isPremium ? 'text-amber-500' : 'text-primary'
                            )} />
                          </div>
                          <span className="text-sm text-muted-foreground leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      className={cn(
                        'w-full h-11 font-semibold text-sm gap-2 rounded-xl transition-all',
                        isPopular && 'shadow-md shadow-primary/20',
                        isPremium && 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                      )}
                      variant={isPopular ? 'default' : isPremium ? 'default' : 'outline'}
                      onClick={() => navigate('/provider/register')}
                    >
                      {plan.cta[language]}
                      <ArrowIcon className="h-4 w-4 rtl-flip" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-10"
        >
          {t.bottomNote}
        </motion.p>
      </div>
    </section>
  );
};
