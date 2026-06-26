-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP FUNCTION IF EXISTS get_alerts_within_radius(double precision, double precision, double precision) CASCADE;
-- (a versão anterior sem user_name foi removida pelo DROP no início desta migration)

-- Migration: 00000000000009_alert_user_name.sql
-- Descrição: Recria get_alerts_within_radius adicionando user_name ao retorno via JOIN com user_profiles
-- Depende de: 00000000000000_init_agora.sql, 00000000000007_settings_fields.sql

-- DROP obrigatório porque a assinatura de retorno mudou (adição de user_name).
-- Em PostgreSQL, CREATE OR REPLACE não aceita mudança na lista de colunas retornadas.
DROP FUNCTION IF EXISTS get_alerts_within_radius(double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION get_alerts_within_radius(
  usr_lat       double precision,
  usr_lng       double precision,
  radius_meters double precision
)
RETURNS TABLE (
  id            uuid,
  category      risk_category,
  description   text,
  status        alert_status,
  latitude      double precision,
  longitude     double precision,
  confirmations integer,
  photo_url     text,
  created_at    timestamptz,
  expires_at    timestamptz,
  user_id       uuid,
  user_name     text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.category,
    a.description,
    a.status,
    ST_Y(a.location::geometry) AS latitude,
    ST_X(a.location::geometry) AS longitude,
    a.confirmations,
    a.photo_url,
    a.created_at,
    a.expires_at,
    a.user_id,
    p.display_name AS user_name
  FROM alerts a
  LEFT JOIN user_profiles p ON p.id = a.user_id
  WHERE ST_DWithin(
    a.location,
    ST_SetSRID(ST_MakePoint(usr_lng, usr_lat), 4326)::geography,
    radius_meters
  )
  AND a.status != 'expired';
END;
$$ LANGUAGE plpgsql;
