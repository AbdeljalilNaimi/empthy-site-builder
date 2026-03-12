import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Send, EyeOff, User, LogIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CommunityCategory } from '@/services/communityService';
import { containsProfanity } from '@/utils/profanityFilter';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Props {
  onSubmit: (data: { title: string; content: string; category: CommunityCategory; is_anonymous: boolean }) => Promise<void>;
  isLoading?: boolean;
}

export const CreatePostComposer = ({ onSubmit, isLoading }: Props) => {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('suggestion');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    if (containsProfanity(title) || containsProfanity(content)) {
      toast.error(t('community', 'profanityError'));
      return;
    }
    await onSubmit({ title: title.trim(), content: content.trim(), category, is_anonymous: isAnonymous });
    setTitle('');
    setContent('');
    setCategory('suggestion');
    setIsAnonymous(false);
    setExpanded(false);
  };

  // Guest state — show login prompt
  if (!user) {
    return (
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t('community', 'loginToParticipate')}</p>
          </div>
          <Link to="/citizen-login">
            <Button size="sm" className="gap-2 rounded-full">
              <LogIn className="h-4 w-4" />
              {t('header', 'signin')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const categories: { value: CommunityCategory; label: string }[] = [
    { value: 'suggestion', label: t('community', 'catSuggestion') },
    { value: 'feedback', label: t('community', 'catFeedback') },
    { value: 'experience', label: t('community', 'catExperience') },
    { value: 'question', label: t('community', 'catQuestion') },
  ];

  return (
    <Card className="rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {isAnonymous ? (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            ) : profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-border" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 space-y-3">
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                className="w-full text-left px-4 py-3.5 rounded-2xl bg-muted/40 hover:bg-muted text-muted-foreground text-sm transition-colors"
              >
                {t('community', 'composerPlaceholder')}
              </button>
            ) : (
              <>
                <Input
                  placeholder={t('community', 'titlePlaceholder')}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={200}
                  className="font-medium rounded-xl"
                />
                <Textarea
                  placeholder={t('community', 'contentPlaceholder')}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  maxLength={5000}
                  rows={4}
                  className="resize-none rounded-xl"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Select value={category} onValueChange={v => setCategory(v as CommunityCategory)}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <Checkbox checked={isAnonymous} onCheckedChange={v => setIsAnonymous(v === true)} />
                    <EyeOff className="h-3.5 w-3.5" />
                    {t('community', 'anonymous')}
                  </label>
                  
                  <div className="flex gap-2 sm:ml-auto w-full sm:w-auto">
                    <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="flex-1 sm:flex-none rounded-full">
                      {t('common', 'cancel')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={!title.trim() || !content.trim() || isLoading}
                      className="flex-1 sm:flex-none gap-2 rounded-full"
                    >
                      <Send className="h-4 w-4" />
                      {t('community', 'publish')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
