-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP FUNCTION IF EXISTS public.get_invite_info CASCADE;
-- DROP FUNCTION IF EXISTS public.add_trusted_contact_by_email CASCADE;
-- DROP POLICY IF EXISTS "invite_read_by_anyone" ON public.contact_invites;
-- DROP POLICY IF EXISTS "invite_owner" ON public.contact_invites;
-- DROP TABLE IF EXISTS public.contact_invites CASCADE;

-- Migration: 00000000000008_invites.sql
-- Descrição: Cria sistema de convites por link/e-mail para adicionar contatos de confiança
-- Depende de: 00000000000003_trust_network.sql, 00000000000007_settings_fields.sql

CREATE TABLE public.contact_invites (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  -- encode(gen_random_bytes(6), 'hex') gera um código de 12 chars criptograficamente aleatório
  invite_code      text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  invited_email    text, -- NULL para link genérico (compartilhável por qualquer canal)
  status           text CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at       timestamptz DEFAULT now(),
  expires_at       timestamptz DEFAULT now() + INTERVAL '7 days'
);

ALTER TABLE public.contact_invites ENABLE ROW LEVEL SECURITY;

-- Dono do convite pode fazer qualquer operação no próprio registro
CREATE POLICY "invite_owner" ON public.contact_invites
  FOR ALL TO authenticated
  USING (inviter_user_id = auth.uid());

-- Leitura pública de convites válidos: necessária para verificar o link sem estar logado
CREATE POLICY "invite_read_by_anyone" ON public.contact_invites
  FOR SELECT TO public
  USING (status = 'pending' AND expires_at > now());

-- RPC com SECURITY DEFINER para acessar auth.users sem expor a tabela diretamente ao cliente.
-- Inserção bidirecional: ambos viram contatos um do outro em uma única chamada.
CREATE OR REPLACE FUNCTION public.add_trusted_contact_by_email(email_query text)
RETURNS boolean AS $$
DECLARE
  target_id uuid;
  caller_id uuid;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT id INTO target_id FROM auth.users WHERE email = email_query LIMIT 1;

  IF target_id IS NULL THEN
    RETURN false;
  END IF;

  IF target_id = caller_id THEN
    RETURN false;
  END IF;

  INSERT INTO public.trusted_contacts (user_id, contact_user_id) VALUES (caller_id, target_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.trusted_contacts (user_id, contact_user_id) VALUES (target_id, caller_id) ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC pública para exibir o nome de quem convidou na tela de boas-vindas (sem exigir autenticação)
CREATE OR REPLACE FUNCTION public.get_invite_info(code text)
RETURNS TABLE(inviter_name text, inviter_initials text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.display_name,
    -- Iniciais: apenas o primeiro caractere em maiúsculo (expandir no futuro para "Nome Sobrenome" → "NS")
    UPPER(SUBSTRING(p.display_name FROM 1 FOR 1))
  FROM public.contact_invites i
  JOIN public.user_profiles p ON p.id = i.inviter_user_id
  WHERE i.invite_code = code AND i.status = 'pending' AND i.expires_at > now()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
