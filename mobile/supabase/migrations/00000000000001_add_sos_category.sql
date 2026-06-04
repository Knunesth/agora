-- ==============================================================================
-- ÁGORA - SPRINT 4
-- Migração para adicionar categoria de Emergência no Enum
-- ==============================================================================

-- Em PostgreSQL, alterar ENUMs adicionando novos valores é seguro e não exige downtime.
ALTER TYPE risk_category ADD VALUE IF NOT EXISTS 'sos';
