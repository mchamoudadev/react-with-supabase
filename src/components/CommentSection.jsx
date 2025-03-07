import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import supabase from '../lib/supabase'
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { FiMessageSquare, FiEdit2, FiTrash2, FiSend } from 'react-icons/fi';

const CommentSection = ({ articleId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const commentInputRef = useRef(null);
  
  // Load comments and set up real-time
  useEffect(() => {
    // Load initial comments
    fetchComments();
    
    // Verify Supabase Configuration
    const verifySupabaseRealtime = async () => {
      try {
        // List all current channels
        const channels = supabase.getChannels();
        console.log('Current active channels:', channels.length);
        
        // Check database connection
        const { data, error } = await supabase.from('comments').select('count').eq('article_id', articleId);
        if (error) {
          console.error('Error connecting to Supabase:', error);
        } else {
          console.log('Connected to Supabase successfully, comment count:', data);
        }
      } catch (err) {
        console.error('Error verifying Supabase configuration:', err);
      }
    };
    
    verifySupabaseRealtime();
    
    // Clean up any existing subscriptions first to prevent duplicates
    supabase.getChannels().forEach(channel => {
      console.log('Found channel:', channel.topic);
      supabase.removeChannel(channel);
    });
    
    // Use a single channel with multiple handlers as shown in the Supabase dashboard examples
    const commentChannel = supabase
      .channel('comments-' + articleId)
      // Listen to inserts
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments',
          filter: `article_id=eq.${articleId}`
        },
        payload => {
          console.log('INSERT event received:', payload);
          fetchComments();
        }
      )
      // Listen to updates
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'comments',
          filter: `article_id=eq.${articleId}`
        },
        payload => {
          console.log('UPDATE event received:', payload);
          fetchComments();
        }
      )
      // // Listen to ALL events for debugging
      // .on(
      //   'postgres_changes',
      //   { 
      //     event: '*', 
      //     schema: 'public', 
      //     table: 'comments'
      //   },
      //   payload => {
      //     console.log('DEBUG - ANY EVENT received:', payload);
      //     console.log('Event type:', payload.eventType);
      //     console.log('Old data:', payload.old);
      //     console.log('New data:', payload.new);
      //   }
      // )
      // Listen to deletes - try with filter first
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'comments',
          filter: `article_id=eq.${articleId}`
        },
        payload => {
          console.log('DELETE event with filter received:', payload);
          console.log('DELETE payload.old:', payload.old);
          console.log('DELETE payload.eventType:', payload.eventType);
          
          if (payload.old && payload.old.id) {
            console.log('FILTERED: Removing deleted comment with ID:', payload.old.id);
            setComments(current => {
              const filteredComments = current.filter(comment => comment.id !== payload.old.id);
              console.log(`FILTERED: Comments before: ${current.length}, after: ${filteredComments.length}`);
              return filteredComments;
            });
          } else {
            console.log('FILTERED: No ID found in payload, refreshing all comments');
            fetchComments();
          }
        }
      )
      // // Also listen to all deletes as backup (no filter)
      // .on(
      //   'postgres_changes',
      //   {
      //     event: 'DELETE',
      //     schema: 'public',
      //     table: 'comments',
      //   },
      //   (payload) => {
      //     console.log('DELETE event without filter received:', payload);
      //     console.log('UNFILTERED DELETE payload.old:', payload.old);
          
      //     // For DELETE events, we only get the id in payload.old
      //     // We need to handle this case specially
      //     if (payload.old && payload.old.id) {
      //       // Instead of checking article_id which is not included in the payload for DELETE events,
      //       // we need to check if the deleted comment ID exists in our current comments
      //       setComments(current => {
      //         // Check if this comment exists in our current state
      //         const commentExists = current.some(comment => comment.id === payload.old.id);
              
      //         if (commentExists) {
      //           console.log('UNFILTERED: Removing deleted comment with ID:', payload.old.id);
      //           const filteredComments = current.filter(comment => comment.id !== payload.old.id);
      //           console.log(`UNFILTERED: Comments before: ${current.length}, after: ${filteredComments.length}`);
      //           return filteredComments;
      //         } else {
      //           console.log('UNFILTERED: Comment ID not found in current state:', payload.old.id);
      //           return current;
      //         }
      //       });
      //     } else {
      //       console.log('UNFILTERED: No ID in payload:', payload);
      //     }
      //   }
      // )
      .subscribe(status => {
        console.log('Subscription status:', status);
      });
    
    return () => {
      console.log('Cleaning up channel subscriptions');
      supabase.removeChannel(commentChannel);
    };
  }, [articleId]);

  // Fetch all comments
  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (id, username, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Post new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const content = newComment.trim();
    if (!content || !user) return;
    
    try {
      setSubmitting(true);
      
      // Simple optimistic update - add temp comment at the top
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        user_id: user.id,
        user: {
          id: user.id,
          username: user.username || 'User',
          avatar_url: user.avatar_url
        },
        isOptimistic: true
      };
      
      // Add to UI
      setComments(prev => [optimisticComment, ...prev]);
      
      // Reset form
      setNewComment('');
      
      // Send to server
      await supabase
        .from('comments')
        .insert({
          content,
          article_id: articleId,
          user_id: user.id
        });
      
      // The real-time will handle updating the UI
      
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
      
      // On error, just refresh all comments
      fetchComments();
    } finally {
      setSubmitting(false);
    }
  };

  // Edit a comment
  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  // Update a comment
  const handleUpdate = async () => {
    if (!editText.trim()) return;
    
    try {
      // Exit edit mode immediately
      const commentId = editingId;
      const content = editText.trim();
      setEditingId(null);
      
      await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId);
      
      // Let real-time handle the update
      
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  // Delete a comment
  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      console.log('========= STARTING COMMENT DELETION =========');
      console.log(`Attempting to delete comment ID: ${commentId} for article: ${articleId}`);
      
      // Find the comment we're about to delete for logging
      const commentToDelete = comments.find(comment => comment.id === commentId);
      console.log('Comment to delete:', commentToDelete);
      
      // Optimistically remove from UI
      setComments(current => {
        const filteredComments = current.filter(comment => comment.id !== commentId);
        console.log(`Optimistically removed comment. Before: ${current.length}, After: ${filteredComments.length}`);
        return filteredComments;
      });
      
      // Delete the comment with explicit .eq conditions rather than .match
      const { error, count, data } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('article_id', articleId)
        .select();
      
      if (error) {
        console.error('Error deleting comment:', error);
        throw error;
      }
      
      console.log('Comment deleted successfully from database:', { count, data });
      console.log('========= COMMENT DELETION COMPLETE =========');
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      fetchComments();
    }
  };

  // Focus on comment input
  const scrollToCommentInput = () => {
    commentInputRef.current?.focus();
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="mt-10 bg-white p-5 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-5">
        <FiMessageSquare className="text-gray-500 text-lg" />
        <h2 className="text-xl font-medium text-gray-700">Comments ({comments.length})</h2>
        
        {!user && (
          <button 
            onClick={scrollToCommentInput}
            className="ml-auto px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
          >
            Join the discussion
          </button>
        )}
      </div>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <img 
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username || 'User'}`} 
              alt={user.username || 'You'} 
              className="w-8 h-8 rounded-full object-cover border border-gray-200 self-start mt-1"
            />
            <div className="flex-1">
              <textarea
                ref={commentInputRef}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-gray-700 min-h-[100px]"
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                  disabled={submitting || !newComment.trim()}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                  <FiSend className={submitting ? 'opacity-0' : 'opacity-100'} />
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <h3 className="text-base font-medium text-gray-700 mb-2">Join the conversation</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Sign in to comment on this article.
          </p>
          <div className="flex gap-3">
            <Link 
              to="/signin" 
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium"
            >
              Sign in
            </Link>
            <Link 
              to="/signup" 
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiMessageSquare className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-base">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`border border-gray-200 p-4 rounded-lg ${comment.isOptimistic ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={comment.user?.avatar_url || `https://ui-avatars.com/api/?name=${comment.user?.username || 'User'}`}
                    alt={comment.user?.username || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1 flex-wrap">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="font-medium text-gray-800">{comment.user?.username || 'User'}</span>
                        <span className="text-gray-500 text-xs">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                        {comment.isOptimistic && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            Posting...
                          </span>
                        )}
                      </div>
                      
                      {user && user.id === comment.user_id && !comment.isOptimistic && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            aria-label="Edit comment"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                            <span className="text-xs">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                            aria-label="Delete comment"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span className="text-xs">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingId === comment.id ? (
                      <div className="mt-2 bg-white p-3 rounded border border-gray-200">
                        <textarea
                          className="w-full p-2 border border-gray-200 rounded bg-white text-gray-700 mb-2"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdate}
                            className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50"
                            disabled={!editText.trim()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-line text-sm mt-1">
                        {comment.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection; 