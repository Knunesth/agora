-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP TRIGGER IF EXISTS trg_increment_vote ON alert_votes;
-- DROP FUNCTION IF EXISTS increment_alert_confirmations CASCADE;
-- DROP POLICY IF EXISTS "no_self_vote" ON alert_votes;
-- DROP POLICY IF EXISTS "votes_select" ON alert_votes;
-- DROP TABLE IF EXISTS alert_votes CASCADE;

-- Migration: 00000000000004_alert_votes.sql
-- Descrição: Cria tabela de votos, políticas RLS e trigger que incrementa confirmações no alerta
-- Depende de: 00000000000002_enable_rls.sql

CREATE TABLE IF NOT EXISTS alert_votes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id   uuid REFERENCES alerts(id) ON DELETE CASCADE,
  user_id    uuid REFERENCES auth.users(id),
  vote_type  text CHECK (vote_type IN ('confirm', 'reject')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(alert_id, user_id)
);

ALTER TABLE alert_votes ENABLE ROW LEVEL SECURITY;

-- Limpeza defensiva antes de (re)criar — evita erro se a migration rodar mais de uma vez em dev
DROP POLICY IF EXISTS "votes_select" ON alert_votes;
DROP POLICY IF EXISTS "no_self_vote" ON alert_votes;

CREATE POLICY "votes_select" ON alert_votes
  FOR SELECT TO authenticated USING (true);

-- Impede auto-voto: usuário não pode votar em alertas que ele mesmo criou
CREATE POLICY "no_self_vote" ON alert_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    alert_id NOT IN (
      SELECT id FROM alerts WHERE user_id = auth.uid()
    )
  );

-- Ao inserir um voto 'confirm', incrementa o contador do alerta (dispara trg_check_consensus via migration 00)
-- Lógica de rejeição (downvote que muda status) implementada em 00000000000010_update_resolution_logic.sql
CREATE OR REPLACE FUNCTION increment_alert_confirmations()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vote_type = 'confirm' THEN
    UPDATE alerts
    SET confirmations = confirmations + 1
    WHERE id = NEW.alert_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_increment_vote
  AFTER INSERT ON alert_votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_alert_confirmations();
