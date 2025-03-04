# Blogify - Modern Blogging Platform

A beautiful, full-featured blogging platform built with React, Vite, and Supabase. This application provides a modern Medium-like experience where users can write articles, categorize them with tags, and interact via likes and comments.

## Features

- 🎨 Beautiful UI with Tailwind CSS v4
- ✍️ Rich text editor for article creation
- 🏷️ Tag system for categorizing articles
- 👍 Social interactions (likes and comments)
- 📱 Fully responsive design
- 🔍 Search and filtering functionality
- 🌐 Built with React Router v7

## Tech Stack

- **Frontend:**
  - React 19
  - Vite
  - Tailwind CSS v4
  - React Router v7
  - React Quill (rich text editor)
  - React Icons
  - React Hook Form

- **Backend:**
  - Supabase (Authentication, Database, Storage)

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/blogify.git
   cd blogify
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Database Schema

- **profiles:** id, username, avatar_url, bio
- **articles:** id, title, content, author_id, created_at
- **tags:** id, name
- **article_tags:** article_id, tag_id (junction table)
- **comments:** article_id (FK), user_id (FK), content, created_at
- **likes:** article_id (FK), user_id (FK), created_at

## Deployment

To build for production:

```
npm run build
```

The build output will be in the `dist` directory ready to be deployed to your hosting provider.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ using React, Vite, and Supabase# react-with-supabase

npm install react-simplemde-editor easymde react-markdown

## Setting Up Supabase Storage

This application uses Supabase Storage for uploading and managing images. Follow these steps to set up the storage bucket and policies:

1. Log in to your Supabase dashboard
2. Navigate to the Storage section
3. Create a new bucket named `article-images` and set it to public
4. Navigate to the SQL Editor
5. Run the SQL commands from `migrations/fix_storage_policies.sql` to set up the storage policies

### Storage Policies

The application uses the following storage policies:

- Users can upload files to their own folder (based on their user ID)
- Users can update files in their own folder
- Users can delete files in their own folder
- Anyone can view files in the bucket

### Testing File Uploads

You can test file uploads by navigating to `/upload-test` in the application. This page provides a simple interface for uploading files and viewing your uploaded images.

## Troubleshooting

If you encounter issues with file uploads, check the following:

1. Make sure you're signed in
2. Check that the storage bucket is set to public
3. Verify that the storage policies are set up correctly
4. Check the browser console for error messages