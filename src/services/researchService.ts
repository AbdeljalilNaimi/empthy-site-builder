import { supabase } from '@/integrations/supabase/client';
import { containsProfanity } from '@/utils/profanityFilter';

export interface ResearchArticle {
  id: string;
  provider_id: string;
  provider_name: string;
  provider_avatar: string | null;
  provider_type: string | null;
  provider_city: string | null;
  title: string;
  abstract: string;
  content: string;
  category: string;
  tags: string[];
  doi: string | null;
  pdf_url: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured: boolean;
  is_verified_provider: boolean;
  views_count: number;
  reactions_count: number;
  saves_count: number;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleFilters {
  search?: string;
  category?: string;
  sort?: 'newest' | 'popular' | 'featured';
  limit?: number;
  offset?: number;
}

interface CreateArticleInput {
  provider_id: string;
  provider_name: string;
  provider_avatar?: string;
  provider_type?: string;
  provider_city?: string;
  title: string;
  abstract: string;
  content: string;
  category: string;
  tags?: string[];
  doi?: string;
  pdf_url?: string;
  is_verified_provider?: boolean;
}

// ====== CRUD ======

export async function createArticle(input: CreateArticleInput): Promise<ResearchArticle> {
  const text = `${input.title} ${input.abstract} ${input.content}`;
  if (containsProfanity(text)) {
    throw new Error('PROFANITY_DETECTED');
  }

  const { data, error } = await supabase
    .from('research_articles')
    .insert({
      ...input,
      tags: input.tags || [],
      status: 'pending',
      is_featured: false,
      views_count: 0,
      reactions_count: 0,
      saves_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ResearchArticle;
}

export async function updateArticle(id: string, updates: Partial<CreateArticleInput>): Promise<void> {
  if (updates.title || updates.abstract || updates.content) {
    const text = `${updates.title || ''} ${updates.abstract || ''} ${updates.content || ''}`;
    if (containsProfanity(text)) {
      throw new Error('PROFANITY_DETECTED');
    }
  }

  const { error } = await supabase
    .from('research_articles')
    .update({ ...updates, status: 'pending', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase.from('research_articles').delete().eq('id', id);
  if (error) throw error;
}

// ====== QUERIES ======

export async function getApprovedArticles(filters: ArticleFilters = {}): Promise<ResearchArticle[]> {
  let query = supabase
    .from('research_articles')
    .select('*')
    .eq('status', 'approved');

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,abstract.ilike.%${filters.search}%,provider_name.ilike.%${filters.search}%`);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.sort === 'popular') {
    query = query.order('reactions_count', { ascending: false });
  } else if (filters.sort === 'featured') {
    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ResearchArticle[];
}

export async function getFeaturedArticles(limit = 5): Promise<ResearchArticle[]> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('status', 'approved')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ResearchArticle[];
}

export async function getArticleById(id: string): Promise<ResearchArticle | null> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as ResearchArticle;
}

export async function getProviderArticles(providerId: string): Promise<ResearchArticle[]> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ResearchArticle[];
}

export async function getAllArticles(): Promise<ResearchArticle[]> {
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ResearchArticle[];
}

// ====== ENGAGEMENT ======

export async function toggleReaction(articleId: string, userId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('article_reactions')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('article_reactions').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('article_reactions').insert({ article_id: articleId, user_id: userId });
    return true;
  }
}

export async function toggleSave(articleId: string, userId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('article_saves')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase.from('article_saves').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('article_saves').insert({ article_id: articleId, user_id: userId });
    return true;
  }
}

export async function recordView(articleId: string, viewerId?: string): Promise<void> {
  await supabase.from('article_views').insert({ article_id: articleId, viewer_id: viewerId || null });
  // Also increment the cached count
  const { data } = await supabase
    .from('research_articles')
    .select('views_count')
    .eq('id', articleId)
    .single();
  if (data) {
    await supabase
      .from('research_articles')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', articleId);
  }
}

export async function getUserReactions(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('article_reactions')
    .select('article_id')
    .eq('user_id', userId);
  return (data || []).map(d => d.article_id);
}

export async function getUserSaves(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('article_saves')
    .select('article_id')
    .eq('user_id', userId);
  return (data || []).map(d => d.article_id);
}

export async function getSavedArticles(userId: string): Promise<ResearchArticle[]> {
  const { data: saves } = await supabase
    .from('article_saves')
    .select('article_id')
    .eq('user_id', userId);

  if (!saves?.length) return [];

  const articleIds = saves.map(s => s.article_id);
  const { data, error } = await supabase
    .from('research_articles')
    .select('*')
    .in('id', articleIds)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ResearchArticle[];
}

// ====== ADMIN ======

export async function adminApprove(articleId: string): Promise<void> {
  const { error } = await supabase
    .from('research_articles')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', articleId);
  if (error) throw error;
}

export async function adminReject(articleId: string, reason: string): Promise<void> {
  const { error } = await supabase
    .from('research_articles')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', articleId);
  if (error) throw error;
}

export async function adminSuspend(articleId: string): Promise<void> {
  const { error } = await supabase
    .from('research_articles')
    .update({ status: 'suspended' })
    .eq('id', articleId);
  if (error) throw error;
}

export async function adminToggleFeatured(articleId: string, featured: boolean): Promise<void> {
  const { error } = await supabase
    .from('research_articles')
    .update({ is_featured: featured })
    .eq('id', articleId);
  if (error) throw error;
}

// ====== PDF UPLOAD ======

export async function uploadArticlePdf(file: File, providerId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${providerId}/research/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('pdfs')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from('pdfs')
    .getPublicUrl(path);

  return data.publicUrl;
}

// ====== CATEGORIES ======

export const RESEARCH_CATEGORIES = [
  'Cardiologie',
  'Pédiatrie',
  'Neurologie',
  'Oncologie',
  'Ophtalmologie',
  'Dermatologie',
  'Chirurgie',
  'Médecine interne',
  'Santé publique',
  'Recherche clinique',
  'Pharmacologie',
  'Radiologie',
  'Biologie médicale',
  'Médecine générale',
  'Gynécologie',
  'Urologie',
  'ORL',
  'Psychiatrie',
  'Autre',
];
