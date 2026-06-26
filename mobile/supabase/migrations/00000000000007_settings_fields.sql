-- ROLLBACK (executar manualmente se precisar desfazer):
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS share_data_with_partners;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS store_location_history;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS share_realtime_location;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS neighborhood;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS birth_date;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS cpf_number;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS phone;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS display_name;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS is_admin;
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS notification_preferences;

-- Migration: 00000000000007_settings_fields.sql
-- Descrição: Adiciona campos de configurações de perfil (acessibilidade, notificações, privacidade) e atualiza handle_new_user para gravar display_name
-- Depende de: 00000000000003_trust_network.sql

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS notification_preferences  jsonb    DEFAULT '{"alerts_nearby":true,"confirmations":true,"sos_network":true,"agora_news":true}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_admin                  boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name              text,
  ADD COLUMN IF NOT EXISTS phone                     text,
  ADD COLUMN IF NOT EXISTS cpf_number                text,
  ADD COLUMN IF NOT EXISTS birth_date                date,
  ADD COLUMN IF NOT EXISTS neighborhood              text,
  ADD COLUMN IF NOT EXISTS share_realtime_location   boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS store_location_history    boolean  DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_data_with_partners  boolean  DEFAULT false;

-- Atualiza o trigger para gravar display_name a partir dos metadados do signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
