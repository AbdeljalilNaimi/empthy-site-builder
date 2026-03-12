import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useLanguage } from '@/contexts/LanguageContext';
import { VerifiedBadge } from '@/components/trust/VerifiedBadge';
import { SectionHeader } from './SectionHeader';
import { getApprovedAds, Ad } from '@/services/adsService';

export const MedicalAdsCarousel = () => {
  const { t } = useLanguage();
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);

  useEffect(() => {
    getApprovedAds({ sort: 'featured', limit: 6 })
      .then(setAds)
      .catch(() => setAds([]));
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  if (ads.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30" aria-labelledby="medical-ads-title">
      <div className="container-wide">
        <SectionHeader
          badge="Partenaires Vérifiés"
          badgeIcon={Megaphone}
          title="Offres de Nos"
          titleHighlight="Partenaires"
          subtitle="Découvrez les services exclusifs de nos partenaires de santé certifiés à Sidi Bel Abbès"
          subtitleHighlights={[
            { text: 'services exclusifs', className: 'font-semibold text-foreground' },
            { text: 'Sidi Bel Abbès', className: 'font-semibold text-primary' }
          ]}
          showDecorator={true}
          className="mb-12"
        />

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-3xl shadow-2xl border border-white/10" ref={emblaRef}>
            <div className="flex">
              {ads.map((ad) => (
                <div key={ad.id} className="flex-shrink-0 w-full">
                  <div className="relative h-[450px] md:h-[520px] group">
                    <img
                      src={ad.image_url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-6 left-6 w-20 h-20 border-l-2 border-t-2 border-white/20 rounded-tl-xl" />
                    <div className="absolute bottom-6 right-6 w-20 h-20 border-r-2 border-b-2 border-white/20 rounded-br-xl" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
                      <div className="flex items-center gap-3 mb-5">
                        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 text-sm font-medium shadow-lg shadow-primary/30">
                          {ad.provider_type || 'Santé'}
                        </Badge>
                        {ad.is_verified_provider && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                            <VerifiedBadge type="verified" size="sm" showTooltip={false} />
                            <span className="text-white/90 text-xs font-medium">Vérifié</span>
                          </div>
                        )}
                        {ad.is_featured && (
                          <Badge className="bg-amber-500/90 text-white border-0">⭐ Sponsorisé</Badge>
                        )}
                      </div>
                      
                      <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                        {ad.title}
                      </h3>
                      
                      <p className="text-white/70 text-sm mb-2 flex items-center gap-2">
                        <span className="w-8 h-px bg-gradient-to-r from-primary to-transparent" />
                        Par <span className="text-white font-medium">{ad.provider_name}</span>
                      </p>
                      
                      <p className="text-white/60 text-base md:text-lg mb-8 max-w-2xl line-clamp-2 leading-relaxed">
                        {ad.short_description}
                      </p>
                      
                      <Link to={`/provider/${ad.provider_id}`}>
                        <Button 
                          size="lg"
                          className="bg-white text-foreground hover:bg-white/95 shadow-xl shadow-black/20 group/btn px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                        >
                          Découvrir le Profil
                          <ExternalLink className="w-5 h-5 ml-2 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5" aria-hidden="true" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                      <span className="text-white/90 text-sm font-medium">
                        {ads.findIndex(a => a.id === ad.id) + 1} / {ads.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {ads.length > 1 && (
            <>
              <Button variant="ghost" size="icon" onClick={scrollPrev} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-2xl rounded-full h-14 w-14 z-10 transition-all duration-300 hover:scale-110 border border-border/50" aria-label="Annonce précédente">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" onClick={scrollNext} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white shadow-2xl rounded-full h-14 w-14 z-10 transition-all duration-300 hover:scale-110 border border-border/50" aria-label="Annonce suivante">
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {ads.length > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8" role="tablist" aria-label="Sélection d'annonce">
              {ads.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  role="tab"
                  aria-selected={index === selectedIndex}
                  aria-label={`Annonce ${index + 1}`}
                  className={`rounded-full transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    index === selectedIndex 
                      ? 'w-12 h-3 bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/30' 
                      : 'w-3 h-3 bg-muted-foreground/20 hover:bg-muted-foreground/40 hover:scale-125'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA to ads page */}
        <div className="text-center mt-10">
          <Link to="/annonces">
            <Button variant="outline" size="lg" className="gap-2 rounded-xl">
              <Megaphone className="h-4 w-4" />
              Voir toutes les annonces
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
