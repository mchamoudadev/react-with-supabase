import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { FiHeart, FiMessageSquare, FiShare2, FiUser, FiCalendar } from 'react-icons/fi'
import supabase from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import CommentSection from '../components/CommentSection'

// Sample article data - would be fetched from Supabase in a real app
const ARTICLE = {
  id: '1',
  title: 'Getting Started with React Router v7',
  content: `
    <h2>Introduction</h2>
    <p>React Router v7 introduces several new features that make routing in React applications more intuitive and powerful. In this guide, we'll explore the key changes and how to migrate from earlier versions.</p>
    
    <h2>Key Features in React Router v7</h2>
    <p>The latest version of React Router brings substantial improvements:</p>
    <ul>
      <li>Enhanced type safety with TypeScript</li>
      <li>Improved performance and bundle size</li>
      <li>More intuitive API for complex routing scenarios</li>
      <li>Better handling of loading states and transitions</li>
    </ul>
    
    <h2>Setting Up React Router v7</h2>
    <p>Installation is straightforward with npm:</p>
    <pre><code>npm install react-router</code></pre>
    
    <p>Then, wrap your application with BrowserRouter:</p>
    <pre><code>
import { BrowserRouter } from 'react-router';
import App from './app';

ReactDOM.createRoot(root).render(
  &lt;BrowserRouter&gt;
    &lt;App /&gt;
  &lt;/BrowserRouter&gt;
);
    </code></pre>
    
    <h2>Creating Routes</h2>
    <p>Define your routes using the Routes and Route components:</p>
    <pre><code>
import { Routes, Route } from 'react-router';

function App() {
  return (
    &lt;Routes&gt;
      &lt;Route path="/" element={&lt;Home /&gt;} /&gt;
      &lt;Route path="/about" element={&lt;About /&gt;} /&gt;
      &lt;Route path="/articles/:id" element={&lt;Article /&gt;} /&gt;
    &lt;/Routes&gt;
  );
}
    </code></pre>
    
    <h2>Dynamic Routes and Parameters</h2>
    <p>Accessing route parameters is more intuitive in v7:</p>
    <pre><code>
import { useParams } from 'react-router';

function Article() {
  const { id } = useParams();
  
  // Fetch article data using the id
  
  return (
    &lt;div&gt;
      Article ID: {id}
    &lt;/div&gt;
  );
}
    </code></pre>
    
    <h2>Conclusion</h2>
    <p>React Router v7 represents a significant step forward in the evolution of routing for React applications. By adopting the new API and patterns, you'll enjoy a more streamlined development experience and be better positioned for future updates.</p>
  `,
  author: {
    username: 'Alex Rivera',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    bio: 'Frontend developer passionate about React and modern web technologies. Writing about best practices and new features in the React ecosystem.'
  },
  tags: ['React', 'JavaScript', 'Web Development'],
  createdAt: '2025-02-10T14:20:00Z',
  readingTime: '8 min read',
  likesCount: 89,
  commentsCount: 13
}

// Sample comments data
const COMMENTS = [
  {
    id: 'c1',
    author: {
      username: 'Sarah Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=32'
    },
    content: 'This is exactly what I needed! The explanation of the new API is very clear and I appreciate the migration guide.',
    createdAt: '2025-02-11T09:30:00Z',
    likesCount: 5
  },
  {
    id: 'c2',
    author: {
      username: 'Devon Taylor',
      avatarUrl: 'https://i.pravatar.cc/150?img=12'
    },
    content: 'Great article! I have a question though - is there any plan to support SSR better in v7?',
    createdAt: '2025-02-11T10:15:00Z',
    likesCount: 2
  },
  {
    id: 'c3',
    author: {
      username: 'Mia Chen',
      avatarUrl: 'https://i.pravatar.cc/150?img=47'
    },
    content: 'I was struggling with route transitions in my app and this article helped me understand the new approach. Thanks!',
    createdAt: '2025-02-11T14:45:00Z',
    likesCount: 8
  }
]

export default function ArticlePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  
  useEffect(() => {
    fetchArticle()
    if (user) {
      checkUserInteractions()
    }
  }, [id, user])
  
  const fetchArticle = async () => {
    try {
      setLoading(true)
      
      if (!id) return
      
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:author_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('id', id)
        .single()
        
      if (error) throw error
      
      if (data) {
        setArticle(data)
      }
    } catch (error) {
      console.error('Error fetching article:', error.message)
      toast.error('Failed to load article')
    } finally {
      setLoading(false)
    }
  }
  
  const checkUserInteractions = async () => {
    if (!user || !id) return
    
    try {
      // Check if user liked this article
      const { data: likeData } = await supabase
        .from('likes')
        .select('id')
        .eq('article_id', id)
        .eq('user_id', user.id)
        .single()
        
      setIsLiked(!!likeData)
    } catch (error) {
      console.error('Error checking interactions:', error.message)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like articles')
      return
    }
    
    try {
      if (isLiked) {
        // Unlike the article
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('article_id', id)
          .eq('user_id', user.id)
          
        if (error) throw error
        
        setIsLiked(false)
        toast.success('Article unliked')
      } else {
        // Like the article
        const { error } = await supabase
          .from('likes')
          .insert({
            article_id: id,
            user_id: user.id
          })
          
        if (error) throw error
        
        setIsLiked(true)
        toast.success('Article liked')
      }
      
      // Refresh the article to get updated like count
      fetchArticle()
    } catch (error) {
      console.error('Error liking/unliking article:', error.message)
      toast.error('Failed to update like status')
    }
  }
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Article not found</h2>
        <p className="mt-2 text-gray-600">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/articles" className="mt-4 inline-block text-blue-600 hover:underline">
          Browse all articles
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Featured Image */}
      {article.featured_image_url && (
        <div className="relative w-full h-[60vh] bg-gray-900">
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
      )}

      <div className={`relative ${article.featured_image_url ? '-mt-32' : 'pt-10'}`}>
        <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Article Header */}
          <div className="px-6 py-10 md:px-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map(tag => (
                <Link 
                  key={tag} 
                  to={`/tags/${tag}`}
                  className="inline-block bg-orange-50 text-orange-600 text-sm px-3 py-1 rounded-full hover:bg-orange-100 transition-colors duration-200"
                >
                  {tag}
                </Link>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-8">
              <div className="flex items-center space-x-4">
                <img 
                  src={article.author.avatar_url || 'https://via.placeholder.com/40'} 
                  alt={article.author.username}
                  className="h-12 w-12 rounded-full object-cover" 
                />
                <div>
                  <Link 
                    to={`/profile/${article.author.username}`} 
                    className="text-lg font-medium text-gray-900 hover:text-orange-600 transition-colors"
                  >
                    {article.author.username}
                  </Link>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDate(article.created_at)}</span>
                    {article.readingTime && (
                      <>
                        <span>•</span>
                        <span>{article.readingTime} min read</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Article Content */}
          <div className="px-6 md:px-12 pb-10">
            <div 
              className="prose prose-lg prose-orange max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {/* Article Actions */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200
                    ${isLiked 
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                
                <button
                  onClick={() => {/* Handle comment */}}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                >
                  <FiMessageSquare className="h-5 w-5" />
                  <span>Comment</span>
                </button>
                
                <button
                  onClick={() => {/* Handle share */}}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                >
                  <FiShare2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </article>
        
        {/* Comments Section */}
        <div className="max-w-4xl mx-auto mt-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 md:px-12 py-8">
              <CommentSection articleId={id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 