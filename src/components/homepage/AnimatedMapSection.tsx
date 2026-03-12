import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import sbaSatelliteMap from '@/assets/sba-satellite-map.jpg';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVerifiedProviders } from '@/hooks/useProviders';
import { ProviderAvatar } from '@/components/ui/ProviderAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PROVIDER_TYPE_LABELS } from '@/data/providers';
import type { CityHealthProvider } from '@/data/providers';

// SBA area bounds for coordinate normalization
const SBA_BOUNDS = {
  minLat: 35.17, maxLat: 35.22,
  minLng: -0.66, maxLng: -0.60,
};

const toMapPosition = (lat: number, lng: number) => {
  const x = Math.min(90, Math.max(10, ((lng - SBA_BOUNDS.minLng) / (SBA_BOUNDS.maxLng - SBA_BOUNDS.minLng)) * 80 + 10));
  const y = Math.min(85, Math.max(15, ((SBA_BOUNDS.maxLat - lat) / (SBA_BOUNDS.maxLat - SBA_BOUNDS.minLat)) * 70 + 15));
  return { x, y };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const pinVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 20 } },
};

const MAX_DISPLAY = 6;

export const AnimatedMapSection = () => {
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const { t, language } = useLanguage();
  const { data: providers = [], isLoading } = useVerifiedProviders();

  const displayProviders = useMemo(() => providers.slice(0, MAX_DISPLAY), [providers]);

  const mapPins = useMemo(() => 
    displayProviders.map((p: CityHealthProvider) => ({
      ...toMapPosition(p.lat, p.lng),
      id: p.id,
      name: p.name,
      type: p.type,
      image: p.image,
      specialty: p.specialty,
    })),
    [displayProviders]
  );

  const miniCardLabels = useMemo(() => ({
    fr: 'Voir le profil',
    ar: 'عرض الملف',
    en: 'View profile',
  }), []);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t('homepage', 'interactiveMap')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('homepage', 'findNearby')}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="hidden sm:flex">
              <Link to="/map/providers" className="flex items-center gap-2">
                {t('homepage', 'openMap')}
                <ArrowRight className="h-4 w-4 rtl-flip" />
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4 max-w-md">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md border border-border">
                <Search className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('homepage', 'searchPractitioner')}</span>
                <kbd className="ml-auto hidden sm:inline-flex px-1.5 py-0.5 text-[10px] bg-muted rounded border text-muted-foreground">⌘K</kbd>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">carte-sante-sba.cityhealth.dz</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:h-[450px]">
            {/* Provider list */}
            <div className="w-full md:w-1/3 max-h-[220px] md:max-h-none border-b md:border-b-0 md:border-r border-border overflow-auto">
              <div className="p-3">
                <div className="flex items-center justify-between mb-3 px-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t('homepage', 'nearbyPractitioners')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {providers.length} {t('homepage', 'results')}
                  </span>
                </div>

                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))
                ) : displayProviders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {language === 'ar' ? 'لا يوجد مقدمو خدمات حالياً' : language === 'en' ? 'No providers available' : 'Aucun praticien disponible'}
                  </p>
                ) : (
                  displayProviders.map((provider: CityHealthProvider, index: number) => (
                    <motion.div
                      key={provider.id}
                      onMouseEnter={() => { setHoveredProvider(provider.id); setHoveredPin(index); }}
                      onMouseLeave={() => { setHoveredProvider(null); setHoveredPin(null); }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Link
                        to={`/provider/${provider.id}`}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${hoveredProvider === provider.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      >
                        <ProviderAvatar
                          image={provider.image}
                          name={provider.name}
                          type={provider.type}
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.specialty || provider.type}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          {provider.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 fill-foreground text-foreground" />
                              <span className="font-medium text-foreground">{provider.rating}</span>
                            </div>
                          )}
                          {provider.isOpen !== false ? (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          ) : (
                            <Clock className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            
            {/* Map area */}
            <div className="flex-1 relative bg-muted overflow-hidden min-h-[280px]">
              <img src={sbaSatelliteMap} alt={t('homepage', 'interactiveMap')} loading="lazy" width={800} height={450} className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-background/20" />
              
              <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="absolute inset-0">
                {mapPins.map((pin, index) => (
                  <motion.div
                    key={index}
                    variants={pinVariants}
                    className="absolute transform -translate-x-1/2 -translate-y-full group cursor-pointer"
                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    onMouseEnter={() => setHoveredPin(index)}
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    <AnimatePresence>
                      {(hoveredPin === index || hoveredPin === null) && (
                        <motion.div initial={{ scale: 1, opacity: 0.4 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-full bg-foreground/30" style={{ width: 24, height: 24, top: -12, left: -12 }} />
                      )}
                    </AnimatePresence>
                    <motion.div animate={{ scale: hoveredPin === index ? 1.3 : 1, y: hoveredPin === index ? -4 : 0 }} transition={{ type: "spring", stiffness: 400 }}>
                      <MapPin className={`h-6 w-6 drop-shadow-md transition-colors ${hoveredPin === index ? 'text-primary fill-primary' : 'text-foreground fill-foreground'}`} strokeWidth={1.5} />
                    </motion.div>
                    <AnimatePresence>
                      {hoveredPin === index && (
                        <motion.div initial={{ opacity: 0, y: 5, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.9 }} transition={{ duration: 0.15 }} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
                          <Link to={`/provider/${pin.id}`} className="block">
                            <div className="bg-card border border-border rounded-lg shadow-lg p-2.5 w-48 hover:shadow-xl transition-shadow">
                              <div className="flex items-center gap-2 mb-1.5">
                                <ProviderAvatar image={pin.image} name={pin.name} type={pin.type} className="h-7 w-7 flex-shrink-0" iconSize={14} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-foreground truncate">{pin.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{pin.specialty || PROVIDER_TYPE_LABELS[pin.type]?.[language as 'fr' | 'ar' | 'en'] || PROVIDER_TYPE_LABELS[pin.type]?.fr}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-primary font-medium">{miniCardLabels[language as keyof typeof miniCardLabels] || miniCardLabels.fr} →</span>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
                            </div>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-foreground">{providers.length} {t('homepage', 'practitionersOnline')}</span>
              </motion.div>
              
              
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.6 }} className="absolute bottom-4 left-4 flex items-center gap-4 px-3 py-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-sm">
                <span className="flex items-center gap-1.5 text-xs text-foreground"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> {t('homepage', 'availableStatus')}</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="w-2 h-2 bg-muted-foreground/50 rounded-full" /> {t('homepage', 'busyStatus')}</span>
              </motion.div>
              
              <div className="absolute bottom-4 right-4 md:hidden">
                <Button asChild size="sm" variant="secondary" className="shadow-lg">
                  <Link to="/map/providers" className="flex items-center gap-2">
                    {t('homepage', 'openButton')}
                    <ArrowRight className="h-4 w-4 rtl-flip" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
