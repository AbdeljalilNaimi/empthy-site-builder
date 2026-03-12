import { ResearchArticle } from '@/services/researchService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

interface ArticleDetailViewProps {
  article: ResearchArticle;
}

export function ArticleDetailView({ article }: ArticleDetailViewProps) {
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return (
    <article className="max-w-[720px] mx-auto">
      {/* Category & Tags header */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Badge variant="secondary" className="text-xs">{article.category}</Badge>
        {article.is_featured && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">⭐ En vedette</Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6 tracking-tight">
        {article.title}
      </h1>

      {/* Author block */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/50">
        <Avatar className="h-11 w-11">
          {article.provider_avatar && <AvatarImage src={article.provider_avatar} />}
          <AvatarFallback className="text-sm font-semibold">
            {article.provider_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1.5">
            <Link
              to={`/provider/${article.provider_id}`}
              className="font-semibold text-sm hover:text-primary transition-colors"
            >
              {article.provider_name}
            </Link>
            {article.is_verified_provider && <Shield className="h-3.5 w-3.5 text-primary" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            {article.provider_type && <span>{article.provider_type}</span>}
            {article.provider_city && <span>{article.provider_city}</span>}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(article.created_at), 'PPP', { locale: fr })}
            </span>
          </div>
        </div>
      </div>

      {/* Abstract */}
      <div className="bg-muted/40 border border-border/50 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Résumé</h2>
        <p className="text-sm leading-relaxed text-foreground/90">
          {article.abstract.replace(/<[^>]*>/g, '')}
        </p>
      </div>

      {/* Full article content */}
      <div
        className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-blockquote:border-l-primary/30 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-a:text-primary"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* DOI reference */}
      {article.doi && (
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ExternalLink className="h-4 w-4" />
            <span className="font-medium">DOI:</span>
            <a
              href={`https://doi.org/${article.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {article.doi}
            </a>
          </div>
        </div>
      )}

      {/* PDF attachment */}
      {article.pdf_url && (
        <div className="mt-6 p-4 bg-muted/30 border border-border/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Document PDF attaché</p>
              <p className="text-xs text-muted-foreground">Téléchargez le document complet</p>
            </div>
            <a
              href={article.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline shrink-0"
            >
              Télécharger
            </a>
          </div>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mots-clés</h3>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs font-normal">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
