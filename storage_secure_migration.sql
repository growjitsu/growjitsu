-- ARENA COMP - SECURE STORAGE MIGRATION
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Criar o bucket privado 'atletas-perfil'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'atletas-perfil', 
  'atletas-perfil', 
  false, 
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Habilitar RLS no Storage (se necessário)
-- O Supabase Storage já usa RLS por padrão.

-- 3. Remover políticas antigas se existirem para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem fazer upload para sua própria pasta" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios arquivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios arquivos" ON storage.objects;

-- 4. Criar Políticas de Segurança Rigorosas

-- INSERT: Permitir apenas se o primeiro nível da pasta for o ID do usuário autenticado
CREATE POLICY "Usuários podem fazer upload para sua própria pasta"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'atletas-perfil' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: Permitir apenas se o primeiro nível da pasta for o ID do usuário autenticado
CREATE POLICY "Usuários podem ver seus próprios arquivos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'atletas-perfil' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE: Permitir apenas se o primeiro nível da pasta for o ID do usuário autenticado
CREATE POLICY "Usuários podem atualizar seus próprios arquivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'atletas-perfil' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: Permitir apenas se o primeiro nível da pasta for o ID do usuário autenticado
CREATE POLICY "Usuários podem deletar seus próprios arquivos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'atletas-perfil' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Atualizar Tabela de Atletas
-- Garantir que a coluna foto_url existe na tabela atletas
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='foto_url') THEN
        ALTER TABLE atletas ADD COLUMN foto_url TEXT;
    END IF;
END $$;
