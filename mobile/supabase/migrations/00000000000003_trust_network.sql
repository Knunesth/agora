-- ROLLBACK (executar manualmente se precisar desfazer):
-- DROP FUNCTION IF EXISTS get_nearby_guardians CASCADE;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
-- DROP TABLE IF EXISTS trusted_contacts CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- Migration: 00000000000003_trust_network.sql
-- Descrição: Cria perfis de usuário, contatos de confiança, trigger de auto-criação e RPC de guardiões próximos
-- Depende de: 00000000000000_init_agora.sql

-- TODO B2G: anonimizar user_id antes de expor dados agregados a órgãos públicos (Defesa Civil etc.). Nunca expor user_id raw fora do RLS.

CREATE TABLE user_profiles (
  id                      uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  verified_cpf            boolean DEFAULT false,
  two_factor_enabled      boolean DEFAULT false,
  last_location           geography(POINT, 4326),
  last_location_updated_at timestamptz
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON user_profiles
  FOR SELECT TO authenticated USING (true);

-- Usuário pode atualizar seu próprio perfil, incluindo last_location em background
CREATE POLICY "profiles_update" ON user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Trigger que cria automaticamente um user_profile a cada novo usuário autenticado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TABLE trusted_contacts (
  user_id         uuid REFERENCES auth.users ON DELETE CASCADE,
  contact_user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, contact_user_id)
);

ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;

-- Somente o próprio usuário gerencia e consulta seus contatos de confiança
CREATE POLICY "contacts_select" ON trusted_contacts
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "contacts_insert" ON trusted_contacts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "contacts_delete" ON trusted_contacts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Guardiões elegíveis: CPF verificado, 2FA ativo, localização atualizada nos últimos 30 min e dentro do raio
CREATE OR REPLACE FUNCTION get_nearby_guardians(
  sos_lon        double precision,
  sos_lat        double precision,
  radius_meters  double precision,
  exclude_user_id uuid
)
RETURNS TABLE (guardian_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT id
  FROM user_profiles
  WHERE verified_cpf = true
    AND two_factor_enabled = true
    AND id != exclude_user_id
    AND last_location_updated_at > (now() - interval '30 minutes')
    AND ST_DWithin(
      last_location,
      ST_SetSRID(ST_MakePoint(sos_lon, sos_lat), 4326)::geography,
      radius_meters
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
