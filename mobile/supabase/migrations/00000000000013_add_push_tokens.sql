-- ==============================================================================
-- ÁGORA - SPRINT 12
-- Tabela de tokens de push notification (Expo Push Tokens)
--
-- Cada dispositivo físico de um usuário autenticado registra seu token aqui.
-- A Edge Function sos-alert busca os tokens dos destinatários nesta tabela
-- para enviar notificações via Expo Push API (https://exp.host/--/api/v2/push/send).
-- ==============================================================================

CREATE TABLE push_tokens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       text        NOT NULL,
  platform    text        CHECK (platform IN ('ios', 'android', 'web')),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Usuário só lê e gerencia seus próprios tokens (o servidor usa Service Role Key)
CREATE POLICY "push_tokens_owner" ON push_tokens
  FOR ALL
  USING (user_id = auth.uid());
