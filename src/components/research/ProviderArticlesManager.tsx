import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ArticleEditor } from './ArticleEditor';
import {
  ResearchArticle,
  getProviderArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/services/researchService';
import { useProvider } from '@/contexts/ProviderContext';
import { Plus, Edit2, Trash2, Eye, Heart, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ProviderArticlesManager() {
  const { user } = useAuth();
  const { provider } = useProvider();
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ResearchArticle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadArticles = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getProviderArticles(user.uid);
      setArticles(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArticles(); }, [user?.uid]);

  const handleSubmit = async (data: any) => {
    if (!user?.uid || !provider) return;
    setSubmitting(true);
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, data);
        toast.success('Publication mise à jour');
      } else {
        await createArticle({
          ...data,
          provider_id: user.uid,
          provider_name: provider.name || 'Praticien',
          provider_avatar: provider.image || undefined,
          provider_type: provider.specialty || provider.type || undefined,
          provider_city: provider.city || undefined,
          is_verified_provider: provider.verified || false,
        });
        toast.success('Publication soumise pour validation');
      }
      setShowEditor(false);
      setEditingArticle(null);
      loadArticles();
    } catch (err: any) {
      if (err.message === 'PROFANITY_DETECTED') {
        toast.error('Contenu inapproprié détecté');
      } else {
        toast.error('Erreur lors de la soumission');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteArticle(id);
      toast.success('Publication supprimée');
      loadArticles();
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: '⏳ En attente' },
      approved: { variant: 'default', label: '✅ Approuvé' },
      rejected: { variant: 'destructive', label: '❌ Refusé' },
      suspended: { variant: 'outline', label: '🚫 Suspendu' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant} className="text-[11px]">{config.label}</Badge>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Mes Publications
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {articles.length} publication{articles.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => { setEditingArticle(null); setShowEditor(true); }} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouvelle publication
        </Button>
      </div>

      {/* Articles list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : articles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-medium text-muted-foreground">Aucune publication</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Partagez vos recherches et articles médicaux</p>
            <Button
              onClick={() => { setEditingArticle(null); setShowEditor(true); }}
              variant="outline"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Créer ma première publication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <Card key={article.id} className="hover:shadow-sm transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {getStatusBadge(article.status)}
                      <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-1">{article.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {article.abstract.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                      <span>{format(new Date(article.created_at), 'd MMM yyyy', { locale: fr })}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{article.views_count}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{article.reactions_count}</span>
                    </div>
                    {article.rejection_reason && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {article.rejection_reason}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditingArticle(article); setShowEditor(true); }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                    >
                      {deletingId === article.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>{editingArticle ? 'Modifier la publication' : 'Nouvelle publication'}</DialogTitle>
          <ArticleEditor
            initialData={editingArticle ? {
              title: editingArticle.title,
              abstract: editingArticle.abstract,
              content: editingArticle.content,
              category: editingArticle.category,
              tags: editingArticle.tags || [],
              doi: editingArticle.doi || '',
              pdf_url: editingArticle.pdf_url || '',
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => { setShowEditor(false); setEditingArticle(null); }}
            providerId={user?.uid || ''}
            isSubmitting={submitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
