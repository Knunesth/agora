-- ==============================================================================
-- ÁGORA - SPRINT 11
-- Habilita Supabase Realtime na tabela `alerts`
--
-- Necessário para o canal supabase.channel('alerts-realtime') funcionar.
-- Sem isso, o hook useAlerts não recebe eventos de INSERT/UPDATE/DELETE.
--
-- Execute manualmente ou aplique via: npx supabase db push
-- ==============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
