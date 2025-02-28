import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { FiHeart, FiMessageSquare, FiShare2, FiBookmark, FiUser, FiCalendar } from 'react-icons/fi'
import supabase from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import CommentSection from '../components/CommentSection'
import useBookmarks from '../hooks/useBookmarks'

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
  const { isBookmarked, toggleBookmark } = useBookmarks()
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
      
      // TODO: Add bookmark check when bookmark functionality is implemented
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
  
  const handleBookmark = async () => {
    // Use the toggleBookmark function from useBookmarks
    await toggleBookmark(id)
    // No need for toast message as it's handled inside the hook
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
    <div className="bg-gray-50 py-10">
      <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Article Header */}
        <div className="px-6 py-8 md:px-10">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <FiCalendar className="mr-1" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map(tag => (
              <Link 
                key={tag} 
                to={`/tags/${tag}`}
                className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full hover:bg-orange-200 transition-colors duration-200"
              >
                {tag}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center mb-8 pb-8 border-b border-gray-100">
            <img 
              src={article.author.avatarUrl} 
              alt={article.author.username}
              className="h-12 w-12 rounded-full mr-4" 
            />
            <div>
              <Link to={`/profile/${article.author.username}`} className="text-lg font-medium text-gray-900 hover:text-orange-600">
                {article.author.username}
              </Link>
              <p className="text-gray-600 text-sm">{article.author.bio}</p>
            </div>
          </div>
        </div>
        
        {/* Article Content */}
        <div 
          className="prose prose-orange max-w-none px-6 md:px-10 pb-6"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Article Actions */}
        <div className="px-6 md:px-10 py-6 bg-gray-50 flex flex-wrap items-center gap-6 border-t border-gray-200">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLiked ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200 transition-colors duration-200`}
          >
            <FiHeart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{isLiked ? article.likesCount + 1 : article.likesCount} likes</span>
          </button>
          
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${isBookmarked ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'} hover:bg-gray-200 transition-colors duration-200`}
          >
            <FiBookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200 ml-auto">
            <FiShare2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </article>
      
      {/* Comments Section */}
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-6 md:px-10">
          <CommentSection articleId={id} />
        </div>
      </div>
    </div>
  )
} 