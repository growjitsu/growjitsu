-- ARENACOMP: GLOBAL SUPPORT MIGRATION
-- Countries, States, and Cities structure

-- 1. Create countries table
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code CHAR(2) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create states table
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code CHAR(2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_id, code)
);

-- 3. Create cities table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID REFERENCES states(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state_id, name)
);

-- 4. Update teams table to support global structure
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES states(id);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- 5. Add Unique Index for Representatives
-- Only one representative per team
DROP INDEX IF EXISTS one_representative_per_team;
CREATE UNIQUE INDEX one_representative_per_team
ON team_members (team_id)
WHERE role = 'representative';

-- 6. Insert Default Data (Brazil)
DO $$
DECLARE
    v_country_id UUID;
    v_state_sp_id UUID;
    v_state_rj_id UUID;
BEGIN
    -- Country
    INSERT INTO countries (name, code) VALUES ('Brasil', 'BR')
    ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code
    RETURNING id INTO v_country_id;

    -- States
    INSERT INTO states (country_id, name, code) VALUES (v_country_id, 'São Paulo', 'SP')
    ON CONFLICT (country_id, code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_state_sp_id;

    INSERT INTO states (country_id, name, code) VALUES (v_country_id, 'Rio de Janeiro', 'RJ')
    ON CONFLICT (country_id, code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_state_rj_id;

    -- Cities
    INSERT INTO cities (state_id, name) VALUES (v_state_sp_id, 'São Paulo') ON CONFLICT DO NOTHING;
    INSERT INTO cities (state_id, name) VALUES (v_state_sp_id, 'Santos') ON CONFLICT DO NOTHING;
    INSERT INTO cities (state_id, name) VALUES (v_state_rj_id, 'Rio de Janeiro') ON CONFLICT DO NOTHING;
END $$;

-- 7. Enable RLS for new tables
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries are viewable by everyone" ON countries FOR SELECT USING (true);
CREATE POLICY "States are viewable by everyone" ON states FOR SELECT USING (true);
CREATE POLICY "Cities are viewable by everyone" ON cities FOR SELECT USING (true);
