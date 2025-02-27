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
