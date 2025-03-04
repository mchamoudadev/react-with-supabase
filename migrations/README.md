# Database Migrations

This directory contains SQL migration files for the Supabase database.

## How to Run Migrations

You can run these migrations using the Supabase SQL Editor in the dashboard or using the Supabase CLI.

### Using Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Using Supabase CLI

1. Install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Log in to your Supabase account:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref your-project-ref
   ```

4. Run the migration:
   ```
   supabase db push migrations/add_featured_image_path.sql
   ```

## Migration Files

- `add_featured_image_path.sql`: Adds the `featured_image_path` column to the `articles` table and sets up storage policies for article images.
- `fix_storage_policies.sql`: Fixes the storage policies for the article-images bucket to allow authenticated users to upload images and manage their own files. 