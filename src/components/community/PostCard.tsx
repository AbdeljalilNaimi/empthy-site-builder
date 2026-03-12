import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageCircle, Flag, Pin, EyeOff, User, Trash2, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommunityPost } from '@/services/communityService';
import { CommentSection } from './CommentSection';
import { formatDistanceToNow } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import DOMPurify from 'dompurify';

interface Props {
  post: CommunityPost;
  currentUserId?: string;
  isAdmin?: boolean;
  upvoted?: boolean;
  upvotedCommentIds: string[];
  onUpvote: (postId: string) => void;
  onDelete: (postId: string) => void;
  onReport: (postId: string) => void;
  onPin?: (postId: string, pinned: boolean) => void;
  onUpvoteChange: () => void;
}

const categoryColors: Record<string, string> = {
  suggestion: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  feedback: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  experience: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  question: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
};

export const PostCard = ({
  post, currentUserId, isAdmin, upvoted, upvotedCommentIds, onUpvote, onDelete, onReport, onPin, onUpvoteChange
}: Props) => {
  const { t, language } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const locale = language === 'fr' ? fr : language === 'ar' ? ar : enUS;
  const isOwner = currentUserId === post.user_id;
  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <Card className={`rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-all duration-200 ${post.is_admin_post ? 'border-l-4 border-l-primary bg-primary/[0.02]' : post.is_pinned ? 'border-l-4 border-l-accent bg-accent/[0.02]' : ''}`}>
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${!post.is_anonymous && post.user_avatar ? '' : 'bg-muted'} ${!post.is_anonymous && post.user_avatar ? 'ring-2 ring-border' : ''}`}>
            {post.is_anonymous ? (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            ) : post.user_avatar ? (
              <img src={post.user_avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-foreground">
                {post.is_anonymous ? t('community', 'anonymousUser') : post.user_name || t('community', 'unknownUser')}
              </span>
              {post.is_admin_post && (
                <>
                  <Badge variant="default" className="text-[10px] font-semibold px-2 py-0 rounded-full gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-medium px-2 py-0 rounded-full text-primary border-primary/30">
                    {t('community', 'adminAnnouncement')}
                  </Badge>
                </>
              )}
              {post.is_pinned && !post.is_admin_post && (
                <Badge variant="outline" className="text-[10px] font-medium px-2 py-0 rounded-full gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale })}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <Badge variant="secondary" className={`text-[10px] font-medium px-2 py-0 rounded-full ${categoryColors[post.category] || ''}`}>
                {t('community', `cat${post.category.charAt(0).toUpperCase() + post.category.slice(1)}` as any)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {isAdmin && onPin && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onPin(post.id, !post.is_pinned)} title={post.is_pinned ? 'Unpin' : 'Pin'}>
                <Pin className={`h-4 w-4 ${post.is_pinned ? 'text-primary' : ''}`} />
              </Button>
            )}
            {(isOwner || isAdmin) && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(post.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-foreground leading-snug">{post.title}</h3>
          <p className="text-sm text-foreground/75 mt-2 whitespace-pre-wrap break-words line-clamp-6 leading-relaxed">{sanitizedContent}</p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-1 mt-5 pt-3 border-t border-border/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpvote(post.id)}
            className={`gap-2 rounded-full px-4 ${upvoted ? 'text-primary bg-primary/5' : 'text-muted-foreground'}`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-xs font-medium">{post.upvotes_count > 0 ? post.upvotes_count : ''} {t('community', 'upvote')}</span>
          </Button>
          
          {!post.is_admin_post && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-2 rounded-full px-4 text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs font-medium">{post.comments_count > 0 ? post.comments_count : ''} {t('community', 'comment')}</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}
          
          {currentUserId && !isOwner && !post.is_admin_post && (
            <Button variant="ghost" size="sm" onClick={() => onReport(post.id)} className="gap-2 rounded-full px-4 text-muted-foreground ml-auto">
              <Flag className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">{t('community', 'report')}</span>
            </Button>
          )}

          {post.is_admin_post && (
            <span className="text-[10px] text-muted-foreground ml-auto italic">{t('community', 'officialOnly')}</span>
          )}
        </div>

        {/* Comments - never shown for admin posts */}
        {showComments && !post.is_admin_post && (
          <CommentSection postId={post.id} upvotedCommentIds={upvotedCommentIds} onUpvoteChange={onUpvoteChange} />
        )}
      </CardContent>
    </Card>
  );
};
