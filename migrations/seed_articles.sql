-- Insert dummy users first
INSERT INTO auth.users (id, email) VALUES
  ('d0d8c19c-1b8b-4b8f-b040-8136e3060e98', 'alex.rivera@example.com'),
  ('e3e20f6c-4b8a-4b8f-b040-8136e3060e99', 'sarah.johnson@example.com'),
  ('f4f31g7d-5c9b-5c9f-c151-9247f4171f00', 'mia.chen@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO public.profiles (id, username, avatar_url, bio)
VALUES
  ('d0d8c19c-1b8b-4b8f-b040-8136e3060e98', 'Alex Rivera', 'https://i.pravatar.cc/150?img=68', 'Frontend developer passionate about React and modern web technologies.'),
  ('e3e20f6c-4b8a-4b8f-b040-8136e3060e99', 'Sarah Johnson', 'https://i.pravatar.cc/150?img=32', 'Tech writer and JavaScript enthusiast. Love sharing knowledge about web development.'),
  ('f4f31g7d-5c9b-5c9f-c151-9247f4171f00', 'Mia Chen', 'https://i.pravatar.cc/150?img=47', 'Full-stack developer specializing in React and Node.js.')
ON CONFLICT (id) DO NOTHING;

-- Insert articles
INSERT INTO public.articles (
  id,
  title,
  content,
  author_id,
  created_at,
  updated_at,
  published,
  excerpt,
  featured_image_url,
  likes_count,
  tags
) VALUES
(
  '1',
  'Getting Started with React Router v7',
  '<h2>Introduction</h2><p>React Router v7 introduces several new features that make routing in React applications more intuitive and powerful. In this guide, we'll explore the key changes and how to migrate from earlier versions.</p><h2>Key Features</h2><p>The latest version brings substantial improvements in type safety, performance, and developer experience.</p>',
  'd0d8c19c-1b8b-4b8f-b040-8136e3060e98',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days',
  true,
  'Learn about the new features and improvements in React Router v7',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
  89,
  ARRAY['React', 'JavaScript', 'Web Development']
),
(
  '2',
  'Building Beautiful UIs with Tailwind CSS v4',
  '<h2>Introduction</h2><p>Tailwind CSS v4 takes utility-first CSS to the next level with improved performance and enhanced customization options.</p><h2>New Features</h2><p>Explore the exciting new features that make UI development faster and more intuitive.</p>',
  'e3e20f6c-4b8a-4b8f-b040-8136e3060e99',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  true,
  'Discover the power of Tailwind CSS v4 and its new features',
  'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
  112,
  ARRAY['CSS', 'Tailwind', 'UI Design']
),
(
  '3',
  'Real-time Applications with Supabase',
  '<h2>Introduction</h2><p>Supabase provides a powerful backend-as-a-service that makes it easy to build real-time applications.</p><h2>Getting Started</h2><p>Learn how to set up Supabase and implement real-time features in your application.</p>',
  'f4f31g7d-5c9b-5c9f-c151-9247f4171f00',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '4 days',
  true,
  'Build real-time features with Supabase',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
  76,
  ARRAY['Supabase', 'Real-time', 'Backend']
),
(
  '4',
  'The Future of Web Development in 2025',
  '<h2>Introduction</h2><p>As we look ahead to 2025, the landscape of web development continues to evolve at a rapid pace.</p><h2>Emerging Trends</h2><p>From AI-driven development to WebAssembly, discover the technologies shaping the future.</p>',
  'e3e20f6c-4b8a-4b8f-b040-8136e3060e99',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  true,
  'Explore the future trends in web development',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd',
  164,
  ARRAY['Future Tech', 'Web Development', 'Trends']
);

-- Insert some likes
INSERT INTO public.likes (article_id, user_id, created_at)
SELECT 
  a.id as article_id,
  u.id as user_id,
  NOW() - (random() * INTERVAL '5 days') as created_at
FROM 
  public.articles a
CROSS JOIN
  auth.users u
WHERE 
  random() < 0.7 -- 70% chance of a like
ON CONFLICT DO NOTHING; 