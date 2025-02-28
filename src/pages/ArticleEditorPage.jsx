import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { FiSave, FiX, FiTag } from 'react-icons/fi'
import QuillEditor from '../components/QuillEditor'

// Convert HTML content to Quill Delta format - simplified version
const prepareContentForQuill = (html) => {
  if (!html) return '';
  return html;
};

// Dummy data for editing - In a real app, fetch from Supabase
const DUMMY_ARTICLE = {
  id: 'edit-1',
  title: 'Getting Started with React Router v7',
  content: '<h2>Introduction</h2><p>React Router v7 introduces several new features that make routing in React applications more intuitive and powerful. In this guide, we will explore the key changes and how to migrate from earlier versions.</p>',
  tags: ['React', 'JavaScript', 'Web Development']
}

// Available tags - In a real app, fetch from Supabase
const AVAILABLE_TAGS = [
  'React', 'JavaScript', 'CSS', 'Tailwind', 'Web Development', 
  'Backend', 'Frontend', 'UI Design', 'Performance', 'Supabase',
  'Real-time', 'API', 'Testing', 'TypeScript', 'Future Tech'
]

export default function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  
  // State for article data
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('') // Always initialize as an empty string
  const [selectedTags, setSelectedTags] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isTagsMenuOpen, setIsTagsMenuOpen] = useState(false)
  
  const editorRef = useRef(null);
  
  // Load article data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      // In a real app, fetch data from Supabase
      try {
        setTitle(DUMMY_ARTICLE.title || '')
        
        // Convert HTML content to format suitable for Quill
        const articleContent = DUMMY_ARTICLE.content || '';
        const quillContent = prepareContentForQuill(articleContent);
        setContent(quillContent);
        
        setSelectedTags(DUMMY_ARTICLE.tags || [])
      } catch (error) {
        console.error('Error loading article data:', error);
      }
    }
  }, [isEditMode])
  
  // Function to focus the editor
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  
  // Handle content change from the editor
  const handleContentChange = (value) => {
    setContent(value);
  }
  
  const handleSave = async () => {
    // Validate inputs
    if (!title.trim()) {
      alert('Please enter a title for your article')
      return
    }
    
    if (!content.trim()) {
      alert('Please add some content to your article')
      return
    }
    
    setIsSaving(true)
    
    try {
      // In a real app, save to Supabase
      console.log({
        title,
        content,
        tags: selectedTags
      })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to the article view
      navigate('/article/new-article-id')
    } catch (error) {
      console.error('Error saving article:', error)
      alert('Failed to save your article. Please try again later.')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleCancel = () => {
    // Navigate back to the articles page
    navigate('/articles')
  }
  
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }
  
  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-6 md:px-10 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Article' : 'Create New Article'}
            </h1>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <FiX className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="inline mr-2" />
                {isSaving ? 'Saving...' : 'Save Article'}
              </button>
            </div>
          </div>
          
          {/* Title Input */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Article Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-lg border-gray-300 rounded-md p-2"
            />
          </div>
          
          {/* Tags Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <button
                type="button"
                onClick={() => setIsTagsMenuOpen(!isTagsMenuOpen)}
                className="text-sm text-orange-600 hover:text-orange-500 flex items-center"
              >
                <FiTag className="mr-1" />
                {isTagsMenuOpen ? 'Close Tag Selection' : 'Select Tags'}
              </button>
            </div>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.length > 0 ? (
                selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="ml-1.5 inline-flex flex-shrink-0 h-4 w-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500 focus:outline-none focus:bg-orange-500 focus:text-white"
                    >
                      <span className="sr-only">Remove {tag} tag</span>
                      <FiX className="h-4 w-4" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No tags selected</span>
              )}
            </div>
            
            {/* Tags Selection Menu */}
            {isTagsMenuOpen && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">Select tags for your article:</div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedTags.includes(tag)
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Rich Text Editor */}
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-700">Article Content</h2>
          </div>
          
          <div onClick={focusEditor} className="cursor-text">
            <QuillEditor
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Write your article content..."
              className="min-h-[400px]"
              height={400}
            />
          </div>
        </div>
        
        {/* Footer with Save Button */}
        <div className="px-6 py-4 md:px-10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSave className="inline mr-2" />
            {isSaving ? 'Saving...' : 'Save and Publish'}
          </button>
        </div>
      </div>
    </div>
  )
} 