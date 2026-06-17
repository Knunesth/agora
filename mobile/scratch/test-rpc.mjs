import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpcrfwjjfuelcgvivkir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c3mkyf7gbExY_cqA7G4Zdw_CFyxKzMV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: `test_${Date.now()}@test.com`,
    password: 'password123'
  });
  
  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  // Pegar os alertas e extrair ST_X e ST_Y
  const { data, error } = await supabase.from('alerts').select('id, description, status, user_id').order('created_at', { ascending: false }).limit(2);
  console.log('Alerta:', data);

  // Chamar o RPC passando coordenadas falsas (ou nulas?) para ver se retorna erro ou o que?
  // Espera, para testar a distância, podemos chamar o RPC com as coordenadas de Taguatinga/Brasília (-15.8, -48.0)
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_alerts_within_radius', {
    usr_lat: -15.834,
    usr_lng: -48.083,
    radius_meters: 50000 // 50km just to be safe
  });
  console.log('RPC Error:', rpcError);
  console.log('RPC Data count:', rpcData?.length);
  console.log('RPC Data:', JSON.stringify(rpcData, null, 2));
}

test();
