import { useState, useEffect } from 'react';
import supabase from '../lib/supabase'
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const CommentSection = ({ articleId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('public:comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `article_id=eq.${articleId}`
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setComments(prev => 
              prev.map(comment => 
                comment.id === payload.new.id ? payload.new : comment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => 
              prev.filter(comment => comment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [articleId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error.message);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!user) {
      toast.error('You must be signed in to comment');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          content: newComment.trim()
        });
        
      if (error) throw error;
      
      setNewComment('');
      toast.success('Comment added');
      
    } catch (error) {
      console.error('Error posting comment:', error.message);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('comments')
        .update({ content: editText.trim() })
        .eq('id', editingId);
        
      if (error) throw error;
      
      setEditingId(null);
      toast.success('Comment updated');
      
    } catch (error) {
      console.error('Error updating comment:', error.message);
      toast.error('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
        
      if (error) throw error;
      
      toast.success('Comment deleted');
      
    } catch (error) {
      console.error('Error deleting comment:', error.message);
      toast.error('Failed to delete comment');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            placeholder="Leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <p className="text-blue-800">
            Please <a href="/signin" className="underline font-medium">sign in</a> to leave a comment.
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="flex items-start space-x-3">
                  <img
                    src={comment.user?.avatar_url || 'https://via.placeholder.com/40'}
                    alt={comment.user?.username || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <span className="font-medium">{comment.user?.username || 'User'}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {user && user.id === comment.user_id && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(comment)}
                            className="text-gray-500 hover:text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingId === comment.id ? (
                      <div>
                        <textarea
                          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 mb-2"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-200 text-gray-800 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleUpdate}
                            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
                            disabled={submitting || !editText.trim()}
                          >
                            {submitting ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
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