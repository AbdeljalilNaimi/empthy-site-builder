import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Share2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ResearchArticle } from '@/services/researchService';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ArticleSidePanelProps {
  article: ResearchArticle;
  readingProgress: number;
  isReacted: boolean;
  isSaved: boolean;
  canReact: boolean;
  onReact: () => void;
  onSave: () => void;
}

export function ArticleSidePanel({
  article,
  readingProgress,
  isReacted,
  isSaved,
  canReact,
  onReact,
  onSave,
}: ArticleSidePanelProps) {
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié !');
    }
  };

  return (
    <div className="sticky top-24 space-y-4">
      {/* Reading progress */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Progression</span>
        <Progress value={readingProgress} className="h-1.5" />
        <span className="text-[11px] text-muted-foreground">{Math.round(readingProgress)}%</span>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-3 border-t border-border/50">
        {canReact ? (
          <Button
            variant={isReacted ? 'default' : 'outline'}
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onReact}
          >
            <Heart className={cn("h-4 w-4", isReacted && "fill-current")} />
            {isReacted ? 'Réaction envoyée' : 'Réagir'}
            <span className="ml-auto text-xs opacity-70">{article.reactions_count}</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
            <Heart className="h-4 w-4" />
            <span>{article.reactions_count} réactions</span>
          </div>
        )}

        <Button
          variant={isSaved ? 'default' : 'outline'}
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onSave}
        >
          <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          {isSaved ? 'Sauvegardé' : 'Sauvegarder'}
          <span className="ml-auto text-xs opacity-70">{article.saves_count}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Partager
        </Button>
      </div>

      {/* Stats */}
      <div className="pt-3 border-t border-border/50 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {article.views_count} vues
        </div>
      </div>
    </div>
  );
}
