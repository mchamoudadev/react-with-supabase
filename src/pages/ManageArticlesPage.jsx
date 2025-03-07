import { useState, useEffect, useOptimistic, useTransition } from 'react'
import { Link, useNavigate } from 'react-router'
import { FiEdit2, FiTrash2, FiEye, FiPlus, FiAlertTriangle, FiCheck, FiX, FiLoader } from 'react-icons/fi'
import { getArticlesByAuthor, deleteArticle, deleteArticleDebug } from '../lib/articles'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

export default function ManageArticlesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)
  const [articleToDelete, setArticleToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  // Add useOptimistic hook for optimistic updates
  const [optimisticArticles, updateOptimisticArticles] = useOptimistic(
    articles,
    (state, articleIdToRemove) => state.filter(article => article.id !== articleIdToRemove)
  )
  
  useEffect(() => {
    if (user) {
      fetchUserArticles()
    } else {
      navigate('/signin')
    }
  }, [user])
  
  const fetchUserArticles = async () => {
    try {
      setLoading(true)
      
      const { articles, count } = await getArticlesByAuthor(user.id, {
        includeUnpublished: true,
        limit: 100 // Get all articles since we're managing them
      })
      
      setArticles(articles)
      setTotalCount(count)
    } catch (error) {
      console.error('Error fetching articles:', error)
      setError('Failed to load your articles. Please try again.')
      toast.error('Failed to load your articles')
    } finally {
      setLoading(false)
    }
  }
  
  const confirmDelete = (article) => {
    setArticleToDelete(article)
  }
  
  const cancelDelete = () => {
    setArticleToDelete(null)
  }
  
  const handleDelete = async () => {
    if (!articleToDelete) return
    
    try {
      setIsDeleting(true)
      console.log('Starting deletion process for article:', articleToDelete.id)
      
      // Wrap the optimistic update in a transition
      startTransition(() => {
        updateOptimisticArticles(articleToDelete.id)
      })
      
      // Use the debug version of delete for better diagnostics
      const result = await deleteArticleDebug(articleToDelete.id)
      
      // Update actual state after successful response
      setArticles(prevArticles => prevArticles.filter(article => article.id !== articleToDelete.id))
      setTotalCount(prevCount => prevCount - 1)
      
      if (result.warning) {
        // If there's a warning, show it but still consider the operation successful for the UI
        console.warn('Deletion warning:', result.warning)
        toast.success('Article removed from view, but a database sync issue was detected.')
      } else {
        toast.success('Article deleted successfully')
      }
      
      setArticleToDelete(null)
    } catch (error) {
      console.error('Error deleting article in component:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error(`Failed to delete article: ${error.message || 'Unknown error'}`)
      
      // Fetch articles again to restore state in case optimistic update was applied
      fetchUserArticles()
    } finally {
      setIsDeleting(false)
    }
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Separate published and draft articles
  const publishedArticles = optimisticArticles.filter(article => article.published)
  const draftArticles = optimisticArticles.filter(article => !article.published)
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Your Articles</h1>
              <p className="text-orange-100">
                Create, edit, and manage your published and draft articles
              </p>
            </div>
            <Link
              to="/editor"
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-xl shadow-md hover:bg-orange-50 transition-colors duration-200"
            >
              <FiPlus className="mr-2" />
              Create New Article
            </Link>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">{error}</h3>
            <button 
              onClick={fetchUserArticles}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        ) : optimisticArticles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <FiPlus className="h-10 w-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Articles Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              You haven't created any articles yet. Start writing your first article and share your knowledge!
            </p>
            <Link
              to="/editor"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-colors duration-200"
            >
              <FiPlus className="mr-2" />
              Create Your First Article
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Published Articles Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span>Published Articles</span>
                {publishedArticles.length > 0 && (
                  <span className="ml-3 px-2.5 py-0.5 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {publishedArticles.length}
                  </span>
                )}
              </h2>
              
              {publishedArticles.length > 0 ? (
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comments
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Likes
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {publishedArticles.map(article => (
                          <tr key={article.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {article.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(article.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-500">
                                {article.comments?.length || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-500">
                                {article.likes?.length || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/article/${article.id}`}
                                  className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                                  title="View Article"
                                >
                                  <FiEye />
                                </Link>
                                <Link
                                  to={`/editor/${article.id}`}
                                  className="p-2 text-orange-600 hover:text-orange-800 rounded-full hover:bg-orange-50"
                                  title="Edit Article"
                                >
                                  <FiEdit2 />
                                </Link>
                                <button
                                  onClick={() => confirmDelete(article)}
                                  className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                                  title="Delete Article"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500">You don't have any published articles yet</p>
                </div>
              )}
            </div>
            
            {/* Draft Articles Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span>Draft Articles</span>
                {draftArticles.length > 0 && (
                  <span className="ml-3 px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    {draftArticles.length}
                  </span>
                )}
              </h2>
              
              {draftArticles.length > 0 ? (
                <div className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {draftArticles.map(article => (
                          <tr key={article.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {article.title || "(Untitled Draft)"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(article.updated_at || article.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  to={`/editor/${article.id}`}
                                  className="p-2 text-orange-600 hover:text-orange-800 rounded-full hover:bg-orange-50"
                                  title="Edit Draft"
                                >
                                  <FiEdit2 />
                                </Link>
                                <button
                                  onClick={() => confirmDelete(article)}
                                  className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                                  title="Delete Draft"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                  <p className="text-gray-500">You don't have any draft articles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{articleToDelete.title || 'Untitled Article'}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 