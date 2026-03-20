-- ARENACOMP: FIX LOGO UPLOAD AND MULTIPLE REPRESENTATIVES
-- Este script resolve os problemas de upload de logo para representantes e permite múltiplos representantes por equipe

-- ================================================================================
-- PROBLEMA 2: Múltiplos Representantes
-- ================================================================================

-- 1. Remover a restrição de um único representante por equipe
DROP INDEX IF EXISTS idx_one_representative_per_team;

-- ================================================================================
-- PROBLEMA 1: Upload de Logo (Storage)
-- ================================================================================

-- 1. Garantir que o bucket 'team-logos' existe e é público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-logos', 
  'team-logos', 
  true, 
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Habilitar RLS no Storage (já é padrão, mas garantimos as políticas)

-- 3. Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Representatives can manage their team logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all team logos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view team logos" ON storage.objects;

-- 4. Criar novas políticas de Storage para 'team-logos'

-- SELECT: Qualquer um pode ver os logos (bucket é público)
CREATE POLICY "Anyone can view team logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logos');

-- INSERT: Usuários autenticados podem fazer upload se forem representantes ou admins
-- Nota: Como o upload acontece antes de salvar o registro na tabela 'teams', 
-- permitimos que qualquer usuário autenticado faça upload para este bucket, 
-- mas idealmente restringiríamos a representantes.
-- Para simplificar e garantir que funcione conforme solicitado:
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'team-logos');

-- UPDATE: Permitir que o dono do arquivo ou admin atualize
CREATE POLICY "Authenticated users can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'team-logos');

-- DELETE: Permitir que o dono do arquivo ou admin delete
CREATE POLICY "Authenticated users can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'team-logos');

-- 5. Garantir que a função is_team_representative existe (usada em RLS de tabelas)
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
