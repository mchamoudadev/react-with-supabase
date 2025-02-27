# Supabase Setup Guide for Blog Application

This guide explains how to set up Supabase for the blog application using a client-side approach for user management.

## Prerequisites

- Supabase account
- Access to Supabase project dashboard

## Step 1: Create a Supabase Project

1. Visit [Supabase Dashboard](https://app.supabase.io/)
2. Click "New Project"
3. Enter your project details
4. Wait for the project to be created (may take a few minutes)

## Step 2: Set Up Email Authentication

1. In the Supabase dashboard, go to Authentication → Settings
2. Under "Email Auth", ensure it is enabled
3. Configure the settings:
   - Set "Confirm email" as preferred (more secure)
   - Set up your site URL and redirect URLs (important for password reset functionality)
4. Under "Authentication → URL Configuration", set:
   - Site URL: Your app's main URL (e.g., http://localhost:5173 for development)
   - Redirect URLs: Add paths for auth redirects (e.g., http://localhost:5173/reset-password)

## Step 3: Set Up Database Tables

### Creating Tables

1. Go to the **Database** section in your Supabase dashboard
2. Go to the **Table Editor** tab
3. Create the following tables:

#### Users Table

Create a table named `users` with the following columns:
- `id` (UUID, primary key) - References auth.users.id
- `username` (text, not null, unique)
- `avatar_url` (text, nullable)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

#### Articles Table

Create a table named `articles` with the following columns:
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

Create a table named `comments` with the following columns:
- `id` (UUID, primary key, default: uuid_generate_v4())
- `article_id` (UUID, not null) - References articles.id
- `user_id` (UUID, not null) - References users.id
- `content` (text, not null)
- `created_at` (timestamp with time zone, default: now())
- `updated_at` (timestamp with time zone, default: now())

Add a foreign key constraint that deletes comments when the associated article is deleted (ON DELETE CASCADE).

#### Likes Table

Create a table named `likes` with the following columns:
- `id` (UUID, primary key, default: uuid_generate_v4())
- `article_id` (UUID, not null) - References articles.id
- `user_id` (UUID, not null) - References users.id
- `created_at` (timestamp with time zone, default: now())

Add a unique constraint on (article_id, user_id) to prevent duplicate likes.
Add a foreign key constraint that deletes likes when the associated article is deleted (ON DELETE CASCADE).

## Step 4: Configure Row Level Security

### Enable RLS on All Tables

For each table (users, articles, comments, likes), enable Row Level Security:
1. Go to the table settings
2. Click on "Enable RLS" button

### Set Up RLS Policies

For each table, set up the appropriate RLS policies:

#### Users Table Policies:

- Create a policy named "Users can view all user profiles":
  - Operation: SELECT
  - Target roles: authenticated, anon
  - Using expression: `true`

- Create a policy named "Users can update own profile":
  - Operation: UPDATE
  - Target roles: authenticated
  - Using expression: `auth.uid() = id`

#### Articles Table Policies:

- Create a policy named "Anyone can view published articles":
  - Operation: SELECT
  - Target roles: authenticated, anon
  - Using expression: `published = true`

- Create a policy named "Authors can view their own unpublished articles":
  - Operation: SELECT
  - Target roles: authenticated
  - Using expression: `auth.uid() = author_id`

- Create a policy named "Authors can create articles":
  - Operation: INSERT
  - Target roles: authenticated
  - With check expression: `auth.uid() = author_id`

- Create a policy named "Authors can update their own articles":
  - Operation: UPDATE
  - Target roles: authenticated
  - Using expression: `auth.uid() = author_id`

- Create a policy named "Authors can delete their own articles":
  - Operation: DELETE
  - Target roles: authenticated
  - Using expression: `auth.uid() = author_id`

#### Comments Table Policies:

- Create a policy named "Anyone can view comments on published articles":
  - Operation: SELECT
  - Target roles: authenticated, anon
  - Using expression: 
    ```sql
    EXISTS (
      SELECT 1 FROM public.articles 
      WHERE articles.id = comments.article_id AND published = true
    )
    ```

- Create a policy named "Authenticated users can create comments":
  - Operation: INSERT
  - Target roles: authenticated
  - With check expression: `auth.uid() = user_id`

- Create a policy named "Users can update their own comments":
  - Operation: UPDATE
  - Target roles: authenticated
  - Using expression: `auth.uid() = user_id`

- Create a policy named "Users can delete their own comments":
  - Operation: DELETE
  - Target roles: authenticated
  - Using expression: `auth.uid() = user_id`

#### Likes Table Policies:

- Create a policy named "Anyone can view likes on published articles":
  - Operation: SELECT
  - Target roles: authenticated, anon
  - Using expression:
    ```sql
    EXISTS (
      SELECT 1 FROM public.articles 
      WHERE articles.id = likes.article_id AND published = true
    )
    ```

- Create a policy named "Authenticated users can like articles":
  - Operation: INSERT
  - Target roles: authenticated
  - With check expression: `auth.uid() = user_id`

- Create a policy named "Users can remove their own likes":
  - Operation: DELETE
  - Target roles: authenticated
  - Using expression: `auth.uid() = user_id`

## Step 5: Create Indexes for Better Performance

Go to the SQL Editor and run the following queries to create indexes:

```sql
CREATE INDEX articles_author_id_idx ON public.articles (author_id);
CREATE INDEX articles_tags_idx ON public.articles USING GIN (tags);
CREATE INDEX comments_article_id_idx ON public.comments (article_id);
CREATE INDEX comments_user_id_idx ON public.comments (user_id);
CREATE INDEX likes_article_id_idx ON public.likes (article_id);
CREATE INDEX likes_user_id_idx ON public.likes (user_id);
```

## Step 6: Set Up Storage Buckets (Optional)

If you want to allow users to upload images for articles or avatars:

1. Go to **Storage** in the Supabase dashboard
2. Click **Create a new bucket**
3. Create two buckets:
   - `avatars` - for user profile pictures
   - `article-images` - for article featured images

4. For each bucket, set up access policies:

For article-images bucket:
```sql
-- Anyone can view article images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'article-images');

-- Only authenticated users can upload images
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- Only owners can update or delete their images
CREATE POLICY "Owners can update/delete" 
ON storage.objects FOR UPDATE, DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'article-images');
```

For avatars bucket:
```sql
-- Anyone can view avatars
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Only authenticated users can upload avatars
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Only owners can update or delete their avatars
CREATE POLICY "Owners can update/delete" 
ON storage.objects FOR UPDATE, DELETE
TO authenticated
USING (auth.uid() = owner AND bucket_id = 'avatars');
```

## Step 7: Get Your API Keys

1. Go to **Project Settings** → **API** in the Supabase dashboard
2. Copy your "URL" and "anon/public" key
3. Create a `.env` file in your project root (based on the .env.example)
4. Add your keys:

```
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

## Client-Side User Management

Instead of using database triggers to create user profiles, this project uses a client-side approach. When a user signs up or signs in (especially through OAuth), we check if they have a profile and create one if needed.

The main benefits of this approach:
- No need for database triggers
- More control over the user creation process
- Easier to handle error cases
- Works well with OAuth providers

Key files that handle this logic:
- `src/lib/auth.js` - Handles authentication and profile management
- `src/context/AuthContext.jsx` - Provides auth state throughout the app
- `src/components/AuthForm.jsx` - Example signup/signin form

## Using the API

The project includes several utility files for working with Supabase:

- `src/lib/supabase.js`: Main Supabase client configuration
- `src/lib/auth.js`: User authentication utilities
- `src/lib/articles.js`: Article management utilities

### Authentication Example

```javascript
import { signUp, signIn, signOut } from './lib/auth';

// Sign up a new user
async function handleSignUp() {
  try {
    await signUp('user@example.com', 'password123', {
      username: 'johndoe',
      avatar_url: 'https://example.com/avatar.jpg'
    });
    // Redirect or update UI
  } catch (error) {
    console.error('Sign up error:', error);
  }
}

// Sign in
async function handleSignIn() {
  try {
    await signIn('user@example.com', 'password123');
    // Redirect or update UI
  } catch (error) {
    console.error('Sign in error:', error);
  }
}
```

### Articles Example

```javascript
import { getPublishedArticles, createArticle, likeArticle } from './lib/articles';

// Get all published articles
async function fetchArticles() {
  try {
    const { articles, count } = await getPublishedArticles({
      limit: 10,
      offset: 0,
      orderBy: 'created_at',
      ascending: false
    });
    // Update UI with articles
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
}

// Create a new article
async function handleCreateArticle() {
  try {
    const article = await createArticle({
      title: 'My New Article',
      content: '<p>This is the content of my article.</p>',
      tags: ['React', 'JavaScript'],
      authorId: 'user-uuid',
      published: true
    });
    // Redirect or update UI
  } catch (error) {
    console.error('Error creating article:', error);
  }
}
```

## Database Schema

Here's a summary of the database schema:

1. **users** - User profiles
   - id (UUID, primary key, references auth.users)
   - username (text, unique)
   - avatar_url (text, optional)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **articles** - Blog posts
   - id (UUID, primary key)
   - title (text)
   - content (text)
   - author_id (UUID, references users.id)
   - tags (text array)
   - created_at (timestamp)
   - updated_at (timestamp)
   - published (boolean)
   - featured_image_url (text, optional)

3. **comments** - Article comments
   - id (UUID, primary key)
   - article_id (UUID, references articles.id)
   - user_id (UUID, references users.id)
   - content (text)
   - created_at (timestamp)
   - updated_at (timestamp)

4. **likes** - Article likes
   - id (UUID, primary key)
   - article_id (UUID, references articles.id)
   - user_id (UUID, references users.id)
   - created_at (timestamp)
   - unique constraint on (article_id, user_id) 