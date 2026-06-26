-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP TRIGGER IF EXISTS trg_evaluate_trust_score ON alerts;
-- DROP FUNCTION IF EXISTS evaluate_alert_resolution CASCADE;
-- DROP FUNCTION IF EXISTS get_alert_coords CASCADE;
-- DROP FUNCTION IF EXISTS get_nearby_guardians CASCADE;  -- versão atualizada com trust_score
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS xp;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS trust_score;

-- Migration: 00000000000005_gamification.sql
-- Descrição: Adiciona trust_score e xp ao perfil, trigger de gamificação por resolução de alerta e atualiza critérios do guardião
-- Depende de: 00000000000003_trust_network.sql, 00000000000004_alert_votes.sql

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;

-- RN-03/04: ajusta trust_score e xp do criador e dos votantes quando um alerta é resolvido.
-- Penalidade assimétrica: -7 para fake news vs +5 para alerta verdadeiro (desincentiva trotes).
CREATE OR REPLACE FUNCTION evaluate_alert_resolution()
RETURNS TRIGGER AS $$
DECLARE
  voter_record RECORD;
BEGIN
  IF NEW.status = 'verified' AND OLD.status = 'pending' THEN
    -- +5 pontos para o criador do alerta validado (teto: 100)
    UPDATE user_profiles
    SET trust_score = LEAST(trust_score + 5, 100)
    WHERE id = NEW.user_id;

    -- +2 pontos para cada usuário que confirmou antes da validação
    FOR voter_record IN SELECT user_id FROM alert_votes WHERE alert_id = NEW.id AND vote_type = 'confirm'
    LOOP
      UPDATE user_profiles
      SET trust_score = LEAST(trust_score + 2, 100)
      WHERE id = voter_record.user_id;
    END LOOP;

  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- -7 pontos para o criador de fake news (piso: 0)
    UPDATE user_profiles
    SET trust_score = GREATEST(trust_score - 7, 0)
    WHERE id = NEW.user_id;

    -- -3 pontos para quem confirmou um alerta falso (cúmplice)
    FOR voter_record IN SELECT user_id FROM alert_votes WHERE alert_id = NEW.id AND vote_type = 'confirm'
    LOOP
      UPDATE user_profiles
      SET trust_score = GREATEST(trust_score - 3, 0)
      WHERE id = voter_record.user_id;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_evaluate_trust_score ON alerts;
CREATE TRIGGER trg_evaluate_trust_score
  AFTER UPDATE OF status ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_alert_resolution();

-- Atualiza critério de guardião: agora exige trust_score >= 80 além de CPF + 2FA
CREATE OR REPLACE FUNCTION get_nearby_guardians(
  sos_lon         double precision,
  sos_lat         double precision,
  radius_meters   double precision,
  exclude_user_id uuid
)
RETURNS TABLE (guardian_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT id
  FROM user_profiles
  WHERE verified_cpf = true
    AND two_factor_enabled = true
    AND trust_score >= 80
    AND id != exclude_user_id
    AND last_location_updated_at > (now() - interval '30 minutes')
    AND ST_DWithin(
      last_location,
      ST_SetSRID(ST_MakePoint(sos_lon, sos_lat), 4326)::geography,
      radius_meters
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auxiliar para a Edge Function sos-alert: extrai lat/lng de um alerta sem deserializar WKB no lado JS
CREATE OR REPLACE FUNCTION get_alert_coords(a_id uuid)
RETURNS TABLE (latitude double precision, longitude double precision) AS $$
BEGIN
  RETURN QUERY
  SELECT ST_Y(location::geometry), ST_X(location::geometry)
  FROM alerts
  WHERE id = a_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
