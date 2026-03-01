-- ==============================================================================
-- SCRIPT DE MIGRAÇÃO OBRIGATÓRIO - PERFIL DE ATLETA
-- ==============================================================================
-- INSTRUÇÕES:
-- 1. Copie TODO este código.
-- 2. Vá para o seu painel Supabase -> SQL Editor.
-- 3. Cole o código e clique em "Run".
-- 4. Isso resolverá o erro "Could not find column in schema cache".
-- ==============================================================================

DO $$ 
BEGIN 
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='nome_completo') THEN
        ALTER TABLE atletas ADD COLUMN nome_completo TEXT;
    END IF;

    -- Relaxar restrições de colunas antigas se existirem
    DO $$ 
    BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='faixa') THEN
            ALTER TABLE atletas ALTER COLUMN faixa DROP NOT NULL;
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='peso') THEN
            ALTER TABLE atletas ALTER COLUMN peso DROP NOT NULL;
        END IF;
    END $$;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='data_nascimento') THEN
        ALTER TABLE atletas ADD COLUMN data_nascimento DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='genero') THEN
        ALTER TABLE atletas ADD COLUMN genero TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='graduacao') THEN
        ALTER TABLE atletas ADD COLUMN graduacao TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='peso_kg') THEN
        ALTER TABLE atletas ADD COLUMN peso_kg NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='equipe') THEN
        ALTER TABLE atletas ADD COLUMN equipe TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='perfil_completo') THEN
        ALTER TABLE atletas ADD COLUMN perfil_completo BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='atletas' AND column_name='atualizado_em') THEN
        ALTER TABLE atletas ADD COLUMN atualizado_em TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Garantir que o RLS permita inserção/atualização
ALTER TABLE atletas ENABLE ROW LEVEL SECURITY;

-- Política para atletas verem seu próprio perfil
DROP POLICY IF EXISTS "Atletas podem ver seu próprio perfil" ON atletas;
CREATE POLICY "Atletas podem ver seu próprio perfil" ON atletas
    FOR SELECT USING (auth.uid() = usuario_id);

-- Política para atletas inserirem seu próprio perfil
DROP POLICY IF EXISTS "Atletas podem inserir seu próprio perfil" ON atletas;
CREATE POLICY "Atletas podem inserir seu próprio perfil" ON atletas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política para atletas atualizarem seu próprio perfil
DROP POLICY IF EXISTS "Atletas podem atualizar seu próprio perfil" ON atletas;
CREATE POLICY "Atletas podem atualizar seu próprio perfil" ON atletas
    FOR UPDATE USING (auth.uid() = usuario_id);

-- Função de Trigger para proteção de dados sensíveis
CREATE OR REPLACE FUNCTION block_athlete_sensitive_fields_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Bloqueia alteração de Nome e Nascimento se o perfil já estiver completo
    IF OLD.perfil_completo = true THEN
        IF NEW.nome_completo <> OLD.nome_completo OR NEW.data_nascimento <> OLD.data_nascimento THEN
            RAISE EXCEPTION 'Alteração de Nome ou Nascimento não permitida após conclusão do perfil.';
        END IF;
    END IF;
    
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar Trigger
DROP TRIGGER IF EXISTS tr_block_athlete_sensitive_fields ON atletas;
CREATE TRIGGER tr_block_athlete_sensitive_fields
    BEFORE UPDATE ON atletas
    FOR EACH ROW
    EXECUTE FUNCTION block_athlete_sensitive_fields_update();

-- FORÇAR RECARREGAMENTO DO SCHEMA CACHE (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';
