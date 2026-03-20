-- ARENACOMP: FINAL FIX FOR TEAMS AND STORAGE
-- Este script resolve definitivamente os problemas de múltiplos representantes e upload de logo

-- 1. REMOVER RESTRIÇÃO DE UM ÚNICO REPRESENTANTE
-- Remove o índice parcial que impedia mais de um representante por equipe
DROP INDEX IF EXISTS idx_one_representative_per_team;

-- Se a restrição de unicidade (team_id, user_id) estiver impedindo a alteração de papéis 
-- ou se o usuário quiser remover completamente a restrição de duplicidade de membros:
-- O erro reportado sugere que team_members_team_id_user_id_key é uma CONSTRAINT.
-- NOTA: Geralmente manter UNIQUE(team_id, user_id) é bom, mas se estiver causando conflitos 
-- em fluxos de "deletar e inserir", podemos removê-la ou transformá-la.
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_team_id_user_id_key;

-- 2. GARANTIR QUE A TABELA team_members PERMITA MÚLTIPLOS REPRESENTANTES
-- Criamos um índice que permite (team_id, user_id) serem únicos, mas sem restringir a role.
-- Isso evita que o mesmo usuário seja inserido duas vezes na mesma equipe, 
-- mas permite que vários usuários diferentes sejam 'representative'.
CREATE UNIQUE INDEX IF NOT EXISTS team_members_team_id_user_id_idx ON public.team_members (team_id, user_id);

-- 3. CONFIGURAR STORAGE BUCKET 'team-logos'
-- Garante que o bucket existe e é público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-logos', 
  'team-logos', 
  true, 
  5242880, -- Aumentado para 5MB para garantir
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 4. CONFIGURAR POLÍTICAS DE STORAGE PARA 'team-logos'
-- Remove políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view team logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete logos" ON storage.objects;

-- Criar novas políticas
-- SELECT: Público
CREATE POLICY "Anyone can view team logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logos');

-- INSERT: Usuários autenticados
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-logos');

-- UPDATE: Usuários autenticados
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team-logos');

-- DELETE: Usuários autenticados
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team-logos');

-- 5. GARANTIR FUNÇÕES DE AUXÍLIO PARA RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- 6. ATUALIZAR RLS DA TABELA teams PARA PERMITIR REPRESENTANTES EDITAREM
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow update for representatives and admins" ON public.teams;
CREATE POLICY "Allow update for representatives and admins"
ON public.teams FOR UPDATE
TO authenticated
USING (is_admin() OR is_team_representative(id));

-- 7. ATUALIZAR RLS DA TABELA team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow manage team_members for admins" ON public.team_members;
CREATE POLICY "Allow manage team_members for admins"
ON public.team_members FOR ALL
TO authenticated
USING (is_admin());

-- Permitir que representantes vejam os membros da sua equipe
DROP POLICY IF EXISTS "Allow read team_members for representatives" ON public.team_members;
CREATE POLICY "Allow read team_members for representatives"
ON public.team_members FOR SELECT
TO authenticated
USING (is_admin() OR is_team_representative(team_id));

SELECT 'Configuração concluída com sucesso!' as resultado;
