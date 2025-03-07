<think>I'll create a comprehensive tutorial for Section 1: Project Overview, based on the specific project structure and implementation I analyzed. I'll be detailed and thorough, focusing on the actual codebase rather than generic information.</think># Blog with Supabase - Project-Specific Tutorial

## 1. Project Overview

Welcome to this comprehensive tutorial for building a modern blog platform with React, Supabase, and Tailwind CSS. This tutorial is based on an actual implementation, walking through each component of the system as it's built in the codebase.

### 1.1 Introduction to the Project

The blog application we're exploring is a full-featured blogging platform that allows users to:
- Create and manage blog articles with a rich text editor
- Categorize articles with tags
- Upload and manage images for articles
- Comment on articles
- Like articles
- Manage user profiles
- Browse published articles

This project combines several modern technologies to create a seamless and responsive user experience:

- **Frontend Framework**: React 19, the latest version of React with improved performance and new features
- **Build Tool**: Vite 6, providing fast development and optimized production builds
- **Styling**: Tailwind CSS v4, for utility-first styling with the latest features
- **Routing**: React Router v7, for client-side navigation
- **Backend**: Supabase, providing authentication, database, and storage services
- **Rich Text Editing**: React Quill, for WYSIWYG content creation
- **Form Handling**: React Hook Form, for efficient form management
- **UI Enhancement**: React Icons, for a wide variety of icons
- **Notifications**: React Hot Toast, for user feedback
- **Date Formatting**: date-fns v4, for working with dates
- **HTML Sanitization**: DOMPurify, for security when rendering HTML content
- **Code Highlighting**: Highlight.js, for code blocks in articles

### 1.2 Project Structure and Architecture

The project follows a well-organized structure that separates concerns and makes the codebase maintainable:

```
blog-with-supabase/
├── public/               # Static assets
├── src/                  # Source code
│   ├── assets/           # Project-specific assets
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and API calls
│   ├── pages/            # Page components
│   ├── styles/           # Global styles
│   ├── App.jsx           # Main application component
│   ├── index.css         # Global CSS
│   └── main.jsx          # Application entry point
├── .env                  # Environment variables
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
└── README.md             # Project documentation
```

Let's examine the key directories in more detail:

#### 1.2.1 Components Directory

The `components/` directory contains reusable UI elements used throughout the application:

- **ArticleCard.jsx**: Displays article previews in listings
- **AuthForm.jsx**: Reusable form for authentication (sign-in, sign-up)
- **CommentSection.jsx**: Manages article comments display and submission
- **Footer.jsx**: Application footer with links and information
- **Header.jsx**: Navigation header with responsive design
- **ImageUploadTest.jsx**: Component for testing image uploads
- **ProtectedRoute.jsx**: Route wrapper that requires authentication
- **QuillEditor.jsx**: Rich text editor component for article creation
- **UnauthenticatedRoute.jsx**: Route wrapper for authentication pages

#### 1.2.2 Pages Directory

The `pages/` directory contains the main view components for each route:

- **ArticleEditorPage.jsx**: Editor for creating and updating articles
- **ArticlePage.jsx**: Displays a single article with comments
- **ArticlesPage.jsx**: Lists all published articles with filtering
- **ForgotPasswordPage.jsx**: Form for password recovery
- **HomePage.jsx**: Landing page with featured articles
- **ManageArticlesPage.jsx**: Dashboard for managing user's articles
- **ProfilePage.jsx**: User profile management
- **ResetPasswordPage.jsx**: Form for setting a new password
- **SignInPage.jsx**: User login page
- **SignUpPage.jsx**: User registration page

#### 1.2.3 Context Directory

The `context/` directory contains React contexts for global state management:

- **AuthContext.jsx**: Manages authentication state throughout the application

#### 1.2.4 Lib Directory

The `lib/` directory contains utility functions and API calls:

- **articles.js**: Functions for article CRUD operations
- **auth.js**: Authentication functions (sign-up, sign-in, etc.)
- **migrate.js**: Utilities for database migrations and article management
- **storage.js**: Functions for Supabase storage operations
- **supabase.js**: Supabase client initialization

### 1.3 Database Schema

