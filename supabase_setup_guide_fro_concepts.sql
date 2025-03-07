-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create public schema tables
-- Users table linked to auth.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  featured_image_url TEXT
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Create a trigger to create a user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users table policies
CREATE POLICY "Users can view all user profiles" 
  ON public.users FOR SELECT 
  TO authenticated, anon 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Articles table policies
CREATE POLICY "Anyone can view published articles" 
  ON public.articles FOR SELECT 
  TO authenticated, anon 
  USING (published = true);

CREATE POLICY "Authors can view their own unpublished articles" 
  ON public.articles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can create articles" 
  ON public.articles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own articles" 
  ON public.articles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own articles" 
  ON public.articles FOR DELETE 
  TO authenticated 
  USING (auth.uid() = author_id);

-- Comments table policies
CREATE POLICY "Anyone can view comments on published articles" 
  ON public.comments FOR SELECT 
  TO authenticated, anon 
  USING (EXISTS (
    SELECT 1 FROM public.articles 
    WHERE articles.id = comments.article_id AND published = true
  ));

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Likes table policies
CREATE POLICY "Anyone can view likes on published articles" 
  ON public.likes FOR SELECT 
  TO authenticated, anon 
  USING (EXISTS (
    SELECT 1 FROM public.articles 
    WHERE articles.id = likes.article_id AND published = true
  ));

CREATE POLICY "Authenticated users can like articles" 
  ON public.likes FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
  ON public.likes FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create indices for better performance
CREATE INDEX articles_author_id_idx ON public.articles (author_id);
CREATE INDEX articles_tags_idx ON public.articles USING GIN (tags);
CREATE INDEX comments_article_id_idx ON public.comments (article_id);
CREATE INDEX comments_user_id_idx ON public.comments (user_id);
CREATE INDEX likes_article_id_idx ON public.likes (article_id);
CREATE INDEX likes_user_id_idx ON public.likes (user_id); 


--policy for profile page update


CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);



Now we need to install the dompurify package to properly sanitize HTML content:




<think>The user is asking about the `options` object in the `formatDate` function, specifically about the options provided to `toLocaleDateString()`. Let me explain what this configuration does with examples.</think># Date Formatting Options Explained

The line `const options = { year: 'numeric', month: 'long', day: 'numeric' };` defines formatting options for the `toLocaleDateString()` method. These options control how the date is displayed to the user.

## Breaking Down Each Option:

### `year: 'numeric'`
This displays the year as a full number.
- Example: `2023` instead of `'23`

### `month: 'long'`
This displays the full name of the month.
- Example: `September` instead of `Sep` or `9`

### `day: 'numeric'`
This displays the day of the month as a number without leading zeros.
- Example: `5` instead of `05`

## Examples of Different Formatting Options:

For the date: September 5, 2023

```javascript
// Current options in your code
const options1 = { year: 'numeric', month: 'long', day: 'numeric' };
// Result: "September 5, 2023"

// Short month and 2-digit day
const options2 = { year: 'numeric', month: 'short', day: '2-digit' };
// Result: "Sep 05, 2023"

// Numeric month and day
const options3 = { year: 'numeric', month: 'numeric', day: 'numeric' };
// Result: "9/5/2023" (in US locale)

// 2-digit year
const options4 = { year: '2-digit', month: 'short', day: 'numeric' };
// Result: "Sep 5, 23"
```

## Other Possible Values:

- For `year`: `'numeric'` (2023) or `'2-digit'` (23)
- For `month`: `'numeric'` (9), `'2-digit'` (09), `'short'` (Sep), `'long'` (September), `'narrow'` (S)
- For `day`: `'numeric'` (5) or `'2-digit'` (05)

## Locale Impact:

The format also changes based on the locale provided (or browser's default if none specified):

```javascript
// US English (default in your code when using undefined)
date.toLocaleDateString('en-US', options1)
// Result: "September 5, 2023"

// British English
date.toLocaleDateString('en-GB', options1)
// Result: "5 September 2023"

// French
date.toLocaleDateString('fr-FR', options1)
// Result: "5 septembre 2023"
```

This approach gives you consistent, localized date formatting across your application.



(auth.uid() = author_id)




-- Allow users to delete their own comments OR allow article authors to delete any comments on their articles
(auth.uid() = user_id) OR 
(auth.uid() IN (SELECT author_id FROM articles WHERE id = article_id))




for comments policy 


<think>The user is asking about the RLS policies for insertion and update operations for comments, not just deletion. Let me address this.</think>I understand now - you're asking about the Row-Level Security (RLS) policies for inserting and updating comments, not just for deletion. Let me provide the complete set of policies you should have for comments:

### Comment RLS Policies (Complete Set)

#### 1. INSERT Policy for Comments
```sql
-- Allow any authenticated user to create comments
(auth.uid() IS NOT NULL)
```
This allows any logged-in user to create comments on any article.

#### 2. UPDATE Policy for Comments
```sql
-- Allow users to update only their own comments
(auth.uid() = user_id)
```
This restricts comment editing to only the original author of the comment.

#### 3. DELETE Policy for Comments
```sql
-- Allow comment authors to delete their own comments OR article authors to delete any comments
(auth.uid() = user_id) OR 
(auth.uid() IN (SELECT author_id FROM articles WHERE id = article_id))
```
This allows both comment authors and article authors to delete comments.

#### 4. SELECT Policy for Comments
```sql
-- Allow anyone to read comments
TRUE
```
This makes comments publicly readable (typical for a blog).

### Implementation Steps

To set these up in Supabase:

1. Go to your Supabase dashboard
2. Navigate to "Table Editor" → "comments"
3. Go to "Policies" tab
4. Create separate policies for each operation type (INSERT, UPDATE, DELETE, SELECT)
5. Use the conditions I provided above

This creates a balanced system where:
- Any authenticated user can leave comments
- Users can only edit their own comments
- Both comment authors and article authors can delete comments
- Everyone can read all comments

Does this cover the insertion and update permissions you were asking about?



-- Allow anyone to read comments on published articles
TRUE
