-- NEW TABLES FOR CHAMPIONSHIP MANAGEMENT

-- 1. Eventos (Campeonatos Oficiais)
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coordenador_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  local TEXT,
  status TEXT CHECK (status IN ('rascunho', 'aberto', 'fechado', 'em_andamento', 'finalizado')) DEFAULT 'rascunho',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Inscrições (Relacionando Atletas a Eventos)
-- Nota: Já existe uma tabela 'inscricoes', mas vamos garantir que ela suporte o novo fluxo operacional
ALTER TABLE inscricoes ADD COLUMN IF NOT EXISTS evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE;
ALTER TABLE inscricoes ADD COLUMN IF NOT EXISTS peso_confirmado BOOLEAN DEFAULT FALSE;
ALTER TABLE inscricoes ADD COLUMN IF NOT EXISTS status_operacional TEXT CHECK (status_operacional IN ('inscrito', 'peso_ok', 'aquecimento', 'pronto', 'lutando', 'finalizado')) DEFAULT 'inscrito';

-- 3. Lutas (Matches)
CREATE TABLE IF NOT EXISTS lutas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  atleta_a_id UUID REFERENCES usuarios(id),
  atleta_b_id UUID REFERENCES usuarios(id),
  status TEXT CHECK (status IN ('agendada', 'em_andamento', 'finalizada')) DEFAULT 'agendada',
  tempo_luta INTEGER DEFAULT 300, -- em segundos
  ordem INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resultados
CREATE TABLE IF NOT EXISTS resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  luta_id UUID REFERENCES lutas(id) ON DELETE CASCADE,
  vencedor_id UUID REFERENCES usuarios(id),
  motivo TEXT CHECK (motivo IN ('finalizacao', 'pontos', 'decisao', 'desclassificacao', 'outros')),
  descricao_outro TEXT,
  pontos_a JSONB DEFAULT '{"points": 0, "advantages": 0, "penalties": 0}'::jsonb,
  pontos_b JSONB DEFAULT '{"points": 0, "advantages": 0, "penalties": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;

-- Eventos são visíveis por todos
CREATE POLICY "Eventos visíveis por todos" ON eventos FOR SELECT USING (true);
CREATE POLICY "Coordenadores gerenciam seus eventos" ON eventos FOR ALL USING (auth.uid() = coordenador_id);

-- Lutas e Resultados
CREATE POLICY "Lutas visíveis por todos" ON lutas FOR SELECT USING (true);
CREATE POLICY "Coordenadores gerenciam lutas" ON lutas FOR ALL USING (
  EXISTS (SELECT 1 FROM eventos WHERE eventos.id = lutas.evento_id AND eventos.coordenador_id = auth.uid())
);

CREATE POLICY "Resultados visíveis por todos" ON resultados FOR SELECT USING (true);
CREATE POLICY "Coordenadores gerenciam resultados" ON resultados FOR ALL USING (
  EXISTS (
    SELECT 1 FROM lutas 
    JOIN eventos ON eventos.id = lutas.evento_id 
    WHERE lutas.id = resultados.luta_id AND eventos.coordenador_id = auth.uid()
  )
);
