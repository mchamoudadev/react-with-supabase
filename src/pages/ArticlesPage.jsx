import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import ArticleCard from '../components/ArticleCard'
import { FiFilter, FiSearch } from 'react-icons/fi'

// Using the same mock data from HomePage
const MOCK_ARTICLES = [
  {
    id: '1',
    title: 'Getting Started with React Router v7',
    content: "React Router v7 introduces several new features that make routing in React applications more intuitive and powerful. In this guide, we'll explore the key changes and how to migrate from earlier versions...",
    author: {
      username: 'Alex Rivera',
      avatarUrl: 'https://i.pravatar.cc/150?img=68'
    },
    tags: ['React', 'JavaScript', 'Web Development'],
    createdAt: '2025-02-10T14:20:00Z',
    likesCount: 89,
    commentsCount: 13
  },
  {
    id: '2',
    title: 'Building Beautiful UIs with Tailwind CSS v4',
    content: "Tailwind CSS v4 takes utility-first CSS to the next level with improved performance, enhanced customization options, and a refined developer experience. Let's dive into the most exciting new features and how to use them in your projects...",
    author: {
      username: 'Mia Chen',
      avatarUrl: 'https://i.pravatar.cc/150?img=47'
    },
    tags: ['CSS', 'Tailwind', 'UI Design'],
    createdAt: '2025-02-08T09:15:00Z',
    likesCount: 112,
    commentsCount: 18
  },
  {
    id: '3',
    title: 'Real-time Applications with Supabase',
    content: "Supabase provides a powerful backend-as-a-service that makes it easy to build real-time applications. In this tutorial, we'll create a collaborative todo app that updates in real-time across multiple clients...",
    author: {
      username: 'Devon Taylor',
      avatarUrl: 'https://i.pravatar.cc/150?img=12'
    },
    tags: ['Supabase', 'Real-time', 'Backend'],
    createdAt: '2025-02-05T16:45:00Z',
    likesCount: 76,
    commentsCount: 9
  },
  {
    id: '4',
    title: 'The Rise of AI in Modern Web Development',
    content: 'Artificial Intelligence is revolutionizing how we build and interact with web applications. From code generation to content creation, AI tools are becoming an essential part of the developer toolkit...',
    author: {
      username: 'Sarah Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=32'
    },
    tags: ['AI', 'Web Development', 'Future Tech'],
    createdAt: '2025-02-01T12:30:00Z',
    likesCount: 132,
    commentsCount: 24
  },
  {
    id: '5',
    title: 'Optimizing Performance in React Applications',
    content: 'Performance optimization is crucial for delivering a smooth user experience. This article explores advanced techniques for identifying and resolving performance bottlenecks in React applications...',
    author: {
      username: 'Alex Rivera',
      avatarUrl: 'https://i.pravatar.cc/150?img=68'
    },
    tags: ['React', 'Performance', 'JavaScript'],
    createdAt: '2025-01-28T08:45:00Z',
    likesCount: 95,
    commentsCount: 15
  }
]

// Extract all unique tags from articles
const ALL_TAGS = [...new Set(MOCK_ARTICLES.flatMap(article => article.tags))]

export default function ArticlesPage() {
  const [articles, setArticles] = useState(MOCK_ARTICLES)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [filteredArticles, setFilteredArticles] = useState(MOCK_ARTICLES)
  
  useEffect(() => {
    // Filter articles based on search term and selected tags
    const filtered = MOCK_ARTICLES.filter(article => {
      // Check if article title or content matches search term
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Check if article has any of the selected tags (or if no tags are selected)
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => article.tags.includes(tag))
      
      return matchesSearch && matchesTags
    })
    
    setFilteredArticles(filtered)
  }, [searchTerm, selectedTags])
  
  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }
  
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            All Articles
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover insights, tutorials, and stories from our community
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-10 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-700 flex items-center">
                <FiFilter className="mr-2" /> Filter by:
              </span>
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    selectedTags.includes(tag) 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
} 