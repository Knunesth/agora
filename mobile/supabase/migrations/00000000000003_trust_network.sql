-- ==============================================================================
-- ÁGORA - SPRINT 5.1
-- Migração para Rede de Confiança, Identidades Avançadas e Guardiões
-- ==============================================================================

-- TODO B2G2C: anonimizar user_id antes de expor dados agregados
-- para órgãos públicos (Defesa Civil, Sec. de Segurança). Nunca expor user_id raw fora do RLS.

-- 1. Criação do Perfil Base (Com Geolocalização)
CREATE TABLE user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  verified_cpf boolean DEFAULT false,
  two_factor_enabled boolean DEFAULT false,
  last_location geography(POINT, 4326),
  last_location_updated_at timestamptz
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- Usuários podem ler qualquer perfil
CREATE POLICY "profiles_select" ON user_profiles FOR SELECT TO authenticated USING (true);
-- Usuários podem atualizar o próprio perfil (incluindo emitir o last_location no background)
CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE TO authenticated USING (id = auth.uid());


-- 2. Trigger para auto-criação do Perfil
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


-- 3. Tabela de Contatos de Confiança
CREATE TABLE trusted_contacts (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  contact_user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, contact_user_id)
);
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
-- Só o próprio usuário gerencia e consulta seus contatos
CREATE POLICY "contacts_select" ON trusted_contacts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "contacts_insert" ON trusted_contacts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "contacts_delete" ON trusted_contacts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- 4. Função RPC para buscar Guardiões Próximos (Camada 2)
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
    AND id != exclude_user_id
    AND last_location_updated_at > (now() - interval '30 minutes')
    AND ST_DWithin(
      last_location, 
      ST_SetSRID(ST_MakePoint(sos_lon, sos_lat), 4326)::geography, 
      radius_meters
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
