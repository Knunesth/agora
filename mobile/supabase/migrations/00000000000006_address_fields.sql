-- ==============================================================================
-- ÁGORA - SPRINT 4
-- Migração para adicionar campos de endereço e localização de Casa e Trabalho
-- ==============================================================================

ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS home_address text,
  ADD COLUMN IF NOT EXISTS home_location geography(POINT, 4326),
  ADD COLUMN IF NOT EXISTS work_address text,
  ADD COLUMN IF NOT EXISTS work_location geography(POINT, 4326);
