import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpcrfwjjfuelcgvivkir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c3mkyf7gbExY_cqA7G4Zdw_CFyxKzMV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  // Create an anonymous user (if auth allows) or sign up a dummy user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: `test_${Date.now()}@test.com`,
    password: 'password123'
  });
  
  if (authError) {
    console.error('Auth error:', authError);
    return;
  }

  // Now we are authenticated
  const { data, error } = await supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(5);
  console.log('Error:', error);
  console.log('Data:', JSON.stringify(data, null, 2));
}

test();
