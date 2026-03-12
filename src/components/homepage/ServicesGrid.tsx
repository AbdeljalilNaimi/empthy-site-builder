import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Gift, Droplets, Search, Map, Siren, BotMessageSquare, Megaphone, MessageSquareHeart, FileText, Mail, type LucideIcon } from 'lucide-react';

/* ─── Service card data ─── */
interface ServiceCard {
  title: { fr: string; ar: string; en: string };
  description: { fr: string; ar: string; en: string };
  route: string;
  icon: LucideIcon;
  color: string;
}

const row1Services: ServiceCard[] = [
  { title: { fr: 'Don Gratuit', ar: 'تبرع مجاني', en: 'Free Donation' }, description: { fr: 'Offrez ou trouvez de l\'aide communautaire gratuite', ar: 'قدّم أو اعثر على مساعدة مجتمعية مجانية', en: 'Offer or find free community help' }, route: '/citizen/provide', icon: Gift, color: 'text-emerald-500' },
  { title: { fr: 'Don de Sang', ar: 'التبرع بالدم', en: 'Blood Donation' }, description: { fr: 'Sauvez des vies en donnant votre sang', ar: 'أنقذ حياة بالتبرع بدمك', en: 'Save lives by donating blood' }, route: '/blood-donation', icon: Droplets, color: 'text-red-500' },
  { title: { fr: 'Recherche', ar: 'بحث', en: 'Search' }, description: { fr: 'Trouvez le bon médecin ou spécialiste', ar: 'اعثر على الطبيب أو الأخصائي المناسب', en: 'Find the right doctor or specialist' }, route: '/search', icon: Search, color: 'text-blue-500' },
  { title: { fr: 'Carte Interactive', ar: 'خريطة تفاعلية', en: 'Interactive Map' }, description: { fr: 'Explorez les établissements autour de vous', ar: 'استكشف المرافق الصحية حولك', en: 'Explore nearby healthcare facilities' }, route: '/map/providers', icon: Map, color: 'text-teal-500' },
  { title: { fr: 'Urgences', ar: 'طوارئ', en: 'Emergency' }, description: { fr: 'Accès rapide aux services d\'urgence 24/7', ar: 'وصول سريع لخدمات الطوارئ على مدار الساعة', en: 'Quick access to 24/7 emergency services' }, route: '/emergency', icon: Siren, color: 'text-orange-500' },
  { title: { fr: 'Assistante IA', ar: 'مساعدة ذكية', en: 'AI Assistant' }, description: { fr: 'Évaluez vos symptômes avec l\'IA', ar: 'قيّم أعراضك بالذكاء الاصطناعي', en: 'Evaluate your symptoms with AI' }, route: '/medical-assistant', icon: BotMessageSquare, color: 'text-violet-500' },
];

const row2Services: ServiceCard[] = [
  { title: { fr: 'Annonces', ar: 'إعلانات', en: 'Announcements' }, description: { fr: 'Découvrez les offres des professionnels', ar: 'اكتشف عروض المتخصصين', en: 'Discover professional offers' }, route: '/annonces', icon: Megaphone, color: 'text-amber-500' },
  { title: { fr: 'Avis & Idées', ar: 'آراء وأفكار', en: 'Reviews & Ideas' }, description: { fr: 'Partagez vos retours et suggestions', ar: 'شارك ملاحظاتك واقتراحاتك', en: 'Share your feedback and suggestions' }, route: '/community', icon: MessageSquareHeart, color: 'text-pink-500' },
  { title: { fr: 'Documents', ar: 'وثائق', en: 'Documents' }, description: { fr: 'Guides et documentation complète', ar: 'أدلة ووثائق شاملة', en: 'Guides and complete documentation' }, route: '/docs', icon: FileText, color: 'text-sky-500' },
  { title: { fr: 'Contact', ar: 'اتصل بنا', en: 'Contact' }, description: { fr: 'Besoin d\'aide ? Contactez-nous', ar: 'تحتاج مساعدة؟ تواصل معنا', en: 'Need help? Contact us' }, route: '/contact', icon: Mail, color: 'text-indigo-500' },
];

const sectionContent = {
  fr: { title: 'Nos Services', subtitle: 'Tous les outils santé dont vous avez besoin — recherche, urgences, don, IA et plus — réunis en un seul endroit.' },
  ar: { title: 'خدماتنا', subtitle: 'جميع الأدوات الصحية التي تحتاجها — بحث، طوارئ، تبرع، ذكاء اصطناعي والمزيد — في مكان واحد.' },
  en: { title: 'Our Services', subtitle: 'All the health tools you need — search, emergency, donation, AI and more — all in one place.' },
};

/* ─── Single card component ─── */
const ServiceCardItem = ({ service, language }: { service: ServiceCard; language: 'fr' | 'ar' | 'en' }) => {
  const navigate = useNavigate();
  const title = service.title[language];
  const description = service.description[language];

  const handleClick = () => navigate(service.route);

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group flex-shrink-0 w-[220px] rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-2 hover:shadow-xl hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer active:scale-[0.97] mx-2.5"
      tabIndex={0}
      aria-label={title}
    >
      {/* Icon area */}
      <div className="h-[110px] bg-muted/30 flex items-center justify-center relative overflow-hidden">
        <service.icon className={`w-12 h-12 ${service.color} group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
      </div>
      {/* Label + Description */}
      <div className="px-3 py-2.5 border-t border-border/30 bg-card text-start">
        <span className="font-semibold text-sm text-foreground leading-tight truncate block">{title}</span>
        <span className="text-xs text-muted-foreground leading-snug line-clamp-2 mt-0.5 block">{description}</span>
      </div>
    </button>
  );
};

/* ─── Marquee row ─── */
const MarqueeRow = ({ services, reverse = false, language }: { services: ServiceCard[]; reverse?: boolean; language: 'fr' | 'ar' | 'en' }) => {
  const items = [...services, ...services, ...services, ...services];
  const isRTL = language === 'ar';
  // In RTL, swap the animation direction so scroll feels natural
  const useReverse = isRTL ? !reverse : reverse;

  return (
    <div className="overflow-hidden w-full group/marquee" dir="ltr">
      <div
        className={`flex w-max ${useReverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover/marquee:[animation-play-state:paused]`}
      >
        {items.map((service, i) => (
          <ServiceCardItem key={`${service.route}-${i}`} service={service} language={language} />
        ))}
      </div>
    </div>
  );
};

/* ─── Heading variants ─── */
const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ─── Component ─── */
export const ServicesGrid = () => {
  const { language } = useLanguage();
  const content = sectionContent[language];

  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {content.title}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* Row 1 */}
        <div className="mb-6">
          <MarqueeRow services={row1Services} language={language} />
        </div>

        {/* Row 2 — reverse */}
        <div>
          <MarqueeRow services={row2Services} reverse language={language} />
        </div>
      </div>
    </section>
  );
};
