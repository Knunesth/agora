-- ==============================================================================
-- ÁGORA - SPRINT 10
-- Sistema de Convites de Contatos
-- ==============================================================================

-- 1. Tabela de Convites
CREATE TABLE public.contact_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  invited_email text, -- Opcional, NULL para link genérico
  status text CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + INTERVAL '7 days'
);

-- RLS da tabela de convites
ALTER TABLE public.contact_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_owner" ON public.contact_invites
  FOR ALL TO authenticated
  USING (inviter_user_id = auth.uid());

CREATE POLICY "invite_read_by_anyone" ON public.contact_invites
  FOR SELECT TO public
  USING (status = 'pending' AND expires_at > now()); -- Necessário para verificar a validade do link sem estar logado

-- 2. RPC Segura para buscar UUID de usuário por E-mail e adicionar contato
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

  -- Acesso seguro à view ou tabela de auth
  SELECT id INTO target_id FROM auth.users WHERE email = email_query LIMIT 1;
  
  IF target_id IS NULL THEN
    RETURN false;
  END IF;

  IF target_id = caller_id THEN
    RETURN false;
  END IF;

  -- Inserção bidirecional
  INSERT INTO public.trusted_contacts (user_id, contact_user_id) VALUES (caller_id, target_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.trusted_contacts (user_id, contact_user_id) VALUES (target_id, caller_id) ON CONFLICT DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC Pública para pegar o nome de quem convidou na tela de Welcome
CREATE OR REPLACE FUNCTION public.get_invite_info(code text)
RETURNS TABLE(inviter_name text, inviter_initials text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.display_name,
    UPPER(SUBSTRING(p.display_name FROM 1 FOR 1)) -- Lógica simples para iniciais
  FROM public.contact_invites i
  JOIN public.user_profiles p ON p.id = i.inviter_user_id
  WHERE i.invite_code = code AND i.status = 'pending' AND i.expires_at > now()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

