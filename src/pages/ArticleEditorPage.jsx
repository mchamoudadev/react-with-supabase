import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { FiSave, FiX, FiTag, FiUpload, FiImage, FiInfo } from 'react-icons/fi'
import QuillEditor from '../components/QuillEditor'
import { createArticle, updateArticle, getArticleById } from '../lib/articles'
import { uploadImage } from '../lib/storage'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

// Convert HTML content to Quill Delta format - simplified version
const prepareContentForQuill = (html) => {
  if (!html) return '';
  return html;
};

// Available tags - In a real app, fetch from Supabase
const AVAILABLE_TAGS = [
  'React', 'JavaScript', 'CSS', 'Tailwind', 'Web Development', 
  'Backend', 'Frontend', 'UI Design', 'Performance', 'Supabase',
  'Real-time', 'API', 'Testing', 'TypeScript', 'Future Tech'
]

export default function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const isEditMode = Boolean(id)
  
  // State for article data
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('') // Always initialize as an empty string
  const [selectedTags, setSelectedTags] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false)
  const [featuredImageUrl, setFeaturedImageUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [error, setError] = useState(null)
  
  // State for image upload
  const [selectedImage, setSelectedImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePath, setImagePath] = useState('')
  
  const fileInputRef = useRef(null)
  const editorRef = useRef(null)
  
  // Load article data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchArticle = async () => {
        try {
          const article = await getArticleById(id)

          console.log('Article:', article)
          if (!article) {
            setError('Article not found')
            return
          }
          
          // Check if user is the author
          if (article.author_id !== user?.id) {
            setError('You do not have permission to edit this article')
            return
          }
          
          setTitle(article.title || '')
          setContent(article.content || '')
          setSelectedTags(article.tags || [])
          
          // Handle featured image loading with explicit error handling
          if (article.featured_image_url) {
            console.log('Loading existing featured image:', article.featured_image_url)
            // Simply set the URL directly without the fetch check
            setFeaturedImageUrl(article.featured_image_url)
          } else {
            setFeaturedImageUrl('')
          }
          
          setImagePath(article.featured_image_path || '')
          setIsPublished(article.published || false)
        } catch (err) {
          console.error('Error fetching article:', err)
          setError('Failed to load article')
        }
      }
      
      fetchArticle()
    }
  }, [id, isEditMode, user?.id])
  
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }
  
  const handleContentChange = (value) => {
    setContent(value)
  }
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        e.target.value = '' // Clear the file input
        return
      }
      
      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        toast.error(`Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds the 5MB limit`)
        e.target.value = '' // Clear the file input
        setSelectedImage(null)
        return
      }
      
      setSelectedImage(file)
      toast.success(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      console.log('Selected image:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        type: file.type
      })
    }
  }
  
  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first')
      return
    }
    
    // Check if user is logged in
    if (!user) {
      toast.error('You must be signed in to upload images')
      navigate('/signin')
      return
    }
    
    setIsUploading(true)
    console.log('Starting image upload for:', selectedImage)
    
    try {
      // Upload image to Supabase Storage
      const { path, url } = await uploadImage(selectedImage, user.id)
      console.log('Image upload successful:', { path, url })
      
      // Set the image URL and path immediately
      setFeaturedImageUrl(url)
      setImagePath(path)
      
      // Clear selected image and file input
      setSelectedImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Show success message
      toast.success('Image uploaded successfully')
      console.log('Image state after upload:', {
        featuredImageUrl: url,
        imagePath: path
      })

      // Return the uploaded image data
      return { url, path }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`)
      throw error
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSave = async (publishStatus = null) => {
    // Validate inputs
    if (!title.trim()) {
      toast.error('Please add a title to your article')
      return
    }
    
    // Check for content
    if (!content || content === '<p><br></p>') {
      toast.error('Please add some content to your article')
      return
    }
    
    // If user is not logged in, redirect to sign in
    if (!user) {
      toast.error('You must be signed in to save an article')
      navigate('/signin')
      return
    }
    
    let uploadedImageData = null
    
    // Check if there's a selected image that hasn't been uploaded yet
    if (selectedImage) {
      console.log('Selected image needs to be uploaded first:', selectedImage)
      const shouldUpload = confirm('You have a selected image that hasn\'t been uploaded yet. Would you like to upload it now?')
      if (shouldUpload) {
        try {
          uploadedImageData = await handleImageUpload()
          console.log('Image uploaded during save:', uploadedImageData)
          
          // Wait a moment for state to update
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error('Failed to upload image during save:', error)
          toast.error('Failed to upload image. Please try uploading the image first.')
          return
        }
      } else {
        // If user doesn't want to upload the image, ask if they want to proceed without it
        const shouldProceed = confirm('Do you want to proceed without uploading the image?')
        if (!shouldProceed) {
          return
        }
        // Clear the selected image since user chose not to upload
        setSelectedImage(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
    
    setIsSaving(true)
    console.log('Starting article save with state:', {
      isEditMode,
      featuredImageUrl,
      imagePath,
      selectedImage,
      uploadedImageData
    })
    
    try {
      // Determine if we should update the publish status
      const published = publishStatus !== null ? publishStatus : isPublished
      
      // Get the current image state, preferring newly uploaded image if available
      const currentImageUrl = uploadedImageData?.url || featuredImageUrl
      const currentImagePath = uploadedImageData?.path || imagePath
      
      console.log('Current image state:', {
        featuredImageUrl: currentImageUrl,
        imagePath: currentImagePath,
        selectedImage,
        uploadedImageData
      })
      
      const articleData = {
        title,
        content,
        tags: selectedTags,
        authorId: user.id,
        published,
        featuredImageUrl: currentImageUrl,
        featuredImagePath: currentImagePath
      }
      
      console.log('Saving article with data:', articleData)
      
      let savedArticle
      
      if (isEditMode) {
        // Update existing article
        savedArticle = await updateArticle(id, articleData)
      } else {
        // Create new article
        savedArticle = await createArticle(articleData)
      }
      
      console.log('Article saved successfully:', savedArticle)
      
      // Show success message and navigate to the article view
      toast.success(`Article ${isEditMode ? 'updated' : 'created'} successfully!`)
      navigate(`/article/${savedArticle.id}`)
    } catch (error) {
      console.error('Error saving article:', error)
      toast.error('Failed to save your article. Please try again later.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleCancel = () => {
    navigate(-1)
  }
  
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    )
  }
  
  // If there's an error, show it
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Link to="/" className="text-sm font-medium text-red-600 hover:text-red-500">
                  Go back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          {isEditMode ? 'Edit Article' : 'Create New Article'}
        </h1>
        
        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <FiX className="inline mr-2" />
            Cancel
          </button>
          
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="inline mr-2" />
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>
          
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="inline mr-2" />
            {isSaving ? 'Saving...' : 'Save and Publish'}
          </button>
        </div>
      </div>
      
      {/* Title input */}
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          placeholder="Enter article title"
        />
      </div>
      
      {/* Featured Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Featured Image
          <button
            type="button"
            onClick={() => toast.info('Maximum image size allowed is 5MB')}
            className="ml-2 text-xs text-gray-500 hover:text-gray-700"
          >
            <FiInfo className="inline-block" />
          </button>
        </label>
        
        {/* Simplified Image Upload UI */}
        <div className="mb-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="featured-image"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {selectedImage && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await handleImageUpload();
                    } catch (error) {
                      console.error('Failed to upload image:', error);
                      toast.error('Failed to upload image. Please try again.');
                    }
                  }}
                  disabled={isUploading}
                  className="px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Display currently stored image */}
        {featuredImageUrl && (
          <div className="mt-2 mb-4">
            <img 
              src={featuredImageUrl} 
              alt="Featured image" 
              className="w-full max-h-64 object-cover rounded-md"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500 truncate max-w-[80%]">{featuredImageUrl}</span>
              <button
                type="button"
                onClick={() => {
                  setFeaturedImageUrl('');
                  setImagePath('');
                  setSelectedImage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-red-500 text-xs hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Tags selection */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <span 
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              <button 
                type="button"
                className="ml-1.5 inline-flex text-orange-400 hover:text-orange-600 focus:outline-none"
              >
                <span className="sr-only">Remove tag {tag}</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        
        <button
          type="button"
          onClick={() => setIsTagsMenuOpen(!isTagsMenuOpen)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <FiTag className="mr-1.5 h-4 w-4" />
          Add Tags
        </button>
        
        {isTagsMenuOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <div className="grid grid-cols-2 gap-2 p-2">
              {AVAILABLE_TAGS.map(tag => (
                <div 
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 ${
                    selectedTags.includes(tag) ? 'bg-orange-50 text-orange-700' : ''
                  }`}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Content editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <div className="border border-gray-300 rounded-md overflow-hidden">
          <QuillEditor
            ref={editorRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Write your article content here..."
            height={500}
          />
        </div>
      </div>
      
      <div className="px-6 py-4 md:px-10 flex justify-end space-x-4">
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save as Draft'}
        </button>
        
        <button
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="px-6 py-3 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save and Publish'}
        </button>
      </div>
    </div>
  )
} 