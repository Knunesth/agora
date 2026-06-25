-- Atualiza a trigger para lidar com a regra de rejeição (5 votos + 3 horas de carência)
CREATE OR REPLACE FUNCTION increment_alert_confirmations()
RETURNS TRIGGER AS $$
DECLARE
  v_reject_count INT;
  v_created_at TIMESTAMPTZ;
BEGIN
  IF NEW.vote_type = 'confirm' THEN
    UPDATE alerts 
    SET confirmations = confirmations + 1
    WHERE id = NEW.alert_id;
  ELSIF NEW.vote_type = 'reject' THEN
    -- Pega quantos votos de reject esse alerta tem no total
    SELECT count(*) INTO v_reject_count 
    FROM alert_votes 
    WHERE alert_id = NEW.alert_id AND vote_type = 'reject';
    
    -- Pega a data de criação do alerta
    SELECT created_at INTO v_created_at 
    FROM alerts 
    WHERE id = NEW.alert_id;
    
    -- Se tem 5 ou mais votos contra E já se passaram mais de 3 horas desde a criação
    IF v_reject_count >= 5 AND (now() - v_created_at) > INTERVAL '3 hours' THEN
       -- Muda o status para 'expired' para remover do mapa pacificamente sem penalizar na gamificação
       UPDATE alerts SET status = 'expired' WHERE id = NEW.alert_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
