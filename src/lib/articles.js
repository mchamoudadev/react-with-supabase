import supabase from './supabase'


export const getPublishedArticles = async ({
  limit = 10,
  offset = 0,
  orderBy = 'created_at',
  ascending = false
}) => {
  const { data, error, count } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(id, username, avatar_url),
      comments:comments(count),
      likes:likes(count)
    `, { count: 'exact' })
    .eq('published', true)
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1)

  if (error) throw error
  
  return {
    articles: data,
    count
  }
}


export const getArticlesByTag = async (tag, { limit = 10, offset = 0 }) => {
  const { data, error, count } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(id, username, avatar_url),
      comments:comments(count),
      likes:likes(count)
    `, { count: 'exact' })
    .eq('published', true)
    .contains('tags', [tag])
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  
  return {
    articles: data,
    count
  }
}


export const searchArticles = async (query, { limit = 10, offset = 0 }) => {
  const { data, error, count } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(id, username, avatar_url),
      comments:comments(count),
      likes:likes(count)
    `, { count: 'exact' })
    .eq('published', true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  
  return {
    articles: data,
    count
  }
}


export const getArticleById = async (id) => {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:author_id(id, username, avatar_url),
      comments:comments(
        id,
        content,
        created_at,
        user:user_id(id, username, avatar_url)
      ),
      likes:likes(count)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}


export const getArticlesByAuthor = async (authorId, {
  includeUnpublished = false,
  limit = 10,
  offset = 0
}) => {
  let query = supabase
    .from('articles')
    .select(`
      *,
      comments:comments(count),
      likes:likes(count)
    `, { count: 'exact' })
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (!includeUnpublished) {
    query = query.eq('published', true)
  }

  const { data, error, count } = await query
  if (error) throw error
  
  return {
    articles: data,
    count
  }
}


export const createArticle = async (article) => {
  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: article.title,
      content: article.content,
      tags: article.tags,
      author_id: article.authorId,
      published: article.published || false,
      featured_image_url: article.featuredImageUrl
    })
    .select()
    .single()

  if (error) throw error
  return data
}


export const updateArticle = async (id, updates) => {
  const { data, error } = await supabase
    .from('articles')
    .update({
      title: updates.title,
      content: updates.content,
      tags: updates.tags,
      published: updates.published,
      featured_image_url: updates.featuredImageUrl,
      updated_at: new Date()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}


export const deleteArticle = async (id) => {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)

  if (error) throw error
}


export const addComment = async (articleId, userId, content) => {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      user_id: userId,
      content
    })
    .select(`
      *,
      user:user_id(id, username, avatar_url)
    `)
    .single()

  if (error) throw error
  return data
}


export const deleteComment = async (commentId) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
}


export const likeArticle = async (articleId, userId) => {
  const { data, error } = await supabase
    .from('likes')
    .insert({
      article_id: articleId,
      user_id: userId
    })
    .select()
    .single()

  if (error) throw error
  return data
}


export const unlikeArticle = async (articleId, userId) => {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('article_id', articleId)
    .eq('user_id', userId)

  if (error) throw error
}

export const hasUserLikedArticle = async (articleId, userId) => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "No rows returned" which means not liked
  return !!data
} 