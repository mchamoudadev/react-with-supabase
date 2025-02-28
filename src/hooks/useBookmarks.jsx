import { useState, useEffect } from 'react';
import supabase from '../lib/supabase'
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for handling user bookmarks
 */
export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
      setLoading(false);
    }
  }, [user]);

  /**
   * Fetch all bookmarks for the current user
   */
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          article:article_id (
            id,
            title,
            created_at,
            tags,
            featured_image_url,
            author:author_id (
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error.message);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if an article is bookmarked by the current user
   */
  const isBookmarked = (articleId) => {
    return bookmarks.some(bookmark => bookmark.article_id === articleId);
  };

  /**
   * Toggle bookmark status for an article
   */
  const toggleBookmark = async (articleId) => {
    if (!user) {
      toast.error('Please sign in to bookmark articles');
      return false;
    }
    
    try {
      const bookmarked = isBookmarked(articleId);
      
      if (bookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('article_id', articleId);
          
        if (error) throw error;
        
        setBookmarks(bookmarks.filter(bookmark => bookmark.article_id !== articleId));
        toast.success('Removed from bookmarks');
      } else {
        // Add bookmark
        const { data, error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            article_id: articleId
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          // Fetch the article details to add to the bookmarks state
          const { data: articleData, error: articleError } = await supabase
            .from('articles')
            .select(`
              id,
              title,
              created_at,
              tags,
              featured_image_url,
              author:author_id (
                username,
                avatar_url
              )
            `)
            .eq('id', articleId)
            .single();
            
          if (articleError) throw articleError;
          
          setBookmarks([...bookmarks, { ...data[0], article: articleData }]);
        }
        
        toast.success('Added to bookmarks');
      }
      
      return !bookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error.message);
      toast.error('Failed to update bookmark');
      return null;
    }
  };

  return {
    bookmarks,
    loading,
    isBookmarked,
    toggleBookmark,
    refreshBookmarks: fetchBookmarks
  };
};

export default useBookmarks; 