The application uses Supabase's PostgreSQL database with the following tables:

#### Users Table
- `id` (UUID, primary key) - References auth.users.id
- `username` (text, not null, unique)
- `avatar_url` (text, nullable)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

#### Articles Table
- `id` (UUID, primary key, default: uuid_generate_v4())
- `title` (text, not null)
- `content` (text, not null)
- `author_id` (UUID, not null) - References users.id
- `tags` (text array, default: '{}')
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())
- `published` (boolean, default: false)
- `featured_image_url` (text, nullable)

#### Comments Table
- `id` (UUID, primary key, default: uuid_generate_v4())
- `article_id` (UUID, not null) - References articles.id
- `user_id` (UUID, not null) - References users.id
- `content` (text, not null)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

#### Likes Table
- `id` (UUID, primary key, default: uuid_generate_v4())
- `article_id` (UUID, not null) - References articles.id
- `user_id` (UUID, not null) - References users.id
- `created_at` (timestamp with time zone, default: now())

### 1.4 Authentication Flow

The project implements a client-side approach to user management:

1. **User Registration**: When a user signs up, the application creates an entry in Supabase's auth system.
2. **Profile Creation**: After successful authentication, the application checks for an existing profile and creates one if needed.
3. **Authentication State**: The AuthContext monitors the authentication state and provides user information to the entire application.
4. **Protected Routes**: Routes requiring authentication are wrapped with the ProtectedRoute component, which redirects unauthenticated users.
5. **Unauthenticated Routes**: Routes like sign-in and sign-up are wrapped with UnauthenticatedRoute to redirect authenticated users.

Here's an overview of the auth implementation from `src/lib/auth.js`:

```javascript
// User registration
export async function signUp(email, password, username = '') {
  // Create auth user
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  
  // If signup successful and we have a user, create profile
  if (data?.user) {
    // Wait for session to be established
    const { data: sessionData } = await supabase.auth.getSession()
    
    // Create user profile with username or derived from email
    const displayName = username || email.split('@')[0]
    // Profile creation logic follows...
  }
  
  return data
}
```

### 1.5 Article Management

Article management is a core feature of the blog platform:

1. **Creation**: Authenticated users can create articles with a rich text editor.
2. **Publishing**: Authors can choose to publish articles or save them as drafts.
3. **Updating**: Authors can edit their articles at any time.
4. **Soft Deletion**: Instead of permanently deleting articles, the application implements a soft delete mechanism.

The soft delete implementation in `src/lib/migrate.js` is particularly interesting:

```javascript
export const softDeleteArticle = async (id) => {
  try {
    // Use existing fields to "hide" the article:
    // - Set published to false
    // - Update the title to indicate deletion
    // - Set empty content
    const { data, error } = await supabase
      .from('articles')
      .update({
        published: false,
        title: `[DELETED] ${Math.random().toString(36).substring(2, 10)}`, // Randomize for uniqueness
        content: '[This article has been deleted]',
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    
    return { success: true, softDelete: true }
  } catch (e) {
    console.error('Error in softDeleteArticle:', e)
    throw e
  }
}
```

### 1.6 Supabase Integration

Supabase provides the backend functionality for the application through several services:

1. **Authentication**: Handles user registration, login, and session management.
2. **Database**: PostgreSQL database with Row Level Security (RLS) policies.
3. **Storage**: Bucket storage for user uploads like profile pictures and article images.

The Supabase client is initialized in `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export default supabase
```

### 1.7 Row Level Security (RLS)

The project implements Supabase's Row Level Security to ensure data security:

1. **Users Table**: Users can view all profiles but can only update their own.
2. **Articles Table**: Everyone can view published articles, but only authors can manage their own articles.
3. **Comments Table**: Anyone can view comments on published articles, but only the author can edit/delete their comments.
4. **Likes Table**: Anyone can view likes on published articles, but users can only add/remove their own likes.

### 1.8 Routing Structure

The application uses React Router v7 for client-side navigation. Here's the routing structure from `App.jsx`:

