import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import ArticleCard from '../components/ArticleCard'
import { FiFilter, FiSearch, FiX, FiLoader } from 'react-icons/fi'
import supabase from '../lib/supabase'
import { toast } from 'react-hot-toast'

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false)
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchArticles()
  }, [])
  
  const fetchArticles = async () => {
    try {
      setLoading(true)
      
      // Fetch all published articles with author information
      const { data, error } = await supabase
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
      
      if (error) throw error
      
      // Extract all unique tags from articles
      if (data) {
        const tagsSet = new Set(data.flatMap(article => article.tags || []))
        setAllTags(Array.from(tagsSet))
        setArticles(data)
        setFilteredArticles(data)
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    // Filter articles based on search term and selected tags
    const filtered = articles.filter(article => {
      // Check if article title or content matches search term
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Check if article has any of the selected tags (or if no tags are selected)
      const matchesTags = selectedTags.length === 0 || 
        (article.tags && selectedTags.some(tag => article.tags.includes(tag)))
      
      return matchesSearch && matchesTags
    })
    
    setFilteredArticles(filtered)
  }, [searchTerm, selectedTags, articles])
  
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-white">Articles</span>
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-2xl mx-auto font-light">
              Discover insights, tutorials, and stories from our community
            </p>
          </div>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-100">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Search Input */}
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-orange-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm md:text-base shadow-sm"
                />
              </div>
            </div>
            
            {/* Tags Filter */}
            <div className="flex-shrink-0">
              <div className="relative">
                <button
                  onClick={() => setIsTagsMenuOpen(!isTagsMenuOpen)}
                  className="inline-flex items-center px-5 py-4 border border-orange-100 rounded-xl text-sm md:text-base font-medium text-gray-700 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all duration-200"
                >
                  <FiFilter className="mr-2 h-5 w-5 text-orange-400" />
                  Filter by Tags
                  {selectedTags.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {selectedTags.length}
                    </span>
                  )}
                </button>
                
                {isTagsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 border border-orange-100">
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors duration-200 ${
                              selectedTags.includes(tag) 
                                ? 'bg-orange-100 text-orange-800 font-medium' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Active Filters */}
          {selectedTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-orange-100 text-orange-800 font-medium"
                >
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-2 focus:outline-none"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </span>
              ))}
              {selectedTags.length > 1 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-700"></div>
          </div>
        ) : filteredArticles.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
            <div className="text-center mt-16">
              <p className="text-gray-500 mb-4">Showing {filteredArticles.length} out of {articles.length} articles</p>
              <Link to="/categories" className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-xl shadow-lg hover:bg-orange-700 transition-colors duration-200">
                Browse Categories
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No articles found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedTags([])
              }}
              className="inline-flex items-center px-5 py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 