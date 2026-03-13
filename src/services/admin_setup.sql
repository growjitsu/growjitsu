-- Admin Setup for ArenaComp

-- 1. Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_id TEXT,
    target_type TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for admin_logs (only admins can read/write)
CREATE POLICY "Admins can manage logs" ON admin_logs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 4. Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action TEXT,
    p_target_id TEXT,
    p_target_type TEXT,
    p_details JSONB
) RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_logs (admin_id, action, target_id, target_type, details)
    VALUES (p_admin_id, p_action, p_target_id, p_target_type, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Initial Admin User Setup (Run this manually in Supabase SQL Editor)
-- Replace 'YOUR_USER_ID' with the actual ID after signing up admin@arenacomp.com.br
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@arenacomp.com.br';
