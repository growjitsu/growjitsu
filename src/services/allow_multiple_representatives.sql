-- ARENACOMP: ALLOW MULTIPLE REPRESENTATIVES PER TEAM
-- Este script remove a restrição de um único representante por equipe

-- 1. Remover o índice de unicidade que limita a um representante por equipe
DROP INDEX IF EXISTS idx_one_representative_per_team;

-- 2. Garantir que a função is_team_representative continue funcionando corretamente
-- (Ela já usa EXISTS, então funcionará com múltiplos representantes)
CREATE OR REPLACE FUNCTION public.is_team_representative(p_team_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
    AND user_id = auth.uid()
    AND role = 'representative'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atualizar as políticas de RLS da tabela teams para permitir que representantes editem
DROP POLICY IF EXISTS "Teams are updatable by admins and representatives" ON teams;
CREATE POLICY "Teams are updatable by admins and representatives" ON teams
FOR UPDATE USING (
  is_admin() OR 
  is_team_representative(id)
);

-- 4. Garantir que representantes possam inserir membros na sua equipe
DROP POLICY IF EXISTS "team_members_insert_policy" ON team_members;
CREATE POLICY "team_members_insert_policy" ON team_members
FOR INSERT WITH CHECK (
  is_admin() OR 
  is_team_representative(team_id)
);

-- 5. Garantir que representantes possam atualizar membros na sua equipe
DROP POLICY IF EXISTS "team_members_update_policy" ON team_members;
CREATE POLICY "team_members_update_policy" ON team_members
FOR UPDATE USING (
  is_admin() OR 
  is_team_representative(team_id)
);

-- 6. Garantir que representantes possam deletar membros na sua equipe
DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;
CREATE POLICY "team_members_delete_policy" ON team_members
FOR DELETE USING (
  is_admin() OR 
  is_team_representative(team_id)
);
