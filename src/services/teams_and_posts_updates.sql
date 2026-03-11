-- Update profiles table to support team leadership and archiving
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_leader BOOLEAN DEFAULT FALSE;

-- Update posts table to support archiving
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags TEXT;

-- Ensure teams table exists (it was mentioned in the summary, but let's be sure)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  professor TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brasil',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to get team rankings (sum of athlete scores)
CREATE OR REPLACE FUNCTION get_team_rankings(
  p_modality TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL
)
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
    COALESCE(SUM(p.arena_score), 0) as total_score,
    COUNT(p.id) as athlete_count
  FROM teams t
  JOIN profiles p ON p.team_id = t.id
  WHERE 
    (p_modality IS NULL OR p.modality = p_modality) AND
    (p_country IS NULL OR p.country = p_country) AND
    (p_city IS NULL OR p.city = p_city)
  GROUP BY t.id, t.name, t.logo_url
  ORDER BY total_score DESC;
END;
$$ LANGUAGE plpgsql;
