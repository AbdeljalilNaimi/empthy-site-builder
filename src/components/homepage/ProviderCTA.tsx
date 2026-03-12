import { ArrowRight, Briefcase, CheckCircle, Building2, FlaskConical, Pill, Stethoscope, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export const ProviderCTA = () => {
  const { isRTL, language } = useLanguage();

  const benefits = {
    fr: [
      'Visibilité accrue auprès des patients',
      'Gestion simplifiée des rendez-vous',
      'Profil professionnel vérifié',
      'Statistiques et analytics détaillés'
    ],
    ar: [
      'رؤية متزايدة للمرضى',
      'إدارة مبسطة للمواعيد',
      'ملف تعريف مهني موثق',
      'إحصائيات وتحليلات مفصلة'
    ],
    en: [
      'Increased visibility to patients',
      'Simplified appointment management',
      'Verified professional profile',
      'Detailed statistics and analytics'
    ]
  };

  const providerTypeLabels: Record<string, { fr: string; ar: string; en: string }> = {
    clinics: { fr: 'Cliniques', ar: 'عيادات', en: 'Clinics' },
    labs: { fr: 'Laboratoires', ar: 'مختبرات', en: 'Laboratories' },
    pharmacies: { fr: 'Pharmacies', ar: 'صيدليات', en: 'Pharmacies' },
    doctors: { fr: 'Médecins', ar: 'أطباء', en: 'Doctors' },
  };

  const providerTypes = [
    { icon: Building2, label: providerTypeLabels.clinics[language], color: 'from-blue-500 to-blue-600' },
    { icon: FlaskConical, label: providerTypeLabels.labs[language], color: 'from-purple-500 to-purple-600' },
    { icon: Pill, label: providerTypeLabels.pharmacies[language], color: 'from-emerald-500 to-emerald-600' },
    { icon: Stethoscope, label: providerTypeLabels.doctors[language], color: 'from-rose-500 to-rose-600' },
  ];

  const content = {
    fr: {
      badge: 'Pour les professionnels',
      title: 'Vous êtes un professionnel de santé ?',
      subtitle: 'Rejoignez notre plateforme gratuitement et développez votre patientèle à Sidi Bel Abbès',
      cta: 'Inscrire mon établissement',
      premium: 'Premium',
      premiumDesc: 'Accès prioritaire pour les établissements spécialisés',
      stats: '+500',
      statsLabel: 'Professionnels inscrits'
    },
    ar: {
      badge: 'للمحترفين',
      title: 'هل أنت متخصص في الرعاية الصحية؟',
      subtitle: 'انضم إلى منصتنا مجانًا وطور قاعدة مرضاك في سيدي بلعباس',
      cta: 'تسجيل مؤسستي',
      premium: 'مميز',
      premiumDesc: 'أولوية الوصول للمؤسسات المتخصصة',
      stats: '+500',
      statsLabel: 'محترف مسجل'
    },
    en: {
      badge: 'For Professionals',
      title: 'Are you a healthcare professional?',
      subtitle: 'Join our platform for free and grow your patient base in Sidi Bel Abbès',
      cta: 'Register my facility',
      premium: 'Premium',
      premiumDesc: 'Priority access for specialized facilities',
      stats: '+500',
      statsLabel: 'Registered professionals'
    }
  };

  const t = content[language];

  return (
    <section className={`py-12 sm:py-16 md:py-20 px-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      <div className="hidden sm:block absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="hidden sm:block absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <Card className="glass-card border-primary/20 shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Left Side */}
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full w-fit mb-6">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm font-semibold">{t.badge}</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t.title}
                </h2>
                
                <p className="text-base sm:text-lg text-muted-foreground mb-8">
                  {t.subtitle}
                </p>

                <div className="space-y-3 mb-8">
                  {benefits[language].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Link to="/provider/register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-6 py-4 text-base sm:px-8 sm:py-6 sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all group w-full sm:w-auto"
                    aria-label="Register your healthcare practice"
                  >
                    {t.cta}
                    <ArrowRight className={`${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} size={18} />
                  </Button>
                </Link>
              </div>

              {/* Right Side - Premium Design */}
              <div className="flex flex-col items-center justify-center gap-6">
                {/* Premium Badge */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 blur-xl opacity-30" />
                  <Badge className="relative bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                    <Crown className="h-4 w-4 mr-2" />
                    {t.premium}
                    <Sparkles className="h-3 w-3 ml-2" />
                  </Badge>
                </div>

                {/* Provider Type Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm">
                  {providerTypes.map((type, index) => (
                    <div 
                      key={index}
                      className="group relative p-3 sm:p-4 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-primary/50 transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <type.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{type.label}</p>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="text-center mt-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t.stats}</p>
                  <p className="text-muted-foreground text-sm">{t.statsLabel}</p>
                </div>

                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  {t.premiumDesc}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
