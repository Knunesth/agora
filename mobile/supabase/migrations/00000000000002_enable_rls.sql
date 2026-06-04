-- ==============================================================================
-- ÁGORA - SPRINT 5
-- Migração para habilitar Row Level Security (RLS) e Políticas de Acesso
-- ==============================================================================

-- 1. Forçar o bloqueio da tabela (Nenhum select ou insert passa se não tiver uma policy permitindo)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 2. Leitura pública para quem estiver logado (Qualquer um vê alertas)
CREATE POLICY "alerts_select" ON alerts
  FOR SELECT TO authenticated USING (true);

-- 3. Inserção rigorosa (Você só pode inserir dados se o user_id for o da sua própria sessão no supabase_auth)
CREATE POLICY "alerts_insert" ON alerts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- NOTA: A nossa Edge Function do SOS (Sprint 4) continuará funcionando normalmente
-- pois usa a SUPABASE_SERVICE_ROLE_KEY, que tem a super-permissão de bypass_rls.
