import { motion } from 'framer-motion';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import CounterAnimation from '@/components/CounterAnimation';
import { SectionHeader } from './SectionHeader';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

// Import stat images
import doctorsTeamImg from '@/assets/stats/doctors-team.jpg';
import algeriaMapImg from '@/assets/stats/algeria-map.jpg';
import happyPatientsImg from '@/assets/stats/happy-patients.jpg';
import ratingStarsImg from '@/assets/stats/rating-stars.jpg';

interface Stat {
  image: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

export const StatsSection = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  
  const stats: Stat[] = [
    {
      image: doctorsTeamImg,
      value: 287,
      suffix: '',
      label: t('homepage', 'activeDoctors'),
      description: t('homepage', 'activeDoctorsDesc'),
    },
    {
      image: algeriaMapImg,
      value: 12,
      suffix: '',
      label: t('homepage', 'coveredMunicipalities'),
      description: t('homepage', 'coveredMunicipalitiesDesc'),
    },
    {
      image: happyPatientsImg,
      value: 15420,
      suffix: '',
      label: t('homepage', 'appointments'),
      description: t('homepage', 'appointmentsDesc'),
    },
    {
      image: ratingStarsImg,
      value: 4.7,
      suffix: '/5',
      label: t('homepage', 'averageRatingLabel'),
      description: t('homepage', 'averageRatingDesc'),
    },
  ];

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 360;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <SectionHeader
              badge={t('homepage', 'statistics')}
              badgeIcon={TrendingUp}
              title={t('homepage', 'ourResults').split(' ')[0] || ''}
              titleHighlight={t('homepage', 'ourResults').split(' ').slice(1).join(' ') || t('homepage', 'ourResults')}
              subtitle={t('homepage', 'resultsSubtitle')}
              subtitleHighlights={[]}
              showDecorator={false}
            />
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <Button variant="outline" size="icon" onClick={() => scroll('left')} className="rounded-full w-12 h-12 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" aria-label="Scroll left">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll('right')} className="rounded-full w-12 h-12 border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" aria-label="Scroll right">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <motion.div
            ref={scrollContainerRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="flex-shrink-0 w-[320px]"
              >
                <div className="group relative h-[400px] overflow-hidden rounded-3xl bg-card border border-border/50 shadow-lg hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-500">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={stat.image} 
                      alt={stat.label}
                      loading="lazy"
                      width={320}
                      height={192}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  </div>

                  <div className="relative p-6 -mt-8">
                    <div className="inline-flex items-baseline gap-1 px-5 py-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                      <span className="text-4xl font-bold text-primary">
                        <CounterAnimation end={stat.value} duration={2500} suffix="" />
                      </span>
                      {stat.suffix && (
                        <span className="text-2xl font-bold text-primary">{stat.suffix}</span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {stat.label}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {stat.description}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 mt-6 md:hidden"
        >
          <span className="text-sm text-muted-foreground">{t('homepage', 'swipeMore')}</span>
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="h-4 w-4 text-primary rtl-flip" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
