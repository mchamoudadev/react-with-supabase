import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import ArticleCard from '../components/ArticleCard'
import { FiArrowRight } from 'react-icons/fi'

// Mock data - Replace with Supabase fetch in a real app
const MOCK_FEATURED_ARTICLE = {
  id: 'featured-1',
  title: 'The Future of Web Development in 2025',
  content: 'As we look ahead to 2025, the landscape of web development continues to evolve at a rapid pace. From AI-driven development tools to the rise of WebAssembly, developers are exploring new frontiers that promise to reshape how we build and interact with web applications...',
  author: {
    username: 'Sarah Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?img=32'
  },
  tags: ['Future Tech', 'Web Development', 'Trends'],
  createdAt: '2025-02-15T10:30:00Z',
  likesCount: 164,
  commentsCount: 28
}

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
  }
]

export default function HomePage() {
  // In a real app, fetch data from Supabase
  const [featuredArticle, setFeaturedArticle] = useState(MOCK_FEATURED_ARTICLE)
  const [articles, setArticles] = useState(MOCK_ARTICLES)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to Blogify
            </h1>
            <p className="mt-6 text-xl max-w-2xl mx-auto">
              Your platform for sharing ideas, stories, and knowledge with the world.
            </p>
            <div className="mt-10">
              <Link
                to="/articles"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-orange-700 bg-white hover:bg-gray-50"
              >
                Explore Articles
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Article</h2>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="lg:flex">
            <div className="lg:w-1/2 bg-orange-100 flex items-center justify-center p-12">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-orange-600 text-white text-sm font-semibold rounded-full mb-4">
                  Featured
                </span>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">{featuredArticle.title}</h3>
                <p className="text-gray-600 mb-6">{featuredArticle.content.substring(0, 200)}...</p>
                <Link
                  to={`/article/${featuredArticle.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
                >
                  Read Full Article
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 p-12">
              <div className="flex items-center mb-8">
                <img
                  src={featuredArticle.author.avatarUrl}
                  alt={featuredArticle.author.username}
                  className="h-12 w-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold">{featuredArticle.author.username}</h4>
                  <p className="text-gray-600">
                    {new Date(featuredArticle.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {featuredArticle.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/tags/${tag}`}
                    className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full hover:bg-orange-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center">
                  <FiArrowRight className="h-5 w-5 mr-2 text-orange-600" />
                  <span>Read time: 8 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Articles */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
          <Link to="/articles" className="text-orange-600 hover:text-orange-800 flex items-center">
            View All
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  )
} 