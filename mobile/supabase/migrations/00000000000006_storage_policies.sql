-- Leitura pública (qualquer autenticado pode ver fotos)
CREATE POLICY "storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'alert-photos');

-- Upload só com user_id próprio no path
CREATE POLICY "storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'alert-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Delete só do próprio arquivo
CREATE POLICY "storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'alert-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Agendamento de cron para expirar alertas pendentes
SELECT cron.schedule(
  'expire-pending-alerts',
  '* * * * *',
  $$UPDATE alerts SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW()$$
);
