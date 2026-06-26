-- ROLLBACK (executar manualmente se precisar desfazer):
-- SELECT cron.unschedule('quarantine-expiration-job');
-- DROP FUNCTION IF EXISTS get_alerts_within_radius CASCADE;
-- DROP FUNCTION IF EXISTS check_consensus_rule CASCADE;
-- DROP TABLE IF EXISTS alerts CASCADE;
-- DROP TYPE IF EXISTS alert_status CASCADE;
-- DROP TYPE IF EXISTS risk_category CASCADE;
-- DROP EXTENSION IF EXISTS pg_cron CASCADE;
-- DROP EXTENSION IF EXISTS postgis CASCADE;

-- Migration: 00000000000000_init_agora.sql
-- Descrição: Cria extensões, enums, tabela de alertas, índices, trigger de consenso, cron de quarentena e RPC de busca espacial
-- Depende de: nenhuma

-- Extensão espacial: obrigatória para o tipo geography e funções ST_*
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
-- Extensão de cron: necessária para o job de quarentena (RN-01)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

CREATE TYPE risk_category AS ENUM ('furto', 'iluminacao', 'infraestrutura', 'assedio', 'suspeito', 'outro');
CREATE TYPE alert_status AS ENUM ('pending', 'verified', 'expired', 'rejected');

CREATE TABLE alerts (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  category      risk_category NOT NULL,
  description   text          NOT NULL,
  status        alert_status  NOT NULL DEFAULT 'pending',
  -- geography(POINT, 4326) suporta cálculo de raio em metros nativamente via ST_DWithin
  location      geography(POINT, 4326) NOT NULL,
  confirmations integer       NOT NULL DEFAULT 0,
  photo_url     text,
  created_at    timestamptz   NOT NULL DEFAULT now(),
  -- RN-01: alerta entra em quarentena de 15 minutos antes de ser validado
  expires_at    timestamptz   NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  user_id       uuid          NOT NULL
);

-- Índice espacial: essencial para performance do ST_DWithin no mapa (RF-01)
CREATE INDEX alerts_location_idx ON alerts USING GIST (location);
-- Índice temporal: otimiza o filtro WHERE expires_at < now() no job de quarentena
CREATE INDEX alerts_expires_at_idx ON alerts (expires_at);

-- RN-02: ao atingir 3 confirmações independentes, o alerta passa de pending para verified automaticamente
CREATE OR REPLACE FUNCTION check_consensus_rule()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmations >= 3 AND OLD.status = 'pending' THEN
    NEW.status := 'verified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_consensus
  BEFORE UPDATE OF confirmations ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION check_consensus_rule();

-- RN-01: job roda a cada minuto e expira alertas pending que ultrapassaram o TTL de 15 minutos
SELECT cron.schedule(
  'quarantine-expiration-job',
  '* * * * *',
  $$
  UPDATE alerts
  SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now();
  $$
);

-- RPC necessária porque o supabase-js não desserializa geography automaticamente.
-- A função extrai lat/lng via ST_Y/ST_X e filtra pelo raio do usuário.
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
  user_id       uuid
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
    a.user_id
  FROM alerts a
  WHERE ST_DWithin(
    a.location,
    ST_SetSRID(ST_MakePoint(usr_lng, usr_lat), 4326)::geography,
    radius_meters
  )
  AND a.status != 'expired';
END;
$$ LANGUAGE plpgsql;
