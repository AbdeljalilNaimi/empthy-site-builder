import { ResearchArticle } from '@/services/researchService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Eye, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeaturedResearchProps {
  articles: ResearchArticle[];
}

export function FeaturedResearch({ articles }: FeaturedResearchProps) {
  if (articles.length === 0) return null;

  const hero = articles[0];
  const rest = articles.slice(1, 4);

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">⭐</span>
        <h2 className="text-xl font-bold tracking-tight">Recherches en vedette</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Hero featured article */}
        <Link to={`/research/${hero.id}`} className="block group">
          <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all">
            <CardContent className="p-6 flex flex-col h-full">
              <Badge className="w-fit mb-3 bg-primary/10 text-primary border-0 text-xs">
                {hero.category}
              </Badge>
              <h3 className="text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                {hero.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-auto line-clamp-4">
                {hero.abstract.replace(/<[^>]*>/g, '').slice(0, 300)}
              </p>
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    {hero.provider_avatar && <AvatarImage src={hero.provider_avatar} />}
                    <AvatarFallback className="text-[10px]">{hero.provider_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">{hero.provider_name}</span>
                      {hero.is_verified_provider && <Shield className="h-3 w-3 text-primary" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(hero.created_at), 'd MMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{hero.views_count}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{hero.reactions_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Side featured list */}
        <div className="flex flex-col gap-3">
          {rest.map(article => (
            <Link key={article.id} to={`/research/${article.id}`} className="block group">
              <Card className="hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <Badge variant="secondary" className="text-[10px] mb-2">{article.category}</Badge>
                  <h4 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">{article.provider_name}</span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{article.views_count}</span>
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{article.reactions_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {rest.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Plus de recherches en vedette bientôt disponibles
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
