import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { FiClock, FiUser, FiHeart, FiArrowRight, FiTrendingUp } from 'react-icons/fi'
import supabase from '../lib/supabase'
import { toast } from 'react-hot-toast'
import ArticleCard from '../components/ArticleCard'

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [latestArticles, setLatestArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)

      // Fetch featured articles (articles with most likes)
      const { data: featured, error: featuredError } = await supabase
        .from('articles')
        .select(`
          *,
          author:author_id (
            username,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('likes_count', { ascending: false })
        .limit(3)

      if (featuredError) throw featuredError

      // Fetch latest articles
      const { data: latest, error: latestError } = await supabase
        .from('articles')
        .select(`
          *,
          author:author_id (
            username,
            avatar_url
          )
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (latestError) throw latestError

      setFeaturedArticles(featured || [])
      setLatestArticles(latest || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 to-orange-400 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Welcome to Our Blog
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-2xl mx-auto mb-8">
              Discover insightful articles, tutorials, and stories from our community of developers and designers.
            </p>
            <Link
              to="/articles"
              className="inline-flex items-center px-8 py-4 rounded-full bg-white text-orange-600 font-semibold hover:bg-orange-50 transition-colors duration-200"
            >
              Browse All Articles
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Articles Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
          </div>
          <Link 
            to="/articles" 
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
          >
            View all
            <FiArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* Latest Articles Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
          <Link 
            to="/articles" 
            className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
          >
            View all
            <FiArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative rounded-2xl bg-gradient-to-r from-orange-600 to-orange-400 p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">
                Stay Updated
              </h2>
              <p className="text-orange-100 text-lg mb-6 max-w-2xl">
                Subscribe to our newsletter to receive the latest articles, tutorials, and updates directly in your inbox.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-xl">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-4 py-3 rounded-xl border-2 border-transparent focus:border-orange-300 focus:ring-0"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-colors duration-200"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 