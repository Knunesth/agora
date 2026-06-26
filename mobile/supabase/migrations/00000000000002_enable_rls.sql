-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP POLICY IF EXISTS "alerts_insert" ON alerts;
-- DROP POLICY IF EXISTS "alerts_select" ON alerts;
-- ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- Migration: 00000000000002_enable_rls.sql
-- Descrição: Habilita RLS na tabela alerts e cria políticas de leitura pública e inserção restrita
-- Depende de: 00000000000000_init_agora.sql

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler todos os alertas (mapa público)
CREATE POLICY "alerts_select" ON alerts
  FOR SELECT TO authenticated USING (true);

-- Inserção apenas com user_id igual ao da sessão autenticada
CREATE POLICY "alerts_insert" ON alerts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- NOTA: a Edge Function sos-alert usa SUPABASE_SERVICE_ROLE_KEY (bypass_rls),
-- por isso não é afetada por estas políticas.
