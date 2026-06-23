-- Permitir que os usuários apaguem seus próprios alertas
CREATE POLICY "alerts_delete" ON alerts
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
