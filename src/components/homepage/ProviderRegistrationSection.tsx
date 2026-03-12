import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, FileText, ShieldCheck, Building2, Stethoscope, Pill, FlaskConical, ScanLine, Syringe, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { PROVIDER_TYPES } from '@/constants/providerTypes';

const content = {
  fr: {
    badge: 'Pour les Professionnels de Santé',
    title: 'Rejoignez CityHealth',
    titleAccent: 'gratuitement',
    subtitle: 'Inscrivez votre établissement et commencez à recevoir des patients à Sidi Bel Abbès dès aujourd\'hui.',
    cta: 'Commencer l\'inscription',
    ctaSub: 'Gratuit • Aucun engagement',
    steps: [
      { title: 'Choisissez votre type', desc: 'Sélectionnez votre spécialité parmi nos catégories.' },
      { title: 'Complétez votre profil', desc: 'Ajoutez vos informations, horaires et services.' },
      { title: 'Vérification & publication', desc: 'Notre équipe valide votre profil sous 24h.' },
    ],
    benefits: [
      'Visibilité accrue auprès des patients',
      'Gestion simplifiée des rendez-vous',
      'Profil professionnel vérifié',
      'Statistiques et analytics détaillés',
    ],
  },
  ar: {
    badge: 'لمتخصصي الرعاية الصحية',
    title: 'انضم إلى CityHealth',
    titleAccent: 'مجانًا',
    subtitle: 'سجّل مؤسستك وابدأ في استقبال المرضى في سيدي بلعباس اليوم.',
    cta: 'ابدأ التسجيل',
    ctaSub: 'مجاني • بدون التزام',
    steps: [
      { title: 'اختر نوعك', desc: 'حدد تخصصك من بين فئاتنا.' },
      { title: 'أكمل ملفك', desc: 'أضف معلوماتك وساعات العمل والخدمات.' },
      { title: 'التحقق والنشر', desc: 'فريقنا يتحقق من ملفك خلال 24 ساعة.' },
    ],
    benefits: [
      'رؤية متزايدة للمرضى',
      'إدارة مبسطة للمواعيد',
      'ملف تعريف مهني موثق',
      'إحصائيات وتحليلات مفصلة',
    ],
  },
  en: {
    badge: 'For Healthcare Professionals',
    title: 'Join CityHealth',
    titleAccent: 'for free',
    subtitle: 'Register your facility and start receiving patients in Sidi Bel Abbès today.',
    cta: 'Start Registration',
    ctaSub: 'Free • No commitment',
    steps: [
      { title: 'Choose your type', desc: 'Select your specialty from our categories.' },
      { title: 'Complete your profile', desc: 'Add your info, schedule, and services.' },
      { title: 'Verification & publish', desc: 'Our team validates your profile within 24h.' },
    ],
    benefits: [
      'Increased visibility to patients',
      'Simplified appointment management',
      'Verified professional profile',
      'Detailed statistics and analytics',
    ],
  },
};

const stepIcons = [UserPlus, FileText, ShieldCheck];

const providerTypes = [
  { key: PROVIDER_TYPES.HOSPITAL, icon: Building2, label: { fr: 'Hôpital', ar: 'مستشفى', en: 'Hospital' } },
  { key: PROVIDER_TYPES.CLINIC, icon: Building2, label: { fr: 'Clinique', ar: 'عيادة', en: 'Clinic' } },
  { key: PROVIDER_TYPES.DOCTOR, icon: Stethoscope, label: { fr: 'Médecin', ar: 'طبيب', en: 'Doctor' } },
  { key: PROVIDER_TYPES.PHARMACY, icon: Pill, label: { fr: 'Pharmacie', ar: 'صيدلية', en: 'Pharmacy' } },
  { key: PROVIDER_TYPES.LAB, icon: FlaskConical, label: { fr: 'Laboratoire', ar: 'مختبر', en: 'Laboratory' } },
  { key: PROVIDER_TYPES.RADIOLOGY_CENTER, icon: ScanLine, label: { fr: 'Radiologie', ar: 'أشعة', en: 'Radiology' } },
  { key: PROVIDER_TYPES.DENTIST, icon: Stethoscope, label: { fr: 'Dentiste', ar: 'طبيب أسنان', en: 'Dentist' } },
  { key: PROVIDER_TYPES.BLOOD_CABIN, icon: Syringe, label: { fr: 'Cabine de sang', ar: 'كابينة دم', en: 'Blood Cabin' } },
];

export const ProviderRegistrationSection = () => {
  const { language, isRTL } = useLanguage();
  const t = content[language];

  return (
    <section className={`py-20 md:py-28 px-4 relative overflow-hidden border-t-4 border-primary/30 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.08] rounded-full blur-3xl" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
            <Sparkles className="h-3 w-3" />
            {t.badge}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {t.title}{' '}
            <span className="text-primary">{t.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-base">{t.subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-14">
          {/* Left: Steps timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              {t.steps.map((step, i) => {
                const Icon = stepIcons[i];
                return (
                  <div key={i} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="h-12 w-12 rounded-xl bg-card border-2 border-primary/20 flex items-center justify-center shadow-sm">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                      {i < t.steps.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-2" />
                      )}
                    </div>
                    <div className="pt-1 pb-4">
                      <h3 className="font-semibold text-foreground text-sm mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Benefits + Provider types */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-3 mb-8">
              {t.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Provider types pills */}
            <div className="flex flex-wrap gap-2">
              {providerTypes.map((pt) => (
                <div
                  key={pt.key}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border/60 hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200 cursor-default"
                >
                  <pt.icon className="h-3.5 w-3.5 text-primary/70" />
                  <span className="text-xs font-medium text-foreground/80">{pt.label[language]}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Link to="/provider/register">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-full bg-primary hover:bg-primary/90 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)] hover:shadow-[0_6px_28px_-4px_hsl(var(--primary)/0.5)] transition-all duration-300 group ring-4 ring-primary/20 animate-pulse hover:animate-none"
            >
              {t.cta}
              <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1.5 transition-transform duration-300`} size={18} />
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">{t.ctaSub}</p>
        </motion.div>
      </div>
    </section>
  );
};
