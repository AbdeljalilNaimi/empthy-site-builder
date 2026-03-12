import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EyeOff, Send, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CommentItem } from './CommentItem';
import { ReportDialog } from './ReportDialog';
import { containsProfanity } from '@/utils/profanityFilter';
import {
  CommunityComment,
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
  toggleUpvote,
  submitReport,
  ReportReason,
} from '@/services/communityService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Props {
  postId: string;
  upvotedCommentIds: string[];
  onUpvoteChange: () => void;
}

export const CommentSection = ({ postId, upvotedCommentIds, onUpvoteChange }: Props) => {
  const { t } = useLanguage();
  const { user, profile, isAdmin } = useAuth();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportTarget, setReportTarget] = useState<string | null>(null);

  const loadComments = async () => {
    try {
      const data = await fetchComments(postId);
      setComments(data);
    } catch {
      toast.error(t('common', 'error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComments(); }, [postId]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim()) return;
    if (containsProfanity(newComment)) {
      toast.error(t('community', 'profanityError'));
      return;
    }
    try {
      await createComment({
        post_id: postId,
        user_id: user.uid,
        user_name: profile?.full_name || user.displayName || user.email,
        user_avatar: profile?.avatar_url || user.photoURL,
        content: newComment.trim(),
        is_anonymous: isAnonymous,
      });
      setNewComment('');
      setIsAnonymous(false);
      loadComments();
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleReply = async (parentId: string, content: string, anon: boolean) => {
    if (!user) return;
    if (containsProfanity(content)) {
      toast.error(t('community', 'profanityError'));
      return;
    }
    try {
      await createComment({
        post_id: postId,
        user_id: user.uid,
        user_name: profile?.full_name || user.displayName || user.email,
        user_avatar: profile?.avatar_url || user.photoURL,
        parent_comment_id: parentId,
        content,
        is_anonymous: anon,
      });
      loadComments();
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
      loadComments();
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      loadComments();
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleUpvote = async (commentId: string) => {
    if (!user) return;
    try {
      await toggleUpvote(user.uid, { commentId });
      onUpvoteChange();
      loadComments();
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  const handleReport = async (reason: ReportReason, details?: string) => {
    if (!user || !reportTarget) return;
    try {
      await submitReport({ reporter_id: user.uid, comment_id: reportTarget, reason, details });
      toast.success(t('community', 'reportSuccess'));
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  return (
    <div className="border-t border-border/50 pt-3">
      {loading ? (
        <p className="text-sm text-muted-foreground py-2">{t('common', 'loading')}</p>
      ) : (
        <div className="space-y-0">
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={user?.uid}
              isAdmin={isAdmin}
              upvoted={upvotedCommentIds.includes(c.id)}
              onUpvote={handleUpvote}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={(id) => setReportTarget(id)}
            />
          ))}
        </div>
      )}

      {user ? (
        <div className="mt-3 flex gap-2 items-start">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={t('community', 'commentPlaceholder')}
            rows={2}
            maxLength={2000}
            className="text-sm flex-1 rounded-xl"
          />
          <div className="flex flex-col gap-1">
            <Button size="icon" onClick={handleSubmit} disabled={!newComment.trim()} className="rounded-full">
              <Send className="h-4 w-4" />
            </Button>
            <label className="flex items-center gap-1 cursor-pointer" title={t('community', 'anonymous')}>
              <Checkbox checked={isAnonymous} onCheckedChange={v => setIsAnonymous(v === true)} className="h-3.5 w-3.5" />
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            </label>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30">
          <p className="text-xs text-muted-foreground flex-1">{t('community', 'loginToParticipate')}</p>
          <Link to="/citizen-login">
            <Button size="sm" variant="outline" className="gap-1.5 rounded-full text-xs">
              <LogIn className="h-3.5 w-3.5" />
              {t('header', 'signin')}
            </Button>
          </Link>
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
