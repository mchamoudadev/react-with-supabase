import { Link } from 'react-router'
import { FiHeart, FiMessageSquare, FiClock } from 'react-icons/fi'

export default function ArticleCard({ article }) {
  const { id, title, content, author, tags, createdAt, likesCount, commentsCount } = article

  // Format date 
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 hover:shadow-xl">
      <div className="p-6">
        <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
          <FiClock className="inline" />
          <span>{formattedDate}</span>
        </div>
        
        <Link to={`/article/${id}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-orange-600 transition-colors duration-200">
            {title}
          </h2>
        </Link>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {content.substring(0, 150)}...
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Link 
              key={tag} 
              to={`/tags/${tag}`}
              className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full hover:bg-orange-200 transition-colors duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <img 
              src={author.avatarUrl || 'https://via.placeholder.com/40'} 
              alt={author.username}
              className="h-8 w-8 rounded-full mr-2" 
            />
            <span className="text-sm font-medium text-gray-900">{author.username}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center">
              <FiHeart className="h-4 w-4 mr-1" />
              <span className="text-xs">{likesCount}</span>
            </div>
            <div className="flex items-center">
              <FiMessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">{commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 