import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommunityFeed } from '@/components/community/CommunityFeed';

import { AnnouncementBanner } from '@/components/community/AnnouncementBanner';
import { MessageSquare, Bell } from 'lucide-react';
import { fetchNewAdminPostCount } from '@/services/communityService';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const CommunityPage = () => {
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const lastSeen = localStorage.getItem('admin_posts_last_seen');
    fetchNewAdminPostCount(lastSeen || undefined).then(setUnreadCount).catch(() => {});
  }, []);

  const handleViewAnnouncements = () => {
    localStorage.setItem('admin_posts_last_seen', new Date().toISOString());
    setUnreadCount(0);
    const el = document.getElementById('admin-announcements');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAdminFilterSelected = () => {
    setUnreadCount(0);
  };

  return (
    <main className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              {t('community', 'badge')}
            </div>
            {unreadCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewAnnouncements}
                      className="relative gap-2 rounded-full px-3 py-1.5 text-xs border-primary/30 text-primary hover:bg-primary/5"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                      {t('community', 'viewAnnouncements')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('community', 'newAnnouncements')}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {t('community', 'title')}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {t('community', 'subtitle')}
          </p>
        </div>

        {/* 12h Announcement Banner */}
        <AnnouncementBanner onViewAdmin={handleViewAnnouncements} />

        {/* Feed */}
        <CommunityFeed onAdminFilterSelected={handleAdminFilterSelected} />
      </div>
    </main>
  );
};

export default CommunityPage;
