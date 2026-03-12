import { Star, MapPin, ArrowRight, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: string;
  name: string;
  initials: string;
  avatar: string;
  text: string;
  role: string;
  location: string;
  rating: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

export const TestimonialsSlider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Testimonial content stays in original language (French) — only section headers are translated
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Amira Khelifi',
      initials: 'AK',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      text: "CityHealth m'a permis de trouver rapidement un excellent cardiologue près de chez moi. Je recommande vivement !",
      role: t('homepage', 'patientFemale'),
      location: 'Sidi Bel Abbès',
      rating: 5,
    },
    {
      id: '2',
      name: 'Mohamed Benali',
      initials: 'MB',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      text: "J'ai pu prendre rendez-vous en quelques clics avec un dentiste de qualité. Le service est exceptionnel.",
      role: t('homepage', 'patient'),
      location: 'Oran',
      rating: 5,
    },
    {
      id: '3',
      name: 'Sarah Larbi',
      initials: 'SL',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      text: "Application très utile pour trouver des pharmacies de garde. Les informations sont toujours à jour.",
      role: t('homepage', 'patientFemale'),
      location: 'Alger',
      rating: 5,
    },
    {
      id: '4',
      name: 'Dr. Karim Mansouri',
      initials: 'KM',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face',
      text: "En tant que médecin, je recommande CityHealth à tous mes patients. La vérification est rigoureuse.",
      role: t('homepage', 'doctorRole'),
      location: 'Sidi Bel Abbès',
      rating: 5,
    },
    {
      id: '5',
      name: 'Fatima Zeroual',
      initials: 'FZ',
      avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
      text: "La carte interactive m'aide à trouver les urgences les plus proches rapidement. Indispensable !",
      role: t('homepage', 'patientFemale'),
      location: 'Tlemcen',
      rating: 5,
    },
    {
      id: '6',
      name: 'Youcef Hamidi',
      initials: 'YH',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      text: "Excellent service, praticiens vérifiés et prise de rendez-vous simplifiée. Top !",
      role: t('homepage', 'patient'),
      location: 'Constantine',
      rating: 5,
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden" aria-labelledby="testimonials-title">
      <div className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />
      
      <div className="container mx-auto max-w-6xl px-4 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground bg-background border border-border rounded-full mb-3">
              {t('homepage', 'verifiedReviews')}
            </span>
            <h2 id="testimonials-title" className="text-2xl font-bold text-foreground mb-2">
              {t('homepage', 'testimonials')}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t('homepage', 'whatUsersSay')}
            </p>
          </div>
          
          <div className="hidden sm:flex items-center gap-1">
            <button 
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll left"
            >
              <ArrowRight className="h-4 w-4 rotate-180 rtl-flip" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <ArrowRight className="h-4 w-4 rtl-flip" />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          ref={scrollRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-[max(1rem,calc((100vw-72rem)/2+1rem))] pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex-shrink-0 w-[320px]"
            >
              <div className="group relative p-5 bg-card border border-border rounded-xl hover:border-foreground/20 hover:shadow-lg transition-all duration-300 h-full">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-muted/50 group-hover:text-muted transition-colors" />
                
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                  ))}
                </div>
                
                <p className="text-sm text-foreground leading-relaxed mb-6 line-clamp-4">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-muted border-2 border-border items-center justify-center text-xs font-semibold text-muted-foreground hidden">
                      {testimonial.initials}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {testimonial.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{testimonial.role}</span>
                      <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <div className="sm:hidden flex justify-center gap-1 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
        ))}
      </div>
    </section>
  );
};
