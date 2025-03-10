import supabase from './supabase'
import { v4 as uuidv4 } from 'uuid'

/**
 * Upload an image to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} userId - The ID of the user uploading the file
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<{path: string, url: string, key: string, id: string}>} - The file data including path, public URL, key and id
 */
export const uploadImage = async (file, userId, bucket = 'article-images') => {
  try {
    // Get file extension from original filename
    const fileExt = file.name.split('.').pop().toLowerCase()
    
    // Create a unique file path using user ID and UUID, preserving the file extension
    const filename = `${uuidv4()}.${fileExt}`
    const filePath = `${userId}/${filename}`
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return {
      path: filePath,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} path - The file path to delete
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<void>}
 */
export const deleteImage = async (path, bucket = 'article-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

/**
 * List images for a specific user
 * @param {string} userId - The ID of the user
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<Array>} - Array of files
 */
export const listUserImages = async (userId, bucket = 'article-images') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(`${userId}/`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error listing images:', error)
    throw error
  }
} 