-- ==============================================================================
-- ÁGORA - SPRINT 9
-- Adicionando campos para configurações de perfil (Acessibilidade, Notificações, Privacidade)
-- ==============================================================================

-- 1. Campos de Configuração no Perfil
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"alerts_nearby":true, "confirmations":true, "sos_network":true, "agora_news":true}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS cpf_number text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS share_realtime_location boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS store_location_history boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_data_with_partners boolean DEFAULT false;

-- 2. Atualizar o Trigger para preencher o display_name
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
