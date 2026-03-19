-- ARENACOMP: FIX REPRESENTATIVE AND LOCATION
-- Run this in your Supabase SQL Editor

-- 1. Ensure teams table has location columns with correct types (UUID)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES states(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- 2. Ensure profiles table has location columns with correct types (UUID)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES states(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- 3. Ensure team_members has the correct structure
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('representative', 'member')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 4. Enforce only one representative per team
DROP INDEX IF EXISTS one_representative_per_team;
CREATE UNIQUE INDEX one_representative_per_team
ON team_members (team_id)
WHERE role = 'representative';

-- 5. RLS for team_members (as requested by user)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert team_members" ON team_members;
CREATE POLICY "Allow insert team_members"
ON team_members
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete team_members" ON team_members;
CREATE POLICY "Allow delete team_members"
ON team_members
FOR DELETE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Membros são visíveis por todos" ON team_members;
CREATE POLICY "Membros são visíveis por todos" ON team_members FOR SELECT USING (true);

-- 6. RLS for location tables (ensure they are public)
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Countries are viewable by everyone" ON countries;
CREATE POLICY "Countries are viewable by everyone" ON countries FOR SELECT USING (true);

DROP POLICY IF EXISTS "States are viewable by everyone" ON states;
CREATE POLICY "States are viewable by everyone" ON states FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cities are viewable by everyone" ON cities;
CREATE POLICY "Cities are viewable by everyone" ON cities FOR SELECT USING (true);