```jsx
<Routes>
  {/* Public routes */}
  <Route path="/" element={<HomePage />} />
  <Route path="/articles" element={<ArticlesPage />} />
  <Route path="/article/:id" element={<ArticlePage />} />
  <Route path="/upload-test" element={<ImageUploadTest />} />
  
  {/* Unauthenticated routes (redirect to home if logged in) */}
  <Route path="/signin" element={
    <UnauthenticatedRoute>
      <SignInPage />
    </UnauthenticatedRoute>
  } />
  <Route path="/signup" element={
    <UnauthenticatedRoute>
      <SignUpPage />
    </UnauthenticatedRoute>
  } />
  <Route path="/forgot-password" element={
    <UnauthenticatedRoute>
      <ForgotPasswordPage />
    </UnauthenticatedRoute>
  } />
  <Route path="/reset-password" element={
    <UnauthenticatedRoute>
      <ResetPasswordPage />
    </UnauthenticatedRoute>
  } />
  
  {/* Protected routes */}
  <Route path="/editor" element={
    <ProtectedRoute>
      <ArticleEditorPage />
    </ProtectedRoute>
  } />
  <Route path="/editor/:id" element={
    <ProtectedRoute>
      <ArticleEditorPage />
    </ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  } />
  <Route path="/manage-articles" element={
    <ProtectedRoute>
      <ManageArticlesPage />
    </ProtectedRoute>
  } />
</Routes>
```

### 1.9 Storage Implementation

The project includes Supabase Storage for managing file uploads:

1. **Storage Buckets**: Two main buckets are used:
   - `avatars`: For user profile pictures
   - `article-images`: For article featured images and inline content images

2. **Storage Policies**: Access control is managed through Supabase storage policies:
   - Anyone can view images (public access)
   - Only authenticated users can upload images
   - Only the owner can update or delete their images

### 1.10 UI and Design Principles

The application uses Tailwind CSS v4 for styling, providing:

1. **Utility-First Approach**: Components use utility classes for styling.
2. **Responsive Design**: Mobile-first approach for responsive layouts.
3. **Component-based Design**: Styles are applied directly to components for maintainable code.




<think>Let's move on to the next section of the tutorial. Based on the outline, section 2 should cover "Setup and Installation" with a focus on setting up the project with React 19, Tailwind CSS v4, React Router v7, configuring Vite, and setting up environment variables for Supabase.</think># Blog with Supabase - Project-Specific Tutorial

## 2. Setup and Installation

In this section, we'll walk through setting up your development environment and installing all the necessary dependencies for the blog application. We'll cover everything from creating a new Vite project to configuring Tailwind CSS v4 and setting up Supabase integration.

### 2.1 Prerequisites

Before starting, ensure you have the following installed:

