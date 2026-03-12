import { Link } from 'react-router-dom';
import { Star, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, MapPin, Shield, Stethoscope, Building2, Pill, FlaskConical, Hospital, Baby, Droplets, RadioTower, Wrench } from 'lucide-react';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { isProviderVerified } from '@/utils/verificationUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface DisplayProvider {
  id: string;
  name: string;
  type: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  image: string;
  city?: string;
}

const typeIcons: Record<string, typeof Stethoscope> = {
  doctor: Stethoscope,
  clinic: Building2,
  pharmacy: Pill,
  lab: FlaskConical,
  hospital: Hospital,
  birth_hospital: Baby,
  blood_cabin: Droplets,
  radiology_center: RadioTower,
  medical_equipment: Wrench,
};

const filterTabs = [
  { key: 'all', label: { fr: 'Tous', ar: 'الكل', en: 'All' } },
  { key: 'doctor', label: { fr: 'Médecins', ar: 'أطباء', en: 'Doctors' } },
  { key: 'pharmacy', label: { fr: 'Pharmacies', ar: 'صيدليات', en: 'Pharmacies' } },
  { key: 'clinic', label: { fr: 'Cliniques', ar: 'عيادات', en: 'Clinics' } },
  { key: 'hospital', label: { fr: 'Hôpitaux', ar: 'مستشفيات', en: 'Hospitals' } },
  { key: 'lab', label: { fr: 'Laboratoires', ar: 'مختبرات', en: 'Laboratories' } },
];

const SkeletonCard = () => (
  <div className="min-w-[260px] max-w-[260px] p-4 bg-card border border-border rounded-2xl space-y-3 flex-shrink-0">
    <Skeleton className="w-full h-24 rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-8 w-full rounded-lg" />
  </div>
);

export const FeaturedProviders = () => {
  const { data: verifiedProviders = [], isLoading } = useVerifiedProviders();
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const allProviders = useMemo(() => {
    return verifiedProviders
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 20)
      .map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        specialty: p.specialty || p.type,
        rating: p.rating || 0,
        reviewCount: p.reviewsCount || 0,
        isVerified: isProviderVerified(p),
        image: p.image || '',
        city: p.city || '',
      }));
  }, [verifiedProviders]);

  const filteredProviders = useMemo(() => {
    if (activeFilter === 'all') return allProviders;
    return allProviders.filter(p => p.type === activeFilter);
  }, [allProviders, activeFilter]);

  const TypeIcon = (type: string) => typeIcons[type] || Stethoscope;

  // Scroll state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [filteredProviders, updateScrollState]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 280;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }, []);

  // Auto-scroll with requestAnimationFrame
  const isPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  isPausedRef.current = isPaused;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let rafId: number;
    let lastTime = 0;
    const speed = 0.5; // pixels per frame at 60fps

    const step = (timestamp: number) => {
      if (!isPausedRef.current && el) {
        const delta = lastTime ? (timestamp - lastTime) / 16.67 : 1;
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2;
        if (atEnd) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += speed * delta;
        }
      }
      lastTime = timestamp;
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [filteredProviders]);

  return (
    <section className="py-20 px-4 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <span className="inline-block px-3 py-1 text-xs font-medium text-muted-foreground bg-muted border border-border rounded-full mb-3">
              {t('featuredProviders', 'topPractitioners')}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('featuredProviders', 'healthProfessionals')}
            </h2>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-muted-foreground hover:text-foreground">
            <Link to="/search">
              {t('featuredProviders', 'viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                activeFilter === tab.key
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {tab.label[language]}
            </button>
          ))}
        </motion.div>

        {/* Horizontally Scrolling Cards */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center bg-muted/30 border border-border rounded-2xl"
          >
            <p className="text-muted-foreground text-sm mb-4">
              {t('featuredProviders', 'noPractitioners')}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/provider/register">
                {t('featuredProviders', 'becomePractitioner')}
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="relative group/carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            {/* Left arrow */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 hidden md:flex w-9 h-9 items-center justify-center rounded-full bg-background border border-border shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
            )}

            {/* Right arrow */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 hidden md:flex w-9 h-9 items-center justify-center rounded-full bg-background border border-border shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>
            )}

            {/* Fade edges */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent z-[5] pointer-events-none hidden md:block" />
            )}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent z-[5] pointer-events-none hidden md:block" />
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {filteredProviders.map((provider, index) => {
                  const Icon = TypeIcon(provider.type);
                  return (
                    <motion.div
                      key={provider.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className="snap-start flex-shrink-0"
                    >
                      <Link
                        to={`/provider/${provider.id}`}
                        className="group relative block w-[260px] bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-foreground/10 transition-all duration-300"
                      >
                        {/* Top visual area */}
                        <div className="relative h-28 bg-muted/50 flex items-center justify-center overflow-hidden">
                          {provider.image && provider.image !== '/placeholder.svg' && provider.image !== '' ? (
                            <img
                              src={provider.image}
                              alt={provider.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <Icon className="h-10 w-10 text-muted-foreground/40" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                          {provider.isVerified && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <Shield className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}

                          {index < 3 && activeFilter === 'all' && (
                            <div className="absolute top-3 left-3 px-2 py-0.5 bg-foreground/90 text-background text-[10px] font-bold rounded-full">
                              #{index + 1}
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors duration-200">
                            {provider.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">{provider.specialty}</span>
                          </div>
                          {provider.city && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground/60" />
                              <span className="text-[11px] text-muted-foreground/60 truncate">{provider.city}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-semibold text-foreground">{provider.rating.toFixed(1)}</span>
                              <span className="text-[11px] text-muted-foreground">({provider.reviewCount})</span>
                            </div>
                            <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {t('providers', 'viewProfile')} →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Mobile CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="sm:hidden mt-6 text-center"
        >
          <Button asChild variant="outline" size="sm">
            <Link to="/search" className="flex items-center gap-2">
              {t('featuredProviders', 'viewAllPractitioners')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
