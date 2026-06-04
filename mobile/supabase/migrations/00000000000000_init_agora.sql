-- ==============================================================================
-- ÁGORA - INICIALIZAÇÃO DO BANCO DE DADOS SUPABASE
-- Execute este script inteiro no SQL Editor do seu projeto Supabase
-- ==============================================================================

-- 1. Habilitar a Extensão Espacial (MANDATÓRIO PARA O MAPA)
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
-- Extensão para o cron (para rodar a rotina de quarentena)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- 2. Criar os Enums do Domínio
CREATE TYPE risk_category AS ENUM ('furto', 'iluminacao', 'infraestrutura', 'assedio', 'suspeito', 'outro');
CREATE TYPE alert_status AS ENUM ('pending', 'verified', 'expired', 'rejected');

-- 3. Tabela Principal de Alertas
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category risk_category NOT NULL,
  description text NOT NULL,
  status alert_status NOT NULL DEFAULT 'pending',
  
  -- Espacial: geography (POINT, SRID 4326) para suportar raio em metros nativamente
  location geography(POINT, 4326) NOT NULL, 
  
  confirmations integer NOT NULL DEFAULT 0,
  photo_url text, -- Opcional inicialmente (RF-03)
  
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Valor automático de 15 minutos no futuro a partir da inserção
  expires_at timestamptz NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  
  -- user_id references auth.users (descomentar quando habilitar auth)
  user_id uuid NOT NULL 
);

-- 4. Index Espacial (Crucial para a performance no mapa - RF-01)
CREATE INDEX alerts_location_idx ON alerts USING GIST (location);
-- Index temporal para otimizar o job de quarentena
CREATE INDEX alerts_expires_at_idx ON alerts (expires_at);

-- ==============================================================================
-- REGRAS DE NEGÓCIO DIRETAS NO BANCO
-- ==============================================================================

-- 5. RN-02: Consenso Dinâmico (Trigger)
-- Ao chegar em 3 confirmações, o status muda automaticamente para 'verified'
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


-- 6. RN-01: Quarentena de 15min (Cron Job rodando a cada 1 minuto)
-- Expira alertas 'pending' que já passaram da validade (expires_at)
SELECT cron.schedule(
  'quarantine-expiration-job',
  '* * * * *', -- a cada minuto
  $$
  UPDATE alerts 
  SET status = 'expired' 
  WHERE status = 'pending' AND expires_at < now();
  $$
);

-- ==============================================================================
-- RPC (Remote Procedure Call) PARA O FRONTEND
-- ==============================================================================

-- O Supabase-js padrão não serializa geography facilmente no select normal.
-- Criamos uma função de busca espacial customizada que já extrai a lat/lng:
CREATE OR REPLACE FUNCTION get_alerts_within_radius(
  usr_lat double precision,
  usr_lng double precision,
  radius_meters double precision
)
RETURNS TABLE (
  id uuid,
  category risk_category,
  description text,
  status alert_status,
  latitude double precision,
  longitude double precision,
  confirmations integer,
  photo_url text,
  created_at timestamptz,
  expires_at timestamptz,
  user_id uuid
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
  -- Apenas retornar alertas num raio X metros da coordenada do usuário (PostGIS)
  WHERE ST_DWithin(
    a.location, 
    ST_SetSRID(ST_MakePoint(usr_lng, usr_lat), 4326)::geography, 
    radius_meters
  )
  -- Ignorar alertas que caíram por falta de votos e tempo (quarentena reprovada)
  AND a.status != 'expired';
END;
$$ LANGUAGE plpgsql;
