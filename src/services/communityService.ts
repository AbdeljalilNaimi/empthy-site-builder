import { supabase } from '@/integrations/supabase/client';

export type CommunityCategory = 'suggestion' | 'feedback' | 'experience' | 'question';
export type ReportReason = 'spam' | 'abuse' | 'false_info' | 'other';
export type SortOption = 'newest' | 'most_upvoted' | 'most_discussed';

export interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  title: string;
  content: string;
  category: CommunityCategory;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_admin_post: boolean;
  upvotes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  parent_comment_id: string | null;
  content: string;
  is_anonymous: boolean;
  upvotes_count: number;
  created_at: string;
  updated_at: string;
  replies?: CommunityComment[];
}

// Posts
export async function fetchPosts(params: {
  category?: CommunityCategory;
  sort?: SortOption;
  search?: string;
  page?: number;
  pageSize?: number;
  adminOnly?: boolean;
  excludeAdminUnpinned?: boolean;
}): Promise<{ posts: CommunityPost[]; hasMore: boolean }> {
  const { category, sort = 'newest', search, page = 0, pageSize = 10, adminOnly, excludeAdminUnpinned } = params;
  
  let query = supabase
    .from('community_posts')
    .select('*');
  
  if (adminOnly) {
    query = query.eq('is_admin_post', true);
  } else {
    if (category) query = query.eq('category', category);
    // Exclude unpinned admin posts from regular feeds
    if (excludeAdminUnpinned) {
      query = query.or('is_admin_post.eq.false,is_pinned.eq.true');
    }
  }
  if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  
  switch (sort) {
    case 'most_upvoted':
      query = query.order('upvotes_count', { ascending: false });
      break;
    case 'most_discussed':
      query = query.order('comments_count', { ascending: false });
      break;
    default:
      query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
  }
  
  const from = page * pageSize;
  query = query.range(from, from + pageSize);
  
  const { data, error } = await query;
  if (error) throw error;
  
  return {
    posts: (data || []) as unknown as CommunityPost[],
    hasMore: (data?.length || 0) > pageSize,
  };
}

export async function fetchNewAdminPostCount(since?: string): Promise<number> {
  let query = supabase
    .from('community_posts')
    .select('id', { count: 'exact', head: true })
    .eq('is_admin_post', true);
  
  if (since) {
    query = query.gt('created_at', since);
  }
  
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export async function createPost(post: {
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  title: string;
  content: string;
  category: CommunityCategory;
  is_anonymous: boolean;
}): Promise<CommunityPost> {
  const insertData = {
    ...post,
    user_name: post.is_anonymous ? null : post.user_name,
    user_avatar: post.is_anonymous ? null : post.user_avatar,
  };
  
  const { data, error } = await supabase
    .from('community_posts')
    .insert(insertData as any)
    .select()
    .single();
  
  if (error) throw error;
  return data as unknown as CommunityPost;
}

export async function updatePost(id: string, updates: { title?: string; content?: string; category?: CommunityCategory }) {
  const { error } = await supabase
    .from('community_posts')
    .update(updates as any)
    .eq('id', id);
  if (error) throw error;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('community_posts').delete().eq('id', id);
  if (error) throw error;
}

export async function togglePinPost(id: string, pinned: boolean) {
  const { error } = await supabase
    .from('community_posts')
    .update({ is_pinned: pinned } as any)
    .eq('id', id);
  if (error) throw error;
}

// Comments
export async function fetchComments(postId: string): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  
  const comments = (data || []) as unknown as CommunityComment[];
  // Nest replies
  const topLevel = comments.filter(c => !c.parent_comment_id);
  const replies = comments.filter(c => c.parent_comment_id);
  
  return topLevel.map(c => ({
    ...c,
    replies: replies.filter(r => r.parent_comment_id === c.id),
  }));
}

export async function createComment(comment: {
  post_id: string;
  user_id: string;
  user_name: string | null;
  user_avatar: string | null;
  parent_comment_id?: string | null;
  content: string;
  is_anonymous: boolean;
}): Promise<CommunityComment> {
  const insertData = {
    ...comment,
    user_name: comment.is_anonymous ? null : comment.user_name,
    user_avatar: comment.is_anonymous ? null : comment.user_avatar,
  };
  
  const { data, error } = await supabase
    .from('community_comments')
    .insert(insertData as any)
    .select()
    .single();
  
  if (error) throw error;
  return data as unknown as CommunityComment;
}

export async function updateComment(id: string, content: string) {
  const { error } = await supabase
    .from('community_comments')
    .update({ content } as any)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from('community_comments').delete().eq('id', id);
  if (error) throw error;
}

// Upvotes
export async function toggleUpvote(userId: string, target: { postId?: string; commentId?: string }): Promise<boolean> {
  const { postId, commentId } = target;
  
  // Check existing
  let query = supabase.from('community_upvotes').select('id').eq('user_id', userId);
  if (postId) query = query.eq('post_id', postId);
  if (commentId) query = query.eq('comment_id', commentId);
  
  const { data: existing } = await query;
  
  if (existing && existing.length > 0) {
    await supabase.from('community_upvotes').delete().eq('id', existing[0].id);
    return false;
  } else {
    const insertData: any = { user_id: userId };
    if (postId) insertData.post_id = postId;
    if (commentId) insertData.comment_id = commentId;
    await supabase.from('community_upvotes').insert(insertData);
    return true;
  }
}

export async function getUserUpvotes(userId: string): Promise<{ postIds: string[]; commentIds: string[] }> {
  const { data } = await supabase
    .from('community_upvotes')
    .select('post_id, comment_id')
    .eq('user_id', userId);
  
  return {
    postIds: (data || []).filter(u => u.post_id).map(u => u.post_id as string),
    commentIds: (data || []).filter(u => u.comment_id).map(u => u.comment_id as string),
  };
}

// Reports
export async function submitReport(report: {
  reporter_id: string;
  post_id?: string;
  comment_id?: string;
  reason: ReportReason;
  details?: string;
}) {
  const { error } = await supabase.from('community_reports').insert(report as any);
  if (error) throw error;
}
