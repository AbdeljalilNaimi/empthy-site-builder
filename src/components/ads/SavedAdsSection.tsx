import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Bookmark } from 'lucide-react';
import { Ad, getSavedAds, getUserLikes, getUserSaves } from '@/services/adsService';
import { AdCard } from './AdCard';
import { AdDetailDialog } from './AdDetailDialog';

interface SavedAdsSectionProps {
  userId: string;
}

export function SavedAdsSection({ userId }: SavedAdsSectionProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userSaves, setUserSaves] = useState<string[]>([]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    Promise.all([
      getSavedAds(userId),
      getUserLikes(userId),
      getUserSaves(userId),
    ]).then(([savedAds, likes, saves]) => {
      setAds(savedAds);
      setUserLikes(likes);
      setUserSaves(saves);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [userId]);

  const handleSaveToggle = (adId: string, saved: boolean) => {
    if (!saved) {
      setAds(prev => prev.filter(a => a.id !== adId));
    }
    setUserSaves(prev => saved ? [...prev, adId] : prev.filter(id => id !== adId));
  };

  const handleLikeToggle = (adId: string, liked: boolean) => {
    setUserLikes(prev => liked ? [...prev, adId] : prev.filter(id => id !== adId));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5" />Annonces Sauvegardées</CardTitle>
          <CardDescription>{ads.length} annonce{ads.length !== 1 ? 's' : ''} sauvegardée{ads.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {ads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Aucune annonce sauvegardée</p>
              <p className="text-sm mt-1">Les annonces que vous sauvegardez apparaîtront ici.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  userId={userId}
                  isLiked={userLikes.includes(ad.id)}
                  isSaved={userSaves.includes(ad.id)}
                  onLikeToggle={handleLikeToggle}
                  onSaveToggle={handleSaveToggle}
                  onClick={() => setSelectedAd(ad)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdDetailDialog
        ad={selectedAd}
        open={!!selectedAd}
        onOpenChange={(open) => !open && setSelectedAd(null)}
        userId={userId}
        isLiked={selectedAd ? userLikes.includes(selectedAd.id) : false}
        isSaved={selectedAd ? userSaves.includes(selectedAd.id) : false}
        onLikeToggle={handleLikeToggle}
        onSaveToggle={handleSaveToggle}
      />
    </>
  );
}
