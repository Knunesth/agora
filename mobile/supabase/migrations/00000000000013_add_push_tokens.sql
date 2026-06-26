-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP POLICY IF EXISTS "push_tokens_owner" ON push_tokens;
-- DROP TABLE IF EXISTS push_tokens CASCADE;

-- Migration: 00000000000013_add_push_tokens.sql
-- Descrição: Cria tabela de tokens de push notification (Expo Push Tokens) por dispositivo/usuário
-- Depende de: 00000000000000_init_agora.sql

-- Cada dispositivo físico de um usuário autenticado registra seu token aqui.
-- A Edge Function sos-alert busca os tokens dos destinatários para enviar via Expo Push API.
CREATE TABLE push_tokens (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      text        NOT NULL,
  platform   text        CHECK (platform IN ('ios', 'android', 'web')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- O cliente gerencia apenas seus próprios tokens; o servidor usa Service Role Key para leitura irrestrita
CREATE POLICY "push_tokens_owner" ON push_tokens
  FOR ALL
  USING (user_id = auth.uid());