- **Node.js (v20 or newer)**: The JavaScript runtime that powers our application
- **npm or yarn**: Package managers for installing dependencies
- **Git**: Version control for tracking changes
- **Supabase Account**: Sign up at [supabase.com](https://supabase.com) if you don't have an account

### 2.2 Creating a New Vite Project with React 19

Vite is a modern build tool that provides an extremely fast development experience. Let's start by creating a new Vite project with React:

```bash
# Create a new project
npm create vite@latest blog-with-supabase -- --template react

# Navigate to the project directory
cd blog-with-supabase
```

### 2.3 Installing Dependencies

Now, let's install all the dependencies from the package.json file to match our project:

```bash
# Install dependencies
npm install react@19.0.0 react-dom@19.0.0 react-router@7.2.0 @supabase/supabase-js@2.49.1 
npm install tailwindcss@4.0.9 @tailwindcss/vite@4.0.9 @tailwindcss/typography@0.5.16
npm install react-hook-form@7.54.2 react-hot-toast@2.5.2 react-icons@5.5.0
npm install react-quill-new@3.3.3 date-fns@4.1.0 dompurify@3.2.4 highlight.js@11.11.1 uuid@11.1.0

# Install dev dependencies
npm install -D @vitejs/plugin-react-swc@3.8.0 vite@6.2.0
npm install -D eslint@9.21.0 @eslint/js@9.21.0 eslint-plugin-react@7.37.4 
npm install -D eslint-plugin-react-hooks@5.0.0 eslint-plugin-react-refresh@0.4.19 globals@15.15.0
npm install -D @types/react@19.0.10 @types/react-dom@19.0.4
```

This installs all the dependencies specified in your package.json file, including:

- React 19 and React DOM for the UI
- React Router v7 for routing
- Supabase JS client for backend services
- Tailwind CSS v4 for styling
- React Hook Form for form management
- React Hot Toast for notifications
- React Icons for UI icons
- React Quill for rich text editing
- Various utility libraries (date-fns, DOMPurify, highlight.js, uuid)
- Development tools (Vite, ESLint, TypeScript types)

### 2.4 Configuring Vite

Let's set up our Vite configuration file. Create or modify the `vite.config.js` file at the root of your project:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

This configuration includes:
- `@vitejs/plugin-react-swc`: For fast React compilation using SWC
- `@tailwindcss/vite`: For integrating Tailwind CSS v4 with Vite

### 2.5 Setting Up Tailwind CSS v4

Next, let's configure Tailwind CSS v4. First, create a `tailwind.config.js` file at the root of your project:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '100%',
            img: {
              marginTop: '1em',
              marginBottom: '1em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

Now, let's set up the base CSS file. Create or modify `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Base styles */
@layer base {
  body {
    @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold mb-2;
  }
  
  h1 {
    @apply text-3xl sm:text-4xl;
  }
  
  h2 {
    @apply text-2xl sm:text-3xl;
  }
  
  h3 {
    @apply text-xl sm:text-2xl;
  }
  
  a {
    @apply text-blue-600 dark:text-blue-400 hover:underline;
  }
}

/* Custom components */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition-colors;
  }
  
  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden;
  }
  
  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md 
           bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
           focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}

/* Editor styles */
.ql-editor {
  min-height: 200px;
  max-height: 600px;
  overflow-y: auto;
}

.ql-editor img {
  max-width: 100%;
  height: auto;
}

/* Code highlighting styles */
.hljs {
  @apply rounded-md p-4 my-2;
}
```

### 2.6 Setting Up HTML Entry Point

Modify the `index.html` file in the root of your project:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A modern blogging platform built with React and Supabase" />
    <title>Blogify - Modern Blogging Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 2.7 Setting Up Application Entry Point

Now, let's configure our application's entry point. Create or modify `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

### 2.8 Supabase Configuration

Let's set up Supabase integration. First, create a `.env` file at the root of your project:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Also, create a `.env.example` file for reference:

```
# Supabase Configuration
# Replace these with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Other Environment Variables
# Add other environment variables as needed
```

Now, let's create the Supabase client configuration. Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Enable global settings for reliability
  global: {
    // Remove the Content-Type header to allow proper file uploads
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export default supabase
```

### 2.9 ESLint Configuration

For code quality and consistency, let's set up ESLint. Create `eslint.config.js` at the root of your project:

```javascript
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

const compat = new FlatCompat()

export default [
  js.configs.recommended,
  ...compat.config({
    extends: [
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  }),
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  }
]
```

### 2.10 Create Basic Directory Structure

Let's set up the basic directory structure for our application:

```bash
mkdir -p src/assets
mkdir -p src/components
mkdir -p src/context
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/pages
mkdir -p src/styles
```

### 2.11 Configure Scripts in package.json

Update your `package.json` scripts section:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

### 2.12 Testing the Setup

Now, let's test our setup to ensure everything is working correctly:

```bash
# Start the development server
npm run dev
```

If everything is set up correctly, you should see the Vite development server starting, and you can access your application at `http://localhost:5173`.

### 2.13 Git Configuration

Finally, let's configure Git for version control. Create a `.gitignore` file:

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

Initialize Git:

```bash
git init
git add .
git commit -m "Initial setup"
```

### 2.14 Summary

You've now successfully set up the development environment for the blog application with Supabase. The setup includes:

- Creating a Vite project with React 19
- Installing and configuring all necessary dependencies
- Setting up Tailwind CSS v4
- Configuring Supabase integration
- Setting up ESLint for code quality
- Creating the basic directory structure
- Configuring Git for version control

In the next section, we'll dive into integrating Supabase for authentication and database operations, building on this foundation.
