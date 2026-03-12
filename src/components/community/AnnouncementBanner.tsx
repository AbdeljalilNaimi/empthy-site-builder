import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommunityPost, fetchPosts } from '@/services/communityService';

interface Props {
  onViewAdmin: () => void;
}

export const AnnouncementBanner = ({ onViewAdmin }: Props) => {
  const { t } = useLanguage();
  const [announcement, setAnnouncement] = useState<CommunityPost | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchPosts({ sort: 'newest', pageSize: 1, adminOnly: true })
      .then(({ posts }) => {
        if (posts.length === 0) return;
        const post = posts[0];
        const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
        const createdAt = new Date(post.created_at).getTime();
        if (createdAt < twelveHoursAgo) return;
        const dismissKey = `dismissed_announcement_${post.id}`;
        if (localStorage.getItem(dismissKey)) return;
        setAnnouncement(post);
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem(`dismissed_announcement_${announcement.id}`, 'true');
    }
    setDismissed(true);
  };

  if (!announcement || dismissed) return null;

  const truncatedContent = announcement.content.length > 100
    ? announcement.content.slice(0, 100) + '…'
    : announcement.content;

  return (
    <div className="relative rounded-xl border border-primary/20 bg-primary/[0.04] p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="text-[10px] font-semibold px-2 py-0 rounded-full gap-1">
              <Shield className="h-3 w-3" />
              {t('community', 'adminAnnouncement')}
            </Badge>
          </div>
          <h4 className="text-sm font-semibold text-foreground leading-snug">{announcement.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{truncatedContent}</p>
          <Button
            variant="link"
            size="sm"
            onClick={onViewAdmin}
            className="h-auto p-0 mt-1 text-xs text-primary gap-1"
          >
            {t('community', 'viewAnnouncements')}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={handleDismiss}
          title={t('community', 'dismissAnnouncement')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
