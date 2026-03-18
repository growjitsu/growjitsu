-- Fix for Team Representative Search
-- Adds email to profiles and ensures RLS is correct

-- 1. Add email column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update existing profiles with email from auth.users (if possible)
-- Note: This requires appropriate permissions in Supabase
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.email IS NULL;

-- 3. Ensure RLS allows searching profiles
-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- 4. Create a function to search users if needed, but ilike should work
