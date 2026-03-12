import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { ArticleCard } from '@/components/research/ArticleCard';
import { ArticleFilters } from '@/components/research/ArticleFilters';
import { FeaturedResearch } from '@/components/research/FeaturedResearch';
import {
  ResearchArticle,
  getApprovedArticles,
  getFeaturedArticles,
  toggleReaction,
  toggleSave,
  getUserReactions,
  getUserSaves,
} from '@/services/researchService';
import { Loader2, BookOpen } from 'lucide-react';
import Footer from '@/components/Footer';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLanguage } from '@/hooks/useLanguage';

export default function ResearchHubPage() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [featured, setFeatured] = useState<ResearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<'newest' | 'popular' | 'featured'>('newest');
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [userSaves, setUserSaves] = useState<string[]>([]);

  const debouncedSearch = useDebouncedValue(search, 300);

  const isProvider = profile?.userType === 'provider';
  const isAuthenticated = !!user;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesData, featuredData] = await Promise.all([
        getApprovedArticles({
          search: debouncedSearch || undefined,
          category: category === 'all' ? undefined : category,
          sort,
        }),
        getFeaturedArticles(),
      ]);
      setArticles(articlesData);
      setFeatured(featuredData);

      if (user?.uid) {
        const [reactions, saves] = await Promise.all([
          getUserReactions(user.uid),
          getUserSaves(user.uid),
        ]);
        setUserReactions(reactions);
        setUserSaves(saves);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, sort, user?.uid]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReact = async (articleId: string) => {
    if (!user?.uid || !isProvider) return;
    const liked = await toggleReaction(articleId, user.uid);
    setUserReactions(prev => liked ? [...prev, articleId] : prev.filter(id => id !== articleId));
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, reactions_count: a.reactions_count + (liked ? 1 : -1) } : a));
  };

  const handleSave = async (articleId: string) => {
    if (!user?.uid) return;
    const saved = await toggleSave(articleId, user.uid);
    setUserSaves(prev => saved ? [...prev, articleId] : prev.filter(id => id !== articleId));
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, saves_count: a.saves_count + (saved ? 1 : -1) } : a));
  };

  const t = {
    pageTitle: language === 'ar' ? 'البحث الطبي' : language === 'en' ? 'Medical Research' : 'Recherche Médicale',
    pageDesc: language === 'ar'
      ? 'منشورات علمية من طرف المهنيين الصحيين'
      : language === 'en'
      ? 'Scientific publications by healthcare professionals'
      : 'Publications scientifiques par les professionnels de santé',
    metaDesc: language === 'ar'
      ? 'منشورات البحث الطبي والمقالات العلمية من مهنيي الصحة في CityHealth.'
      : language === 'en'
      ? 'Medical research publications and scientific articles by CityHealth healthcare professionals.'
      : 'Publications de recherche médicale et articles scientifiques par les professionnels de santé de CityHealth.',
    noResults: language === 'ar' ? 'لم يتم العثور على منشورات' : language === 'en' ? 'No publications found' : 'Aucune publication trouvée',
    noResultsHint: debouncedSearch
      ? (language === 'ar' ? 'جرّب تعديل معايير البحث' : language === 'en' ? 'Try adjusting your search criteria' : 'Essayez de modifier vos critères de recherche')
      : (language === 'ar' ? 'ستظهر المنشورات هنا بمجرد الموافقة عليها' : language === 'en' ? 'Publications will appear here once approved' : 'Les publications apparaîtront ici une fois approuvées'),
  };

  return (
    <>
      <Helmet>
        <title>{t.pageTitle} | CityHealth</title>
        <meta name="description" content={t.metaDesc} />
      </Helmet>

      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="container-wide">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.pageTitle}</h1>
                <p className="text-sm text-muted-foreground">{t.pageDesc}</p>
              </div>
            </div>
          </div>

          {/* Featured section */}
          {featured.length > 0 && !debouncedSearch && category === 'all' && sort === 'newest' && (
            <FeaturedResearch articles={featured} />
          )}

          {/* Filters */}
          <div className="mb-6">
            <ArticleFilters
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              sort={sort}
              onSortChange={setSort}
            />
          </div>

          {/* Articles feed */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">{t.noResults}</p>
              <p className="text-sm text-muted-foreground/70 mt-1">{t.noResultsHint}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isReacted={userReactions.includes(article.id)}
                  isSaved={userSaves.includes(article.id)}
                  onReact={() => handleReact(article.id)}
                  onSave={isAuthenticated ? () => handleSave(article.id) : undefined}
                  canReact={isProvider}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
