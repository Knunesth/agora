-- ROLLBACK (executar manualmente se precisar desfazer):
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS work_location;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS work_address;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS home_location;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS home_address;

-- Migration: 00000000000006_address_fields.sql
-- Descrição: Adiciona campos de endereço e localização de casa e trabalho ao perfil do usuário
-- Depende de: 00000000000003_trust_network.sql

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS home_address  text,
  ADD COLUMN IF NOT EXISTS home_location geography(POINT, 4326),
  ADD COLUMN IF NOT EXISTS work_address  text,
  ADD COLUMN IF NOT EXISTS work_location geography(POINT, 4326);
