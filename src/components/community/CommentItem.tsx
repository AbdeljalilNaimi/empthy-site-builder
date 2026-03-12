import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, Reply, Pencil, Trash2, Flag, EyeOff, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CommunityComment } from '@/services/communityService';
import { containsProfanity } from '@/utils/profanityFilter';
import { formatDistanceToNow } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

interface Props {
  comment: CommunityComment;
  currentUserId?: string;
  isAdmin?: boolean;
  upvoted?: boolean;
  onUpvote: (commentId: string) => void;
  onReply: (parentId: string, content: string, isAnonymous: boolean) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
  isNested?: boolean;
}

export const CommentItem = ({
  comment, currentUserId, isAdmin, upvoted, onUpvote, onReply, onEdit, onDelete, onReport, isNested
}: Props) => {
  const { t, language } = useLanguage();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [replyAnon, setReplyAnon] = useState(false);

  const locale = language === 'fr' ? fr : language === 'ar' ? ar : enUS;
  const isOwner = currentUserId === comment.user_id;

  const handleReply = async () => {
    if (!replyText.trim()) return;
    if (containsProfanity(replyText)) {
      toast.error(t('community', 'profanityError'));
      return;
    }
    await onReply(comment.id, replyText.trim(), replyAnon);
    setReplyText('');
    setReplyOpen(false);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    if (containsProfanity(editText)) {
      toast.error(t('community', 'profanityError'));
      return;
    }
    await onEdit(comment.id, editText.trim());
    setEditing(false);
  };

  return (
    <div className={`${isNested ? 'ml-10 sm:ml-14' : ''}`}>
      <div className="flex gap-3 py-2.5">
        <div className={`${isNested ? 'w-7 h-7' : 'w-9 h-9'} rounded-full bg-muted flex items-center justify-center flex-shrink-0`}>
          {comment.is_anonymous ? (
            <EyeOff className={`${isNested ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
          ) : comment.user_avatar ? (
            <img src={comment.user_avatar} alt="" className={`${isNested ? 'w-7 h-7' : 'w-9 h-9'} rounded-full object-cover`} />
          ) : (
            <User className={`${isNested ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/30 rounded-2xl px-4 py-3">
            <p className="text-xs font-semibold text-foreground">
              {comment.is_anonymous ? t('community', 'anonymousUser') : comment.user_name || t('community', 'unknownUser')}
            </p>
            {editing ? (
              <div className="mt-2 space-y-2">
                <Textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2} className="text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>{t('common', 'save')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{t('common', 'cancel')}</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/75 mt-1 whitespace-pre-wrap break-words leading-relaxed">{comment.content}</p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1.5 px-2">
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale })}
            </span>
            <button
              onClick={() => onUpvote(comment.id)}
              className={`text-[11px] font-semibold transition-colors ${upvoted ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ThumbsUp className="h-3 w-3 inline mr-1" />
              {comment.upvotes_count > 0 && comment.upvotes_count}
            </button>
            {!isNested && currentUserId && (
              <button onClick={() => setReplyOpen(!replyOpen)} className="text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                {t('community', 'reply')}
              </button>
            )}
            {isOwner && (
              <>
                <button onClick={() => { setEditing(true); setEditText(comment.content); }} className="text-[11px] text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3 w-3" />
                </button>
                <button onClick={() => onDelete(comment.id)} className="text-[11px] text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            )}
            {isAdmin && !isOwner && (
              <button onClick={() => onDelete(comment.id)} className="text-[11px] text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
            {currentUserId && !isOwner && (
              <button onClick={() => onReport(comment.id)} className="text-[11px] text-muted-foreground hover:text-destructive">
                <Flag className="h-3 w-3" />
              </button>
            )}
          </div>
          {replyOpen && (
            <div className="mt-2 flex gap-2">
              <Textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={t('community', 'replyPlaceholder')}
                rows={2}
                className="text-sm flex-1"
                maxLength={2000}
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>
                  <Reply className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies?.map(reply => (
        <CommentItem
          key={reply.id}
          comment={reply}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          upvoted={false}
          onUpvote={onUpvote}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
          isNested
        />
      ))}
    </div>
  );
};
