-- ROLLBACK (executar manualmente se precisar desfazer):
-- Não é possível remover valores de um enum em PostgreSQL sem recriar o tipo.
-- Para desfazer: recriar risk_category sem 'sos' e migrar dados manualmente.

-- Migration: 00000000000001_add_sos_category.sql
-- Descrição: Adiciona o valor 'sos' ao enum risk_category para suportar alertas de emergência
-- Depende de: 00000000000000_init_agora.sql

-- ADD VALUE IF NOT EXISTS é seguro e não exige downtime em PostgreSQL
ALTER TYPE risk_category ADD VALUE IF NOT EXISTS 'sos';
