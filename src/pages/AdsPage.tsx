import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, TrendingUp, Clock, Star, Loader2, Megaphone, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdCard } from '@/components/ads/AdCard';
import { AdDetailDialog } from '@/components/ads/AdDetailDialog';
import { Ad, getApprovedAds, getUserLikes, getUserSaves, AdFilters } from '@/services/adsService';
import { cn } from '@/lib/utils';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/hooks/useLanguage';

export default function AdsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<AdFilters['sort']>('featured');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userSaves, setUserSaves] = useState<string[]>([]);

  const SORT_OPTIONS = [
    { value: 'newest' as const, label: language === 'ar' ? 'الأحدث' : language === 'en' ? 'Recent' : 'Récentes', icon: Clock },
    { value: 'popular' as const, label: language === 'ar' ? 'الأكثر شعبية' : language === 'en' ? 'Popular' : 'Populaires', icon: TrendingUp },
    { value: 'featured' as const, label: language === 'ar' ? 'مُموَّلة' : language === 'en' ? 'Sponsored' : 'Sponsorisées', icon: Star },
  ];

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getApprovedAds({ search: search || undefined, sort });
      setAds(result);
    } catch (error) {
      console.error('Failed to load ads:', error);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  useEffect(() => {
    if (user?.uid) {
      getUserLikes(user.uid).then(setUserLikes).catch(() => {});
      getUserSaves(user.uid).then(setUserSaves).catch(() => {});
    }
  }, [user?.uid]);

  const handleLikeToggle = (adId: string, liked: boolean) => {
    setUserLikes(prev => liked ? [...prev, adId] : prev.filter(id => id !== adId));
  };

  const handleSaveToggle = (adId: string, saved: boolean) => {
    setUserSaves(prev => saved ? [...prev, adId] : prev.filter(id => id !== adId));
  };

  const t = {
    pageTitle: language === 'ar' ? 'إعلانات احترافية' : language === 'en' ? 'Pro Ads' : 'Annonces Pro',
    metaTitle: language === 'ar' ? 'إعلانات احترافية - CityHealth سيدي بلعباس' : language === 'en' ? 'Pro Ads - CityHealth Sidi Bel Abbès' : 'Annonces Pro - CityHealth Sidi Bel Abbès',
    metaDesc: language === 'ar'
      ? 'اكتشف إعلانات وعروض المهنيين الصحيين المعتمدين في سيدي بلعباس.'
      : language === 'en'
      ? 'Discover ads and offers from our verified healthcare professionals in Sidi Bel Abbès.'
      : 'Découvrez les annonces et offres de nos professionnels de santé vérifiés à Sidi Bel Abbès.',
    heroDesc: language === 'ar'
      ? 'اكتشف الخدمات والعروض والأحداث من مهنيي الصحة المعتمدين لدينا.'
      : language === 'en'
      ? 'Discover services, offers, and events from our verified healthcare professionals.'
      : 'Découvrez les services, offres et événements de nos professionnels de santé vérifiés.',
    searchPlaceholder: language === 'ar'
      ? 'البحث حسب العنوان أو الوصف أو مقدم الخدمة...'
      : language === 'en'
      ? 'Search by title, description, or provider...'
      : 'Rechercher par titre, description ou prestataire...',
    noAds: language === 'ar' ? 'لا توجد إعلانات حالياً' : language === 'en' ? 'No ads at the moment' : 'Aucune annonce pour le moment',
    noAdsHint: language === 'ar' ? 'ستظهر الإعلانات الموافق عليها هنا.' : language === 'en' ? 'Approved ads will appear here.' : 'Les annonces approuvées apparaîtront ici.',
  };

  return (
    <>
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
      </Helmet>

      <div className="min-h-screen bg-muted/30 pt-20">
        {/* Hero header */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
          <div className="container mx-auto px-4 py-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">{t.pageTitle}</h1>
            </div>
            <p className="text-muted-foreground max-w-xl">{t.heroDesc}</p>

            {/* Search + Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-10 h-11 bg-card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={sort === opt.value ? 'default' : 'outline'}
                    size="sm"
                    className="gap-1.5 h-11"
                    onClick={() => setSort(opt.value)}
                  >
                    <opt.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-20">
              <Megaphone className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">{t.noAds}</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">{t.noAdsHint}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userId={user?.uid}
                  isLiked={userLikes.includes(ad.id)}
                  isSaved={userSaves.includes(ad.id)}
                  onLikeToggle={handleLikeToggle}
                  onSaveToggle={handleSaveToggle}
                  onReport={() => setSelectedAd(ad)}
                  onClick={() => setSelectedAd(ad)}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* Detail dialog */}
      <AdDetailDialog
        ad={selectedAd}
        open={!!selectedAd}
        onOpenChange={(open) => !open && setSelectedAd(null)}
        userId={user?.uid}
        isLiked={selectedAd ? userLikes.includes(selectedAd.id) : false}
        isSaved={selectedAd ? userSaves.includes(selectedAd.id) : false}
        onLikeToggle={handleLikeToggle}
        onSaveToggle={handleSaveToggle}
      />
    </>
  );
}
