-- ROLLBACK (executar manualmente se precisar desfazer):
-- ALTER PUBLICATION supabase_realtime DROP TABLE alerts;

-- Migration: 00000000000012_enable_alerts_realtime.sql
-- Descrição: Adiciona a tabela alerts à publicação supabase_realtime para habilitar eventos INSERT/UPDATE/DELETE no canal Realtime
-- Depende de: 00000000000000_init_agora.sql

-- Sem esta linha, supabase.channel('alerts-realtime') não recebe nenhum evento.
-- Equivale a marcar a tabela no painel: Database → Replication → Tables → alerts ✓
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
