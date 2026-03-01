-- MIGRATION: AJUSTE PERFIL ATLETA
-- Execute no SQL Editor do Supabase

-- 1. Ajustar Tabela de Atletas
-- Primeiro, vamos renomear a tabela antiga ou ajustar as colunas se necessário.
-- Para garantir que seguimos a risca o solicitado, vamos recriar ou alterar.

DO $$ 
BEGIN
    -- Se a tabela já existir, vamos ajustar as colunas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'atletas') THEN
        -- Renomear colunas existentes para o novo padrão se necessário
        -- Ou simplesmente adicionar as novas e remover as antigas
        ALTER TABLE atletas RENAME COLUMN usuario_id TO id;
        ALTER TABLE atletas ADD COLUMN IF NOT EXISTS nome_completo TEXT;
        ALTER TABLE atletas ADD COLUMN IF NOT EXISTS genero TEXT CHECK (genero IN ('Masculino', 'Feminino'));
        ALTER TABLE atletas ADD COLUMN IF NOT EXISTS graduacao TEXT;
        ALTER TABLE atletas ADD COLUMN IF NOT EXISTS equipe TEXT;
        ALTER TABLE atletas ADD COLUMN IF NOT EXISTS perfil_completo BOOLEAN DEFAULT false;
        ALTER TABLE atletas RENAME COLUMN updated_at TO atualizado_em;
        
        -- Ajustar tipos se necessário
        ALTER TABLE atletas ALTER COLUMN peso TYPE NUMERIC;
    ELSE
        -- Criar do zero se não existir
        CREATE TABLE atletas (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            nome_completo TEXT NOT NULL,
            genero TEXT CHECK (genero IN ('Masculino', 'Feminino')) NOT NULL,
            graduacao TEXT NOT NULL,
            data_nascimento DATE NOT NULL,
            peso NUMERIC NOT NULL,
            equipe TEXT NOT NULL,
            perfil_completo BOOLEAN DEFAULT false,
            atualizado_em TIMESTAMP DEFAULT now()
        );
    END IF;
END $$;

-- 2. Habilitar RLS
ALTER TABLE atletas ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
DROP POLICY IF EXISTS "Atletas podem inserir seu próprio perfil" ON atletas;
CREATE POLICY "Atletas podem inserir seu próprio perfil" ON atletas
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Atletas podem ver seu próprio perfil" ON atletas;
CREATE POLICY "Atletas podem ver seu próprio perfil" ON atletas
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Atletas podem atualizar seu próprio perfil" ON atletas;
CREATE POLICY "Atletas podem atualizar seu próprio perfil" ON atletas
    FOR UPDATE USING (auth.uid() = id);

-- 4. Trigger para bloquear edição de campos sensíveis
CREATE OR REPLACE FUNCTION block_athlete_sensitive_fields_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o perfil já estiver completo, bloqueamos a alteração de nome e nascimento
    IF OLD.perfil_completo = true THEN
        IF NEW.nome_completo <> OLD.nome_completo THEN
            RAISE EXCEPTION 'Não é permitido alterar o Nome Completo após a conclusão do perfil. Entre em contato com o suporte.';
        END IF;
        IF NEW.data_nascimento <> OLD.data_nascimento THEN
            RAISE EXCEPTION 'Não é permitido alterar a Data de Nascimento após a conclusão do perfil. Entre em contato com o suporte.';
        END IF;
    END IF;
    
    -- Sempre atualizar o timestamp
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_block_athlete_sensitive_fields ON atletas;
CREATE TRIGGER tr_block_athlete_sensitive_fields
    BEFORE UPDATE ON atletas
    FOR EACH ROW
    EXECUTE FUNCTION block_athlete_sensitive_fields_update();
