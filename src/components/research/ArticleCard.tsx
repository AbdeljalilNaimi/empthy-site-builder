import { ResearchArticle } from '@/services/researchService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Bookmark, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: ResearchArticle;
  isReacted?: boolean;
  isSaved?: boolean;
  onReact?: () => void;
  onSave?: () => void;
  canReact?: boolean;
}

export function ArticleCard({ article, isReacted, isSaved, onReact, onSave, canReact }: ArticleCardProps) {
  // Strip HTML for abstract preview
  const plainAbstract = article.abstract.replace(/<[^>]*>/g, '').slice(0, 180);

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
      <CardContent className="p-5">
        {/* Category & Featured badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-[11px] font-medium">
            {article.category}
          </Badge>
          {article.is_featured && (
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[11px]">
              ⭐ En vedette
            </Badge>
          )}
          {article.status === 'pending' && (
            <Badge variant="outline" className="text-[11px] text-amber-600 border-amber-300">
              En attente
            </Badge>
          )}
        </div>

        {/* Title */}
        <Link to={`/research/${article.id}`} className="block group/title">
          <h3 className="text-lg font-bold leading-tight mb-2 group-hover/title:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Abstract preview */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {plainAbstract}...
        </p>

        {/* Author block */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              {article.provider_avatar && <AvatarImage src={article.provider_avatar} />}
              <AvatarFallback className="text-xs font-semibold">
                {article.provider_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{article.provider_name}</span>
                {article.is_verified_provider && (
                  <Shield className="h-3 w-3 text-primary shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(article.created_at), 'd MMM yyyy', { locale: fr })}
                </span>
                {article.provider_type && (
                  <span className="truncate">{article.provider_type}</span>
                )}
              </div>
            </div>
          </div>

          {/* Engagement actions */}
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground mr-1">
              <Eye className="h-3.5 w-3.5" />
              {article.views_count}
            </span>
            {canReact && onReact && (
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", isReacted && "text-red-500")}
                onClick={(e) => { e.preventDefault(); onReact(); }}
              >
                <Heart className={cn("h-4 w-4", isReacted && "fill-current")} />
              </Button>
            )}
            {!canReact && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                {article.reactions_count}
              </span>
            )}
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", isSaved && "text-primary")}
                onClick={(e) => { e.preventDefault(); onSave(); }}
              >
                <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
              </Button>
            )}
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
            {article.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
