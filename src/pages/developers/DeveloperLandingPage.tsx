import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Zap, Shield, Rocket, ArrowRight, Terminal, Copy, Check, Globe, Database, Lock, Clock, Hospital, Pill, MapPin, Ambulance, Link2, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const getPlans = (language: string) => [
  {
    name: 'Free',
    price: language === 'ar' ? 'مجاني' : language === 'en' ? 'Free' : 'Gratuit',
    requests: language === 'ar' ? '100 طلب/يوم' : language === 'en' ? '100 req/day' : '100 req/jour',
    features: language === 'ar'
      ? ['البحث عن مقدمي الخدمات', 'الوصول للطوارئ', 'الفئات العامة']
      : language === 'en'
      ? ['Provider search', 'Emergency access', 'Public categories']
      : ['Recherche de prestataires', 'Accès urgences', 'Catégories publiques'],
    cta: language === 'ar' ? 'ابدأ الآن' : language === 'en' ? 'Get Started' : 'Commencer',
    highlight: false,
  },
  {
    name: 'Basic',
    price: language === 'ar' ? '2,000 د.ج/شهر' : language === 'en' ? '2,000 DA/mo' : '2 000 DA/mois',
    requests: language === 'ar' ? '1,000 طلب/يوم' : language === 'en' ? '1,000 req/day' : '1 000 req/jour',
    features: language === 'ar'
      ? ['كل ميزات الخطة المجانية', 'بحث نصي كامل', 'صيدليات المناوبة', 'دعم عبر البريد']
      : language === 'en'
      ? ['Everything in Free', 'Full-text search', 'On-duty pharmacies', 'Email support']
      : ['Tout le plan Free', 'Recherche full-text', 'Pharmacies de garde', 'Support email'],
    cta: language === 'ar' ? 'اختر Basic' : language === 'en' ? 'Choose Basic' : 'Choisir Basic',
    highlight: true,
  },
  {
    name: 'Pro',
    price: language === 'ar' ? '8,000 د.ج/شهر' : language === 'en' ? '8,000 DA/mo' : '8 000 DA/mois',
    requests: language === 'ar' ? '10,000 طلب/يوم' : language === 'en' ? '10,000 req/day' : '10 000 req/jour',
    features: language === 'ar'
      ? ['كل ميزات الخطة الأساسية', 'Webhooks فوري', 'SLA 99.9%', 'دعم ذو أولوية']
      : language === 'en'
      ? ['Everything in Basic', 'Real-time Webhooks', 'SLA 99.9%', 'Priority support']
      : ['Tout le plan Basic', 'Webhooks temps réel', 'SLA 99.9%', 'Support prioritaire'],
    cta: language === 'ar' ? 'اختر Pro' : language === 'en' ? 'Choose Pro' : 'Choisir Pro',
    highlight: false,
  },
];

