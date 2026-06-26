-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP POLICY IF EXISTS "alert_votes_cascade_delete" ON alert_votes;
-- DROP POLICY IF EXISTS "alerts_delete" ON alerts;

-- Migration: 00000000000011_alerts_delete_policy.sql
-- Descrição: Adiciona política RLS para deleção de alertas pelo próprio criador e deleção em cascata dos votos
-- Depende de: 00000000000002_enable_rls.sql, 00000000000004_alert_votes.sql

CREATE POLICY "alerts_delete" ON alerts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Permite deletar votos vinculados a alertas do próprio usuário (necessário para ON DELETE CASCADE funcionar via RLS)
DROP POLICY IF EXISTS "alert_votes_cascade_delete" ON alert_votes;
CREATE POLICY "alert_votes_cascade_delete" ON alert_votes
  FOR DELETE TO authenticated
  USING (alert_id IN (SELECT id FROM alerts WHERE user_id = auth.uid()));
