import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { FiSave, FiX, FiTag, FiUpload, FiImage } from 'react-icons/fi'
import QuillEditor from '../components/QuillEditor'
import { createArticle, updateArticle, getArticleById } from '../lib/articles'
import { uploadImage } from '../lib/storage'
import { useAuth } from '../context/AuthContext'

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
  const [uploadProgress, setUploadProgress] = useState(0)
  const [imagePath, setImagePath] = useState('')
  
  const fileInputRef = useRef(null)
  const editorRef = useRef(null)
  
  // Load article data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchArticle = async () => {
        try {
          const article = await getArticleById(id)
          
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
          setFeaturedImageUrl(article.featured_image_url || '')
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
        alert('Please select an image file')
        return
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setFeaturedImageUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const handleImageUpload = async () => {
    if (!selectedImage) {
      alert('Please select an image first')
      return
    }
    
    // Check if user is logged in
    if (!user) {
      alert('You must be signed in to upload images')
      navigate('/signin')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)
      
      // Upload image to Supabase Storage with user ID
      const { path, url } = await uploadImage(selectedImage, user.id)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Update state with the image URL and path
      setFeaturedImageUrl(url)
      setImagePath(path)
      
      // Clear the selected image
      setSelectedImage(null)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }
  
  const handleSave = async (publishStatus = null) => {
    // Validate inputs
    if (!title.trim()) {
      alert('Please enter a title for your article')
      return
    }
    
    if (!content.trim()) {
      alert('Please add some content to your article')
      return
    }
    
    // If user is not logged in, redirect to sign in
    if (!user) {
      alert('You must be signed in to save an article')
      navigate('/signin')
      return
    }
    
    // Check if there's a selected image that hasn't been uploaded yet
    if (selectedImage && !isUploading) {
      const shouldUpload = confirm('You have a selected image that hasn\'t been uploaded yet. Would you like to upload it now?')
      if (shouldUpload) {
        await handleImageUpload()
      }
    }
    
    setIsSaving(true)
    
    try {
      // Determine if we should update the publish status
      const published = publishStatus !== null ? publishStatus : isPublished
      
      const articleData = {
        title,
        content,
        tags: selectedTags,
        authorId: user.id,
        published,
        featuredImageUrl,
        featuredImagePath: imagePath
      }
      
      let savedArticle
      
      if (isEditMode) {
        // Update existing article
        savedArticle = await updateArticle(id, articleData)
      } else {
        // Create new article
        savedArticle = await createArticle(articleData)
      }
      
      // Navigate to the article view
      navigate(`/article/${savedArticle.id}`)
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Failed to save your article. Please try again later.')
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
        </label>
        
        {/* Image Preview */}
        {featuredImageUrl && (
          <div className="mb-4 relative">
            <img 
              src={featuredImageUrl} 
              alt="Featured image preview" 
              className="w-full h-48 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => {
                setFeaturedImageUrl('')
                setSelectedImage(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 focus:outline-none"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* File Input and Upload Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow">
            <label className="block w-full cursor-pointer bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              <FiImage className="inline mr-2" />
              {selectedImage ? selectedImage.name : 'Select Image'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
          
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={!selectedImage || isUploading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiUpload className="inline mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-orange-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Uploading: {uploadProgress}%
            </p>
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