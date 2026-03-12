import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Megaphone, Send, Loader2, Pin } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityPost, fetchPosts, createPost, deletePost } from '@/services/communityService';
import { containsProfanity } from '@/utils/profanityFilter';
import { formatDistanceToNow } from 'date-fns';
import { fr, ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

export const AdminAnnouncements = () => {
  const { t, language } = useLanguage();
  const { user, profile, isAdmin } = useAuth();
  const [announcements, setAnnouncements] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pinOnCreate, setPinOnCreate] = useState(false);

  const locale = language === 'fr' ? fr : language === 'ar' ? ar : enUS;

  const loadAnnouncements = async () => {
    try {
      const result = await fetchPosts({ sort: 'newest', pageSize: 50, adminOnly: true });
      setAnnouncements(result.posts);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnnouncements(); }, []);

  const handleSubmit = async () => {
    if (!user || !title.trim() || !content.trim()) return;
    if (containsProfanity(title) || containsProfanity(content)) {
      toast.error(t('community', 'profanityError'));
      return;
    }
    setSubmitting(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: post, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.uid,
          user_name: profile?.full_name || user.displayName || 'Admin',
          user_avatar: profile?.avatar_url || user.photoURL,
          title: title.trim(),
          content: content.trim(),
          category: 'feedback',
          is_anonymous: false,
          is_admin_post: true,
        } as any)
        .select()
        .single();
      if (error) throw error;
      // Pin only if checkbox was checked
      if (pinOnCreate) {
        const { togglePinPost } = await import('@/services/communityService');
        await togglePinPost(post.id, true);
      }
      toast.success(t('community', 'postCreated'));
      setTitle('');
      setContent('');
      setPinOnCreate(false);
      setShowForm(false);
      loadAnnouncements();
    } catch {
      toast.error(t('common', 'error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      loadAnnouncements();
    } catch {
      toast.error(t('common', 'error'));
    }
  };

  if (loading || announcements.length === 0 && !isAdmin) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">{t('community', 'announcements')}</h2>
        </div>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-2">
            <Shield className="h-4 w-4" />
            {t('community', 'createAnnouncement')}
          </Button>
        )}
      </div>

      {showForm && isAdmin && (
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder={t('community', 'titlePlaceholder')}
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              className="font-medium"
            />
            <Textarea
              placeholder={t('community', 'contentPlaceholder')}
              value={content}
              onChange={e => setContent(e.target.value)}
              maxLength={5000}
              rows={3}
              className="resize-none"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pin-on-create"
                  checked={pinOnCreate}
                  onCheckedChange={(v) => setPinOnCreate(!!v)}
                />
                <Label htmlFor="pin-on-create" className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
                  <Pin className="h-3 w-3" />
                  {t('community', 'pinBeforePublish')}
                </Label>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  {t('common', 'cancel')}
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={!title.trim() || !content.trim() || submitting} className="gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t('community', 'publish')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {announcements.map(a => (
        <Card key={a.id} className="border-primary/20 bg-primary/[0.03] rounded-2xl">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{a.user_name || 'Admin'}</span>
                  <Badge className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5">
                    {t('community', 'adminAnnouncement')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale })}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground mt-2">{a.title}</h3>
                <p className="text-sm text-foreground/80 mt-1.5 whitespace-pre-wrap break-words leading-relaxed">
                  {DOMPurify.sanitize(a.content)}
                </p>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(a.id)}
                >
                  ×
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
