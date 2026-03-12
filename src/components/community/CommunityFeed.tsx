import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePostComposer } from './CreatePostComposer';
import { CategoryFilter, CategoryFilterValue } from './CategoryFilter';
import { PostCard } from './PostCard';
import { ReportDialog } from './ReportDialog';
import { containsProfanity } from '@/utils/profanityFilter';
import {
  CommunityCategory,
  CommunityPost,
  SortOption,
  ReportReason,
  fetchPosts,
  createPost,
  deletePost,
  togglePinPost,
  toggleUpvote,
  getUserUpvotes,
  submitReport,
} from '@/services/communityService';
import { toast } from 'sonner';

interface CommunityFeedProps {
  onAdminFilterSelected?: () => void;
}

export const CommunityFeed = ({ onAdminFilterSelected }: CommunityFeedProps) => {
  const { t } = useLanguage();
  const { user, profile, isAdmin } = useAuth();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [category, setCategory] = useState<CategoryFilterValue>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [upvotedPostIds, setUpvotedPostIds] = useState<string[]>([]);
  const [upvotedCommentIds, setUpvotedCommentIds] = useState<string[]>([]);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadPosts = useCallback(async (reset = false) => {
    const p = reset ? 0 : page;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const result = await fetchPosts({
        category: category === 'admin' ? undefined : (category || undefined),
        sort,
        search: searchDebounced || undefined,
        page: p,
        adminOnly: category === 'admin' ? true : undefined,
        excludeAdminUnpinned: category !== 'admin' ? true : undefined,
      });
      
      // Mark admin posts as read when viewing admin section
      if (category === 'admin') {
        localStorage.setItem('admin_posts_last_seen', new Date().toISOString());
        onAdminFilterSelected?.();
      }
      setPosts(prev => reset ? result.posts : [...prev, ...result.posts]);
      setHasMore(result.hasMore);
      if (reset) setPage(0);
    } catch {
      toast.error(t('common', 'error'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, sort, searchDebounced, page, t]);

  useEffect(() => { loadPosts(true); }, [category, sort, searchDebounced]);

  const loadUpvotes = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserUpvotes(user.uid);
      setUpvotedPostIds(data.postIds);
      setUpvotedCommentIds(data.commentIds);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { loadUpvotes(); }, [loadUpvotes]);

  const handleCreatePost = async (data: { title: string; content: string; category: CommunityCategory; is_anonymous: boolean }) => {
    if (!user) return;
    if (containsProfanity(data.title) || containsProfanity(data.content)) {
      toast.error(t('community', 'profanityError'));
      return;
    }
    setCreating(true);
    try {
      await createPost({
        user_id: user.uid,
        user_name: profile?.full_name || user.displayName || user.email,
        user_avatar: profile?.avatar_url || user.photoURL,
        ...data,
      });
      toast.success(t('community', 'postCreated'));
      loadPosts(true);
    } catch {
      toast.error(t('common', 'error'));
    } finally {
      setCreating(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!user) {
      toast.error(t('community', 'loginRequired'));
      return;
    }
    try {
      await toggleUpvote(user.uid, { postId });
      loadUpvotes();
      loadPosts(true);
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      toast.success(t('common', 'success'));
      loadPosts(true);
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handlePin = async (postId: string, pinned: boolean) => {
    try {
      await togglePinPost(postId, pinned);
      loadPosts(true);
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleReport = async (reason: ReportReason, details?: string) => {
    if (!user || !reportTarget) return;
    try {
      await submitReport({ reporter_id: user.uid, post_id: reportTarget, reason, details });
      toast.success(t('community', 'reportSuccess'));
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleLoadMore = () => {
    setPage(p => p + 1);
    loadPosts(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Composer */}
      <CreatePostComposer onSubmit={handleCreatePost} isLoading={creating} />

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('community', 'searchPlaceholder')}
              className="pl-9"
            />
          </div>
          <Select value={sort} onValueChange={v => setSort(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('community', 'sortNewest')}</SelectItem>
              <SelectItem value="most_upvoted">{t('community', 'sortMostUpvoted')}</SelectItem>
              <SelectItem value="most_discussed">{t('community', 'sortMostDiscussed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('community', 'noPosts')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.uid}
              isAdmin={isAdmin}
              upvoted={upvotedPostIds.includes(post.id)}
              upvotedCommentIds={upvotedCommentIds}
              onUpvote={handleUpvote}
              onDelete={handleDelete}
              onReport={id => setReportTarget(id)}
              onPin={isAdmin ? handlePin : undefined}
              onUpvoteChange={loadUpvotes}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('community', 'loadMore')}
              </Button>
            </div>
          )}
        </div>
      )}

      <ReportDialog
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmit={handleReport}
      />
    </div>
  );
};
