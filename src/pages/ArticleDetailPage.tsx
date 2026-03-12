import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { ArticleDetailView } from '@/components/research/ArticleDetailView';
import { ArticleSidePanel } from '@/components/research/ArticleSidePanel';
import { Button } from '@/components/ui/button';
import {
  ResearchArticle,
  getArticleById,
  recordView,
  toggleReaction,
  toggleSave,
  getUserReactions,
  getUserSaves,
} from '@/services/researchService';
import { ArrowLeft, Loader2, Heart, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

export default function ArticleDetailPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [article, setArticle] = useState<ResearchArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReacted, setIsReacted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const isProvider = profile?.userType === 'provider';

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    getArticleById(articleId).then(async (data) => {
      if (!data) {
        navigate('/research', { replace: true });
        return;
      }
      setArticle(data);
      // Record view
      recordView(articleId, user?.uid);
      // Load user engagement
      if (user?.uid) {
        const [reactions, saves] = await Promise.all([
          getUserReactions(user.uid),
          getUserSaves(user.uid),
        ]);
        setIsReacted(reactions.includes(articleId));
        setIsSaved(saves.includes(articleId));
      }
      setLoading(false);
    });
  }, [articleId, user?.uid]);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setReadingProgress(Math.min(100, (scrollTop / docHeight) * 100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReact = async () => {
    if (!user?.uid || !article || !isProvider) return;
    const reacted = await toggleReaction(article.id, user.uid);
    setIsReacted(reacted);
    setArticle(prev => prev ? { ...prev, reactions_count: prev.reactions_count + (reacted ? 1 : -1) } : prev);
  };

  const handleSave = async () => {
    if (!user?.uid || !article) return;
    const saved = await toggleSave(article.id, user.uid);
    setIsSaved(saved);
    setArticle(prev => prev ? { ...prev, saves_count: prev.saves_count + (saved ? 1 : -1) } : prev);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!article) return null;

  return (
    <>
      <Helmet>
        <title>{article.title} | CityHealth Research</title>
        <meta name="description" content={article.abstract.replace(/<[^>]*>/g, '').slice(0, 160)} />
      </Helmet>

      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container-wide">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 gap-1.5"
            onClick={() => navigate('/research')}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux publications
          </Button>

          <div className="flex gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              <ArticleDetailView article={article} />
            </div>

            {/* Desktop side panel */}
            <aside className="hidden lg:block w-56 shrink-0">
              <ArticleSidePanel
                article={article}
                readingProgress={readingProgress}
                isReacted={isReacted}
                isSaved={isSaved}
                canReact={isProvider}
                onReact={handleReact}
                onSave={handleSave}
              />
            </aside>
          </div>

          {/* Mobile floating actions */}
          <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-card/95 backdrop-blur-lg border border-border shadow-xl rounded-full px-4 py-2">
            {isProvider && (
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-9 w-9 p-0 rounded-full", isReacted && "text-red-500")}
                onClick={handleReact}
              >
                <Heart className={cn("h-5 w-5", isReacted && "fill-current")} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-9 w-9 p-0 rounded-full", isSaved && "text-primary")}
              onClick={handleSave}
              disabled={!user}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
