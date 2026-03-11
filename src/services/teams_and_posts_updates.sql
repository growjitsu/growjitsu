-- ArenaComp: Teams and Posts Updates
-- Database Schema Updates (PostgreSQL / Supabase)

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    professor TEXT,
    city TEXT,
    state CHAR(2),
    country TEXT DEFAULT 'Brasil',
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert Initial Teams
INSERT INTO teams (name, professor, city, state)
VALUES 
('ALLIANCE JIU-JITSU', 'Fabio Gurgel', 'São Paulo', 'SP'),
('ATOS JIU-JITSU', 'Andre Galvao', 'San Diego', 'CA'),
('CHECKMAT', 'Leo Vieira', 'São Paulo', 'SP'),
('GRACIE BARRA', 'Carlos Gracie Jr', 'Rio de Janeiro', 'RJ'),
('GFTEAM', 'Julio Cesar Pereira', 'Rio de Janeiro', 'RJ')
ON CONFLICT (name) DO NOTHING;

-- 3. Update Posts Table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT;

-- 4. Update Profiles Table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_leader TEXT;

-- 5. Create function for team rankings if not exists
CREATE OR REPLACE FUNCTION get_team_rankings(p_modality TEXT DEFAULT NULL, p_country TEXT DEFAULT NULL, p_city TEXT DEFAULT NULL)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    logo_url TEXT,
    total_score NUMERIC,
    athlete_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as team_id,
        t.name as team_name,
        t.logo_url,
        SUM(p.arena_score) as total_score,
        COUNT(p.id) as athlete_count
    FROM teams t
    JOIN profiles p ON p.team_id = t.id
    WHERE 
        (p_modality IS NULL OR p.modality ILIKE '%' || p_modality || '%') AND
        (p_country IS NULL OR p.country = p_country) AND
        (p_city IS NULL OR p.city ILIKE p_city)
    GROUP BY t.id, t.name, t.logo_url
    ORDER BY total_score DESC;
END;
$$ LANGUAGE plpgsql;
