import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpcrfwjjfuelcgvivkir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c3mkyf7gbExY_cqA7G4Zdw_CFyxKzMV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  console.log('Logando como demo1@agora.app...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'demo1@agora.app',
    password: 'Agora@2025'
  });

  if (signInError) {
    console.error('Erro ao logar:', signInError.message);
    return;
  }

  console.log('Chamando edge function generate-invite...');
  const { data, error } = await supabase.functions.invoke('generate-invite', {
    method: 'POST'
  });

  if (error) {
    console.error('Erro na chamada:', error);
  } else {
    console.log('Link gerado com sucesso:', data?.link);
  }
}

test();
