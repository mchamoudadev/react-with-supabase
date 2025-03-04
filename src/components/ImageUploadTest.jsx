import { useState, useRef } from 'react'
import { uploadImage, listUserImages } from '../lib/storage'
import { useAuth } from '../context/AuthContext'

export default function ImageUploadTest() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')
  const [userImages, setUserImages] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first')
      return
    }

    if (!user) {
      alert('You must be signed in to upload files')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const { path, url } = await uploadImage(file, user.id)
      console.log('Upload successful:', { path, url })
      setUploadedImageUrl(url)
      
      // Reset file input
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      // Refresh the list of images
      fetchUserImages()
    } catch (err) {
      console.error('Upload error:', err)
      setError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const fetchUserImages = async () => {
    if (!user) return
    
    try {
      const images = await listUserImages(user.id)
      setUserImages(images)
    } catch (err) {
      console.error('Error fetching images:', err)
      setError(`Failed to fetch images: ${err.message}`)
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Image Upload Test</h2>
      
      {!user && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
          You must be signed in to upload images
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-orange-50 file:text-orange-700
            hover:file:bg-orange-100"
        />
      </div>
      
      <button
        onClick={handleUpload}
        disabled={!file || uploading || !user}
        className="px-4 py-2 bg-orange-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {uploadedImageUrl && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Uploaded Image:</h3>
          <img 
            src={uploadedImageUrl} 
            alt="Uploaded" 
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={fetchUserImages}
          disabled={!user}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh Image List
        </button>
        
        {userImages.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Your Images:</h3>
            <div className="grid grid-cols-2 gap-2">
              {userImages.map((image, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {image.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 