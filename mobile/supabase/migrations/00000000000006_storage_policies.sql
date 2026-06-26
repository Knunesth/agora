-- ROLLBACK (executar manualmente se precisar desfazer):
-- SELECT cron.unschedule('expire-pending-alerts');
-- DROP POLICY IF EXISTS "storage_delete" ON storage.objects;
-- DROP POLICY IF EXISTS "storage_insert" ON storage.objects;
-- DROP POLICY IF EXISTS "storage_select" ON storage.objects;

-- Migration: 00000000000006_storage_policies.sql
-- Descrição: Cria políticas RLS no bucket alert-photos e registra cron de expiração de alertas pendentes
-- Depende de: 00000000000002_enable_rls.sql

-- Qualquer usuário autenticado pode visualizar fotos de alertas (mapa público)
CREATE POLICY "storage_select" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'alert-photos');

-- Upload restrito: o primeiro segmento do path deve ser o uid do próprio usuário
CREATE POLICY "storage_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'alert-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Deleção restrita ao dono do arquivo (mesmo critério do insert)
CREATE POLICY "storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'alert-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Job redundante de segurança: garante expiração mesmo se o job da migration 00 falhar
SELECT cron.schedule(
  'expire-pending-alerts',
  '* * * * *',
  $$UPDATE alerts SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW()$$
);
