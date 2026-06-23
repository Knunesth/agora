-- Permitir que os usuários apaguem seus próprios alertas
CREATE POLICY "alerts_delete" ON alerts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Permite deletar os votos em cascata caso o usuario seja dono do alerta
DROP POLICY IF EXISTS "alert_votes_cascade_delete" ON alert_votes;
CREATE POLICY "alert_votes_cascade_delete" ON alert_votes
  FOR DELETE TO authenticated
  USING ( alert_id IN (SELECT id FROM alerts WHERE user_id = auth.uid()) );