const codeExample = `curl -X GET \\
  "https://api.cityhealth.dz/v1/providers?type=pharmacy&limit=5" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

const responseExample = `{
  "success": true,
  "data": [
    {
      "id": "prov_abc123",
      "name": "Pharmacie El Amal",
      "type": "pharmacy",
      "is_24h": true,
      "rating": 4.8,
      "lat": 35.1897,
      "lng": -0.6308
    }
  ],
  "meta": { "total": 42, "page": 1 }
}`;



export default function DeveloperLandingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const plans = getPlans(language);
  const [copied, setCopied] = useState(false);

  const { data: dbStats } = useQuery({
    queryKey: ['developer-landing-stats'],
    queryFn: async () => {
      const [providersRes, keysRes, reviewsRes, citiesRes] = await Promise.all([
        supabase.from('providers_public').select('id', { count: 'exact', head: true }),
        supabase.from('api_keys').select('id', { count: 'exact', head: true }),
        supabase.from('provider_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('providers_public').select('city'),
      ]);
      const uniqueCities = new Set(citiesRes.data?.map(p => p.city).filter(Boolean));
      return {
        providers: providersRes.count ?? 0,
        apiKeys: keysRes.count ?? 0,
        reviews: reviewsRes.count ?? 0,
        cities: uniqueCities.size,
      };
    },
    staleTime: 60_000,
  });

  const stats = [
    { value: String(dbStats?.providers ?? '—'), label: language === 'ar' ? 'مقدم خدمة' : language === 'en' ? 'Providers' : 'Prestataires' },
    { value: String(dbStats?.cities ?? '—'), label: language === 'ar' ? 'مدن مغطاة' : language === 'en' ? 'Cities covered' : 'Villes couvertes' },
    { value: String(dbStats?.apiKeys ?? '—'), label: language === 'ar' ? 'مفاتيح API نشطة' : language === 'en' ? 'Active API keys' : 'Clés API actives' },
    { value: String(dbStats?.reviews ?? '—'), label: language === 'ar' ? 'تقييمات' : language === 'en' ? 'Reviews' : 'Avis patients' },
  ];


  const handleCopy = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    badge: language === 'ar' ? 'واجهة برمجة عامة v1' : language === 'en' ? 'Public API v1' : 'API Publique v1',
    heroTitle1: language === 'ar' ? 'ابنِ تطبيقات صحية مع' : language === 'en' ? 'Build Health Apps with' : 'Construisez des apps santé avec',
    heroTitle2: 'CityHealth API',
    heroDesc: language === 'ar'
      ? 'الوصول إلى بيانات الصحة في سيدي بلعباس: مقدمو خدمات معتمدون، صيدليات المناوبة، طوارئ 24/7 — كل ذلك عبر واجهة REST بسيطة وآمنة.'
      : language === 'en'
      ? 'Access verified health data in Sidi Bel Abbès: providers, pharmacies, 24/7 emergencies — all through a secure REST API.'
      : 'Accédez aux données de santé vérifiées de Sidi Bel Abbès : prestataires, pharmacies de garde, urgences 24/7 — via une API REST sécurisée.',
    getKey: language === 'ar' ? 'احصل على مفتاح API' : language === 'en' ? 'Get API Key' : 'Obtenir une clé API',
    docs: 'Documentation',
    whyTitle: language === 'ar' ? 'لماذا CityHealth API؟' : language === 'en' ? 'Why CityHealth API?' : 'Pourquoi CityHealth API ?',
    fastTitle: language === 'ar' ? 'سريع وموثوق' : language === 'en' ? 'Fast & Reliable' : 'Rapide & Fiable',
    fastDesc: language === 'ar'
      ? 'استجابة في أقل من 200 مللي ثانية. بنية تحتية قوية بتوفر 99.9%.'
      : language === 'en'
      ? 'Responses under 200ms. Robust infrastructure with 99.9% uptime.'
      : 'Réponses en moins de 200ms. Infrastructure robuste avec disponibilité 99.9%.',
    secureTitle: language === 'ar' ? 'آمن' : language === 'en' ? 'Secure' : 'Sécurisé',
    secureDesc: language === 'ar'
      ? 'مفاتيح API مشفرة بـ SHA-256. تحديد معدل ذكي. بيانات عامة فقط.'
      : language === 'en'
      ? 'SHA-256 hashed API keys. Smart rate limiting. Public data only.'
      : 'Clés API hachées SHA-256. Rate limiting intelligent. Données publiques uniquement.',
    easyTitle: language === 'ar' ? 'سهل الدمج' : language === 'en' ? 'Easy to Integrate' : 'Facile à intégrer',
    easyDesc: language === 'ar'
      ? 'تنسيق JSON قياسي. وثائق كاملة. أمثلة curl و JavaScript.'
      : language === 'en'
      ? 'Standard JSON format. Complete documentation. curl and JavaScript examples.'
      : 'Format JSON standard. Documentation complète. Exemples curl et JavaScript.',
    pricingTitle: language === 'ar' ? 'الخطط والأسعار' : language === 'en' ? 'Plans & Pricing' : 'Plans & Tarifs',
    popular: language === 'ar' ? 'الأكثر شعبية' : language === 'en' ? 'Popular' : 'Populaire',
    readyTitle: language === 'ar' ? 'مستعد للبدء؟' : language === 'en' ? 'Ready to start building?' : 'Prêt à construire ?',
    readyDesc: language === 'ar'
      ? 'أنشئ حساب مطور واحصل على مفتاح API الخاص بك في أقل من دقيقتين.'
      : language === 'en'
      ? 'Create your developer account and get your API key in less than 2 minutes.'
      : 'Créez votre compte développeur et obtenez votre clé API en moins de 2 minutes.',
    createAccount: language === 'ar' ? 'إنشاء حساب مطور' : language === 'en' ? 'Create Developer Account' : 'Créer un compte développeur',
    tryItTitle: language === 'ar' ? 'جربها الآن' : language === 'en' ? 'Try it now' : 'Essayez maintenant',
    requestLabel: language === 'ar' ? 'طلب' : language === 'en' ? 'Request' : 'Requête',
    responseLabel: language === 'ar' ? 'استجابة' : language === 'en' ? 'Response' : 'Réponse',
    trustedBy: language === 'ar' ? 'موثوق به من قبل المطورين' : language === 'en' ? 'Trusted by Developers' : 'Fait confiance par les développeurs',
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Grid background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--muted)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-transparent to-background" />
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                <Terminal className="h-3.5 w-3.5 mr-2" /> {t.badge}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                {t.heroTitle1}
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  {t.heroTitle2}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                {t.heroDesc}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate('/developers/register')} className="shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                  {t.getKey} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/developers/docs')}>
                  <Code2 className="mr-2 h-4 w-4" /> {t.docs}
                </Button>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-border/50">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Code snippet */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
                {/* Tab header */}
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{t.requestLabel}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <pre className="p-4 text-sm font-mono text-foreground/90 overflow-x-auto">
                  <code>{codeExample}</code>
                </pre>
                
                {/* Response */}
                <div className="px-4 py-2 bg-muted/30 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-mono">{t.responseLabel}</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-400 bg-muted/20 overflow-x-auto max-h-48">
                  <code>{responseExample}</code>
                </pre>
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="absolute -top-4 -right-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-500">SHA-256</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -bottom-4 -left-4 bg-primary/10 border border-primary/30 rounded-xl px-3 py-2 flex items-center gap-2"
              >
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">&lt;200ms</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.whyTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'en' ? 'Everything you need to build healthcare applications' : 
               language === 'ar' ? 'كل ما تحتاجه لبناء تطبيقات الرعاية الصحية' :
               'Tout ce dont vous avez besoin pour construire des applications santé'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: t.fastTitle, desc: t.fastDesc, color: 'text-amber-500' },
              { icon: Shield, title: t.secureTitle, desc: t.secureDesc, color: 'text-emerald-500' },
              { icon: Rocket, title: t.easyTitle, desc: t.easyDesc, color: 'text-primary' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className={cn("h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", feature.color)}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{feature.desc}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Endpoints Preview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {language === 'en' ? 'Powerful Endpoints' : language === 'ar' ? 'نقاط وصول قوية' : 'Endpoints puissants'}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { method: 'GET', path: '/providers', desc: language === 'en' ? 'List all providers' : 'Liste des prestataires' },
              { method: 'GET', path: '/providers/:id', desc: language === 'en' ? 'Get provider details' : 'Détails prestataire' },
              { method: 'GET', path: '/emergency', desc: language === 'en' ? '24/7 emergencies' : 'Urgences 24/7' },
              { method: 'GET', path: '/pharmacies/on-duty', desc: language === 'en' ? 'On-duty pharmacies' : 'Pharmacies de garde' },
            ].map((endpoint, i) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                </div>
                <p className="text-xs text-muted-foreground">{endpoint.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.pricingTitle}</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className={cn(
                  "h-full relative overflow-hidden transition-all duration-300",
                  plan.highlight 
                    ? 'border-primary ring-2 ring-primary/20 shadow-xl shadow-primary/10' 
                    : 'border-border/50 hover:border-primary/30'
                )}>
                  {plan.highlight && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      {t.popular}
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-foreground mt-2">{plan.price}</div>
                    <CardDescription className="text-sm">{plan.requests}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.highlight ? 'default' : 'outline'}
                      onClick={() => navigate('/developers/register')}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials & Logos */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {language === 'en' ? 'Trusted by Developers' : language === 'ar' ? 'موثوق من قبل المطورين' : 'Adopté par les développeurs'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'en' ? 'Teams and developers building with CityHealth API' : language === 'ar' ? 'فرق ومطورون يبنون باستخدام CityHealth API' : 'Des équipes et développeurs construisent avec CityHealth API'}
            </p>
          </motion.div>

          {/* Partner Logos - Horizontal Marquee */}
          <div className="mb-16 py-8 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex items-center gap-12 w-max"
            >
              {[...Array(2)].flatMap((_, dupeIdx) =>
                [
                  { name: 'SBA MedTech', Icon: Hospital },
                  { name: 'PharmaDZ', Icon: Pill },
                  { name: 'HealthMap Pro', Icon: MapPin },
                  { name: 'DZ Emergency', Icon: Ambulance },
                  { name: 'MedConnect', Icon: Link2 },
                  { name: 'Tabib.dz', Icon: Stethoscope },
                ].map((partner) => (
                  <div
                    key={`${partner.name}-${dupeIdx}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors shrink-0 px-4"
                  >
                    <partner.Icon className="w-6 h-6 text-primary" />
                    <span className="font-semibold text-sm md:text-base whitespace-nowrap">{partner.name}</span>
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Amine K.',
                role: language === 'en' ? 'Founder, SBA MedTech' : language === 'ar' ? 'مؤسس SBA MedTech' : 'Fondateur, SBA MedTech',
                quote: language === 'en'
                  ? 'CityHealth API saved us months. We integrated pharmacy locator in our app in just 2 days.'
                  : language === 'ar'
                  ? 'وفّرت لنا CityHealth API أشهرًا من العمل. دمجنا محدد الصيدليات في يومين فقط.'
                  : "CityHealth API nous a fait gagner des mois. On a intégré le localisateur de pharmacies en 2 jours.",
                avatar: '👨‍💻',
              },
              {
                name: 'Sara B.',
                role: language === 'en' ? 'CTO, PharmaDZ' : language === 'ar' ? 'المدير التقني، PharmaDZ' : 'CTO, PharmaDZ',
                quote: language === 'en'
                  ? 'The on-duty pharmacy endpoint is a game-changer. Reliable data, fast responses, great docs.'
                  : language === 'ar'
                  ? 'نقطة وصول صيدليات المناوبة غيّرت قواعد اللعبة. بيانات موثوقة واستجابة سريعة.'
                  : "L'endpoint pharmacies de garde est révolutionnaire. Données fiables, réponses rapides, docs claires.",
                avatar: '👩‍💻',
              },
              {
                name: 'Youcef M.',
                role: language === 'en' ? 'Lead Dev, DZ Emergency' : language === 'ar' ? 'مطور رئيسي، DZ Emergency' : 'Lead Dev, DZ Emergency',
                quote: language === 'en'
                  ? '99.9% uptime is real. Our emergency app relies on it 24/7 and it never lets us down.'
                  : language === 'ar'
                  ? 'التوفر بنسبة 99.9% حقيقي. تطبيق الطوارئ لدينا يعتمد عليه على مدار الساعة.'
                  : "Le 99.9% d'uptime est réel. Notre app d'urgence en dépend 24/7 sans jamais nous décevoir.",
                avatar: '🧑‍💻',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, s) => (
                        <span key={s} className="text-amber-400 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 italic">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                      <span className="text-2xl">{testimonial.avatar}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.readyTitle}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.readyDesc}</p>
          <Button size="lg" onClick={() => navigate('/developers/register')} className="shadow-lg shadow-primary/25">
            {t.createAccount} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
