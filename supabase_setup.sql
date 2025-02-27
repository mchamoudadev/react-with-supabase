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