import { Link } from 'react-router-dom';
import { 
  Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin,
  Stethoscope, Globe, ShieldCheck, Droplets, BookOpen, Search, Map,
  Siren, Bot, User, UserPlus, ArrowRight, Smartphone,
  Users, Megaphone, FlaskConical, HandHeart, CreditCard, Code, FileText,
  IdCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { AIHealthAssistant } from '@/components/AIHealthAssistant';
import { Logo } from '@/components/ui/Logo';

const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const linkHover = {
  rest: { x: 0 },
  hover: { x: 4, transition: { duration: 0.2, ease: 'easeOut' } },
};

const iconPop = {
  rest: { scale: 1 },
  hover: { scale: 1.25, transition: { type: 'spring', stiffness: 400, damping: 12 } },
};

interface FooterLink { label: string; href: string; icon: React.ElementType }

const AnimatedLinkList = ({ links }: { links: FooterLink[] }) => (
  <ul className="space-y-2.5">
    {links.map((link) => (
      <motion.li key={link.href + link.label} initial="rest" whileHover="hover" animate="rest">
        <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
          <motion.span variants={iconPop} className="shrink-0">
            <link.icon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
          </motion.span>
          <motion.span variants={linkHover}>{link.label}</motion.span>
        </Link>
      </motion.li>
    ))}
  </ul>
);

const Footer = () => {
  const { language, setLanguage, isRTL, t } = useLanguage();

  const tri = (fr: string, en: string, ar: string) =>
    language === 'ar' ? ar : language === 'en' ? en : fr;

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/cityhealth', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/cityhealth', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/cityhealth', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/cityhealth', label: 'LinkedIn' }
  ];

  const languages = [
    { code: 'fr', name: 'FR', flag: '🇫🇷' },
    { code: 'ar', name: 'عربي', flag: '🇩🇿' },
    { code: 'en', name: 'EN', flag: '🇬🇧' }
  ];

  const servicesLinks: FooterLink[] = [
    { label: t('footer', 'searchDoctors'), href: '/search', icon: Search },
    { label: t('footer', 'interactiveMap'), href: '/map/providers', icon: Map },
    { label: t('footer', 'emergency247'), href: '/map/emergency', icon: Siren },
    { label: t('footer', 'aiAssistant'), href: '/medical-assistant', icon: Bot },
    { label: t('footer', 'bloodDonation'), href: '/blood-donation', icon: Droplets },
    { label: tri('Carte sang', 'Blood Map', 'خريطة الدم'), href: '/map/blood', icon: Map },
    { label: tri('Carte d\'urgence', 'Emergency Card', 'بطاقة الطوارئ'), href: '/citizen/dashboard', icon: IdCard },
  ];

  const communityLinks: FooterLink[] = [
    { label: tri('Forum communauté', 'Community Forum', 'منتدى المجتمع'), href: '/community', icon: Users },
    { label: tri('Entraide citoyenne', 'Community Aid', 'المساعدة المجتمعية'), href: '/citizen/provide', icon: HandHeart },
    { label: tri('Annonces médicales', 'Medical Ads', 'الإعلانات الطبية'), href: '/annonces', icon: Megaphone },
    { label: tri('Hub recherche', 'Research Hub', 'مركز الأبحاث'), href: '/research', icon: FlaskConical },
  ];

  const professionalsLinks: FooterLink[] = [
    { label: t('footer', 'becomePartner'), href: '/provider/register', icon: UserPlus },
    { label: tri('Tarifs', 'Pricing', 'الأسعار'), href: '/tarifs', icon: CreditCard },
    { label: t('footer', 'documentation'), href: '/docs', icon: BookOpen },
    { label: tri('Portail développeurs', 'Developer Portal', 'بوابة المطورين'), href: '/developers', icon: Code },
    { label: tri('API Docs', 'API Docs', 'وثائق API'), href: '/developers/docs', icon: FileText },
    { label: t('footer', 'verificationCharter'), href: '/how', icon: ShieldCheck },
  ];

  const legalLinks = [
    { label: t('footer', 'faq'), href: '/faq' },
    { label: t('footer', 'privacy'), href: '/privacy' },
    { label: t('footer', 'terms'), href: '/terms' },
    { label: t('footer', 'contact'), href: '/contact' },
  ];

  return (
    <footer className={`bg-muted/20 border-t border-border/40 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-5">
          
          {/* Column 1: Brand + Contact */}
          <motion.div
            className="sm:col-span-2 lg:col-span-1"
            variants={columnVariants} custom={0}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          >
            <div className="mb-5">
              <Logo size="md" showText={true} showOnlineIndicator={true} />
            </div>
            
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {t('footer', 'platformDescription')}
            </p>

            <div className="space-y-2 text-sm mb-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                <span>{t('homepage', 'locationBadge')}</span>
              </div>
              <a href="tel:+21348000000" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary/70 shrink-0" />
                <span dir="ltr">+213 48 XX XX XX</span>
              </a>
              <a href="mailto:contact@cityhealth.dz" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-primary/70 shrink-0" />
                <span>contact@cityhealth.dz</span>
              </a>
            </div>

            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label={social.label}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Services */}
          <motion.div
            variants={columnVariants} custom={1}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'services')}
            </h4>
            <AnimatedLinkList links={servicesLinks} />
          </motion.div>

          {/* Column 3: Community */}
          <motion.div
            variants={columnVariants} custom={2}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {tri('Communauté', 'Community', 'المجتمع')}
            </h4>
            <AnimatedLinkList links={communityLinks} />
          </motion.div>

          {/* Column 4: Professionals */}
          <motion.div
            variants={columnVariants} custom={3}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'professionals')}
            </h4>
            <AnimatedLinkList links={professionalsLinks} />
          </motion.div>

          {/* Column 5: Login */}
          <motion.div
            variants={columnVariants} custom={4}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'login')}
            </h4>
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <Link to="/citizen/login" className="group block p-3 rounded-xl bg-accent/5 hover:bg-accent/10 border border-border/50 hover:border-primary/30 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{t('footer', 'citizenSpace')}</p>
                      <p className="text-xs text-muted-foreground truncate">{t('footer', 'patientsIndividuals')}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary rtl-flip transition-all shrink-0" />
                  </div>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <Link to="/provider/login" className="group block p-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-border/50 hover:border-primary/30 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{t('footer', 'practitionerSpace')}</p>
                      <p className="text-xs text-muted-foreground truncate">{t('footer', 'doctorsEstablishments')}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary rtl-flip transition-all shrink-0" />
                  </div>
                </Link>
              </motion.div>

              <div className="pt-2 border-t border-border/30">
                <Link to="/citizen/register" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  {t('footer', 'createCitizenAccount')}
                  <ArrowRight className="h-3 w-3 rtl-flip" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Column 6: Legal + Language + Extension */}
          <motion.div
            variants={columnVariants} custom={5}
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              {t('footer', 'legal')}
            </h4>
            <ul className="space-y-2.5 mb-5">
              {legalLinks.map((link) => (
                <motion.li key={link.href} initial="rest" whileHover="hover" animate="rest">
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    <motion.span variants={linkHover} className="inline-block">
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            {/* Browser Extension CTA */}
            <motion.a
              href="https://drive.google.com/file/d/1TzuMuHPs8EsYVSXA03Olya1h8RX31PWm/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-3 rounded-xl bg-accent/5 hover:bg-accent/10 border border-border/50 hover:border-primary/30 transition-all duration-200 mb-5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {tri('Extension Navigateur', 'Browser Extension', 'إضافة المتصفح')}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tri('Télécharger gratuitement', 'Free download', 'تحميل مجاني')}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary rtl-flip transition-all shrink-0" />
              </div>
            </motion.a>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {t('footer', 'language')}
                </span>
              </div>
              <div className="flex gap-1.5">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage(lang.code as 'fr' | 'ar' | 'en')}
                    className={`h-8 px-2.5 text-xs ${
                      language === lang.code 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-primary/10 border-border/50'
                    }`}
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Download App Section */}
        <motion.div
          className="mt-10 pt-8 border-t border-border/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50">
              <div className="flex-shrink-0 p-3 bg-background rounded-xl shadow-sm border border-border/30">
                <QRCodeSVG 
                  value="https://play.google.com/store/apps/details?id=com.cityhealth.app"
                  size={80} level="M" includeMargin={false}
                  fgColor="hsl(var(--foreground))" bgColor="transparent"
                />
              </div>
              
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">{t('footer', 'downloadApp')}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3 max-w-xs">{t('footer', 'downloadAppDesc')}</p>
                
                <motion.a
                  href="https://play.google.com/store/apps/details?id=com.cityhealth.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] opacity-80 leading-none">{t('footer', 'downloadOn')}</div>
                    <div className="text-sm font-semibold leading-tight">Google Play</div>
                  </div>
                </motion.a>
              </div>
            </div>

            <motion.div
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-destructive/5 border border-destructive/20"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Heart className="h-5 w-5 text-destructive animate-pulse" />
              <div className="flex items-center gap-2">
                <span className="font-medium text-destructive text-sm">{t('footer', 'emergencyLabel')}</span>
                <span className="text-2xl font-bold text-destructive">15</span>
                <span className="text-xs text-destructive/70">24h/24</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
            <span>© {new Date().getFullYear()} CityHealth. {t('footer', 'allRightsReserved')}</span>
            <div className="flex items-center gap-1.5">
              <span>{t('footer', 'madeWith')}</span>
              <Heart className="h-3.5 w-3.5 text-destructive fill-destructive" />
              <span>{t('footer', 'inAlgeria')}</span>
              <span>🇩🇿</span>
            </div>
          </div>
        </div>
      </div>
      
      <AIHealthAssistant />
    </footer>
  );
};

export default Footer;