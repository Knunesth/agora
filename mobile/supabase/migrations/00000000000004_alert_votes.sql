-- ==============================================================================
-- ÁGORA - SPRINT 6
-- Migração para Tabela de Votos e Regra de Consenso
-- ==============================================================================

-- 1. Criação da Tabela Relacional de Votos (Se não existir)
CREATE TABLE IF NOT EXISTS alert_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  vote_type text CHECK (vote_type IN ('confirm', 'reject')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(alert_id, user_id)
);

-- 2. Ativar Row Level Security
ALTER TABLE alert_votes ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas se existirem
DROP POLICY IF EXISTS "votes_select" ON alert_votes;
DROP POLICY IF EXISTS "no_self_vote" ON alert_votes;

-- 3. Leitura pública dos votos (todos podem ver quem votou, ou pelo menos contar os votos)
CREATE POLICY "votes_select" ON alert_votes
  FOR SELECT TO authenticated USING (true);

-- 4. Inserção rigorosa: Impede votar em si mesmo (Auto-Voto) e garante a própria identidade
CREATE POLICY "no_self_vote" ON alert_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    alert_id NOT IN (
      SELECT id FROM alerts WHERE user_id = auth.uid()
    )
  );

-- 5. Trigger PL/pgSQL: Sempre que houver um voto válido, incrementa o painel do alerta
CREATE OR REPLACE FUNCTION increment_alert_confirmations()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'confirm' THEN
    UPDATE alerts 
    SET confirmations = confirmations + 1
    WHERE id = NEW.alert_id;
  END IF;
  
  -- Para rejeições no futuro (downvotes pesados) podemos decrementar ou mudar o status para 'rejected'
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_vote
  AFTER INSERT ON alert_votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_alert_confirmations();
