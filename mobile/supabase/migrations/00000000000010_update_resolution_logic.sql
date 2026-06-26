-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP FUNCTION IF EXISTS increment_alert_confirmations CASCADE;
-- (restaurar a versão anterior da migration 04 manualmente se necessário)

-- Migration: 00000000000010_update_resolution_logic.sql
-- Descrição: Atualiza increment_alert_confirmations para rejeitar alertas com 5+ votos contra após 3h de carência
-- Depende de: 00000000000004_alert_votes.sql

-- Regra de rejeição por consenso negativo:
-- 5 votos 'reject' + alerta com mais de 3h de existência → status 'expired' (sem penalidade de gamificação).
-- O intervalo de 3h evita rejeições instantâneas coordenadas por bad actors.
CREATE OR REPLACE FUNCTION increment_alert_confirmations()
RETURNS TRIGGER AS $$
DECLARE
  v_reject_count INT;
  v_created_at   TIMESTAMPTZ;
BEGIN
  IF NEW.vote_type = 'confirm' THEN
    UPDATE alerts
    SET confirmations = confirmations + 1
    WHERE id = NEW.alert_id;

  ELSIF NEW.vote_type = 'reject' THEN
    SELECT count(*) INTO v_reject_count
    FROM alert_votes
    WHERE alert_id = NEW.alert_id AND vote_type = 'reject';

    SELECT created_at INTO v_created_at
    FROM alerts
    WHERE id = NEW.alert_id;

    -- Usa 'expired' (não 'rejected') para não disparar penalidade de trust_score na migration 05
    IF v_reject_count >= 5 AND (now() - v_created_at) > INTERVAL '3 hours' THEN
      UPDATE alerts SET status = 'expired' WHERE id = NEW.alert_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
