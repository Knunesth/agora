-- ==============================================================================
-- ÁGORA - SPRINT 7
-- Migração para Gamificação Invisível e Ajuste do Guardião
-- ==============================================================================

-- 1. Adição dos Campos e Constraints no Perfil
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;

-- 2. Trigger de Gamificação: Trust Score e XP
CREATE OR REPLACE FUNCTION evaluate_alert_resolution()
RETURNS TRIGGER AS $$
DECLARE
  voter_record RECORD;
BEGIN
  -- Se o alerta acabou de ser validado pela comunidade
  IF NEW.status = 'verified' AND OLD.status = 'pending' THEN
    
    -- +5 Pontos pro Dono do Alerta (Até o limite de 100)
    UPDATE user_profiles 
    SET trust_score = LEAST(trust_score + 5, 100) 
    WHERE id = NEW.user_id;

    -- Recompensa para quem confiou nesse alerta antes de virar verdade
    FOR voter_record IN SELECT user_id FROM alert_votes WHERE alert_id = NEW.id AND vote_type = 'confirm'
    LOOP
      UPDATE user_profiles 
      SET trust_score = LEAST(trust_score + 2, 100) 
      WHERE id = voter_record.user_id;
    END LOOP;
  
  -- Se o alerta foi rejeitado pela comunidade (ex: Downvotes pesados que adicionaremos no futuro)
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    
    -- -7 Pontos de penalidade pro Dono (Punição severa pra mitigar trolls, mínimo 0)
    UPDATE user_profiles 
    SET trust_score = GREATEST(trust_score - 7, 0) 
    WHERE id = NEW.user_id;

    -- -3 Pontos de penalidade para quem foi "cúmplice" e confirmou a Fake News
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

-- Atrelar o Trigger de avaliação à tabela de Alertas
DROP TRIGGER IF EXISTS trg_evaluate_trust_score ON alerts;
CREATE TRIGGER trg_evaluate_trust_score
  AFTER UPDATE OF status ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION evaluate_alert_resolution();


-- 3. Atualizar a Regra de Qualificação do Guardião (Camada 2)
-- Exigimos CPF Verificado, 2FA Ligado, Distância < Raio, TTL < 30min E Trust Score >= 80
CREATE OR REPLACE FUNCTION get_nearby_guardians(
  sos_lon double precision, 
  sos_lat double precision, 
  radius_meters double precision,
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

-- 4. Função auxiliar para a Edge Function de Webhook ler a coordenada WKB
CREATE OR REPLACE FUNCTION get_alert_coords(a_id uuid)
RETURNS TABLE (latitude double precision, longitude double precision) AS $$
BEGIN
  RETURN QUERY
  SELECT ST_Y(location::geometry), ST_X(location::geometry)
  FROM alerts
  WHERE id = a_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
