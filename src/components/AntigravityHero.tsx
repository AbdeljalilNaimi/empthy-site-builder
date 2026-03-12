import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Search, MapPin, Users, CalendarCheck, Star, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Word animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const AntigravityHero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, isRTL } = useLanguage();
  
  // Partner logos
  const partners = [
    { name: t('homepage', 'ministryOfHealth'), initials: 'MS' },
    { name: t('homepage', 'orderOfDoctors'), initials: 'OM' },
    { name: t('homepage', 'chuSBA'), initials: 'CHU' },
    { name: t('homepage', 'cnas'), initials: 'CNAS' },
    { name: t('homepage', 'pharmacists'), initials: 'PH' },
    { name: t('homepage', 'laboratories'), initials: 'LAB' },
  ];

  // Quick search tags
  const quickTags = [
    t('homepage', 'generalDoctor'),
    t('homepage', 'dentist'),
    t('homepage', 'cardiologist'),
    t('homepage', 'pediatrician'),
    t('homepage', 'ophthalmologist'),
    t('homepage', 'emergency247'),
  ];

  // Real stats from DB
  const [providerCount, setProviderCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [providersRes, reviewsRes] = await Promise.all([
          supabase.from('providers_public').select('id', { count: 'exact', head: true }),
          supabase.from('provider_reviews').select('rating'),
        ]);
        if (providersRes.count != null) setProviderCount(providersRes.count);
        if (reviewsRes.data && reviewsRes.data.length > 0) {
          setReviewCount(reviewsRes.data.length);
          const avg = reviewsRes.data.reduce((s, r) => s + r.rating, 0) / reviewsRes.data.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
      } catch (err) {
        console.warn('[AntigravityHero] fetchStats failed:', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { value: providerCount > 0 ? `${providerCount}+` : '—', label: t('homepage', 'practitioners'), icon: Users },
    { value: reviewCount > 0 ? `${reviewCount}+` : '—', label: t('homepage', 'consultations'), icon: CalendarCheck },
    { value: avgRating > 0 ? avgRating.toFixed(1) : '—', label: t('homepage', 'averageRating'), icon: Star },
  ];

  // Mouse tracking for interactive background — cached rect to avoid forced reflow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const cachedRect = useRef<DOMRect | null>(null);
  const rafId = useRef<number>(0);

  const updateRect = useCallback(() => {
    if (containerRef.current) {
      cachedRect.current = containerRef.current.getBoundingClientRect();
    }
  }, []);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect, { passive: true });
    window.addEventListener('scroll', updateRect, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        if (cachedRect.current) {
          mouseX.set(e.clientX - cachedRect.current.left);
          mouseY.set(e.clientY - cachedRect.current.top);
        }
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
        cancelAnimationFrame(rafId.current);
      };
    }
  }, [mouseX, mouseY, updateRect]);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('hero-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery);
    navigate(`/search?${params.toString()}`);
  };

  const handleTagClick = (tag: string) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[85vh] flex items-center justify-center bg-background pt-20 overflow-hidden"
    >
      {/* Interactive Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
            x: springX,
            y: springY,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent) / 0.1) 0%, transparent 60%)',
            x: springX,
            y: springY,
            translateX: '-30%',
            translateY: '-30%',
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-40">
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="currentColor" className="text-border" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
        <svg className="absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
          {[...Array(5)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${10 + i * 20}%`}
              y1="0%"
              x2={`${30 + i * 15}%`}
              y2="100%"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ 
                duration: 3, 
                delay: i * 0.5, 
                ease: 'easeInOut'
              }}
            />
          ))}
        </svg>
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Location Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-muted/50 border border-border rounded-full"
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">{t('homepage', 'locationBadge')}</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight"
          >
            <motion.span variants={wordVariants} className="inline-block">{t('homepage', 'findYourDoctorWord1')}</motion.span>{' '}
            <motion.span variants={wordVariants} className="inline-block">{t('homepage', 'findYourDoctorWord2')}</motion.span>{' '}
            <motion.span 
              variants={wordVariants} 
              className="relative inline-block"
            >
              {t('homepage', 'findYourDoctorWord3')}
              <motion.span 
                className="absolute -bottom-1 left-0 h-3 bg-primary/20 -z-10 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
              />
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            {t('homepage', 'heroSubtitleFull')}
          </motion.p>

          {/* Search Bar */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onSubmit={handleSearch} 
            className="relative max-w-3xl mx-auto mb-6"
          >
            <motion.div 
              className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-xl"
              animate={{ 
                opacity: isFocused ? 0.8 : 0,
                scale: isFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.div 
              className={`relative flex items-center gap-2 p-2 bg-card border-2 rounded-2xl shadow-lg transition-colors ${
                isFocused ? 'border-foreground/30' : 'border-border'
              }`}
              animate={{ scale: isFocused ? 1.01 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-xl flex-shrink-0">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <Input
                id="hero-search"
                type="text"
                placeholder={t('homepage', 'searchPlaceholderDetailed')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 h-12 border-0 bg-transparent focus-visible:ring-0 text-base md:text-lg placeholder:text-muted-foreground/60"
                aria-label={t('homepage', 'searchPlaceholder')}
              />
              
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  type="submit"
                  className="h-12 px-4 sm:px-6 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                >
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('homepage', 'searchButton')}</span>
                </Button>
              </div>
            </motion.div>

            {/* Keyboard shortcut hint */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground"
            >
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">⌘</kbd>
              <span>+</span>
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">K</kbd>
              <span className="ml-1">{t('homepage', 'keyboardHint')}</span>
            </motion.div>
          </motion.form>

          {/* Quick Tags */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mt-10 mb-12"
          >
            <span className="text-xs text-muted-foreground mr-2 self-center">{t('homepage', 'popularLabel')}</span>
            {quickTags.map((tag, index) => (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 text-sm bg-muted/50 border border-border rounded-full hover:bg-muted hover:border-foreground/20 transition-colors"
              >
                {tag}
              </motion.button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center p-4 rounded-xl border border-border/50 bg-card/50"
              >
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <motion.span 
                  className="block text-2xl sm:text-3xl font-bold tabular-nums"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                >
                  {stat.value}
                </motion.span>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Partners */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="relative"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {t('homepage', 'trustedPartners')}
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            
            <div className="relative overflow-hidden py-4">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
              
              <motion.div 
                className="flex items-center gap-6"
                animate={{ x: [0, -50 * partners.length] }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity, 
                  ease: 'linear',
                }}
              >
                {[...partners, ...partners, ...partners].map((partner, i) => (
                  <motion.div
                    key={`${partner.name}-${i}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="flex items-center justify-center w-14 h-14 rounded-xl bg-card border border-border shadow-sm cursor-pointer group flex-shrink-0 relative"
                  >
                    <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      {partner.initials}
                    </span>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <span className="text-xs text-muted-foreground whitespace-nowrap bg-popover px-2 py-1 rounded border border-border shadow-sm">
                        {partner.name}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
