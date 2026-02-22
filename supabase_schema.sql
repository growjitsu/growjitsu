-- ARENA COMP - SUPABASE DATABASE SCHEMA
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Tabela de Usuários (Perfis)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tipo_usuario TEXT CHECK (tipo_usuario IN ('coordinator', 'athlete')) NOT NULL,
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Atletas
CREATE TABLE IF NOT EXISTS atletas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
  genero TEXT CHECK (genero IN ('Masculino', 'Feminino')) NOT NULL,
  data_nascimento DATE NOT NULL,
  faixa TEXT NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  categoria_idade TEXT,
  categoria_peso TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE atletas ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para 'usuarios'
-- Qualquer um pode ver perfis (necessário para buscas/rankings)
CREATE POLICY "Perfis são visíveis por todos" ON usuarios
  FOR SELECT USING (true);

-- Apenas o próprio usuário pode inserir seu perfil
CREATE POLICY "Usuários podem criar seu próprio perfil" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Apenas o próprio usuário pode atualizar seu perfil
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- 5. Políticas para 'atletas'
-- Atletas são visíveis por todos
CREATE POLICY "Atletas são visíveis por todos" ON atletas
  FOR SELECT USING (true);

-- Apenas o próprio usuário pode criar seu registro de atleta
CREATE POLICY "Usuários podem criar seu próprio registro de atleta" ON atletas
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Apenas o próprio usuário pode atualizar seu registro de atleta
CREATE POLICY "Usuários podem atualizar seu próprio registro de atleta" ON atletas
  FOR UPDATE USING (auth.uid() = usuario_id);

-- 6. Automação: Trigger para criar perfil automaticamente (Opcional mas Recomendado)
-- Isso garante que mesmo que o insert no frontend falhe, o banco cria o perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'athlete')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para disparar a função acima
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
