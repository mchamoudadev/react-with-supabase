import { Link } from 'react-router'
import { FiHeart, FiMessageSquare, FiClock, FiUser } from 'react-icons/fi'
import DOMPurify from 'dompurify'

export default function ArticleCard({ article }) {
  const { id, title, content, author, tags, createdAt, created_at, likesCount, commentsCount, featured_image_url } = article

  // Format date - handle both createdAt and created_at
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  }
  
  // Use either createdAt or created_at
  const formattedDate = formatDate(created_at || createdAt);

  // Function to create safe HTML
  const createSafeHTML = (htmlContent) => {
    if (!htmlContent) return '';
    
    // Extract text only from HTML for excerpt
    const textContent = htmlContent.replace(/<[^>]*>?/gm, '');
    return textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Featured Image */}
      {featured_image_url && (
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={featured_image_url} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags && tags.map(tag => (
            <Link 
              key={tag} 
              to={`/tags/${tag}`}
              className="inline-block bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full hover:bg-orange-100 transition-colors duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link to={`/article/${id}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-orange-600 transition-colors duration-200 line-clamp-2">
            {title}
          </h2>
        </Link>
        
        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {createSafeHTML(content)}
        </p>
        
        {/* Author and Meta Info */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <img 
              src={author.avatar_url || 'https://via.placeholder.com/40'} 
              alt={author.username}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <Link 
                to={`/profile/${author.username}`}
                className="text-sm font-medium text-gray-900 hover:text-orange-600"
              >
                {author.username}
              </Link>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <FiClock className="inline w-3 h-3" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {/* Engagement Stats */}
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1 text-sm">
              <FiHeart className="w-4 h-4" />
              <span>{likesCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <FiMessageSquare className="w-4 h-4" />
              <span>{commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 