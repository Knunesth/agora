import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpcrfwjjfuelcgvivkir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c3mkyf7gbExY_cqA7G4Zdw_CFyxKzMV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const demoAlerts = [
  {
    category: 'infraestrutura',
    description: 'Buraco gigante na Asa Norte, perigo para carros e motos.',
    latitude: -15.7533,
    longitude: -47.8820,
    status: 'verified',
    confirmations: 3
  },
  {
    category: 'iluminacao',
    description: 'Vários postes apagados na SQN 206.',
    latitude: -15.7589,
    longitude: -47.8805,
    status: 'pending',
    confirmations: 0
  },
  {
    category: 'infraestrutura',
    description: 'Água jorrando na rua há mais de 2 horas na Asa Sul.',
    latitude: -15.8202,
    longitude: -47.9059,
    status: 'verified',
    confirmations: 5
  },
  {
    category: 'infraestrutura',
    description: 'Descarte irregular de entulho e lixo na área verde.',
    latitude: -15.7942,
    longitude: -47.8821,
    status: 'pending',
    confirmations: 1
  },
  {
    category: 'infraestrutura',
    description: 'Galho enorme bloqueando a pista.',
    latitude: -15.8080,
    longitude: -47.8931,
    status: 'verified',
    confirmations: 2
  }
];

async function setup() {
  console.log('Logando como demo1@agora.app...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'demo1@agora.app',
    password: 'Agora@2025'
  });

  if (signInError) {
    console.error('Erro ao logar:', signInError.message);
    return;
  }

  const demo1Id = signInData.user.id;
  console.log(`Logado com sucesso. ID: ${demo1Id}`);

  console.log('\nInserindo alertas no mapa (Brasília)...');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

  for (const alert of demoAlerts) {
    const { data, error } = await supabase.from('alerts').insert({
      user_id: demo1Id,
      category: alert.category,
      description: alert.description,
      location: `SRID=4326;POINT(${alert.longitude} ${alert.latitude})`,
      status: alert.status,
      confirmations: alert.confirmations,
      expires_at: expiresAt.toISOString(),
    }).select().single();

    if (error) {
      console.error(`Erro ao inserir alerta "${alert.description}":`, error.message);
    } else {
      console.log(`Alerta inserido: "${alert.description}" (Expira em: ${expiresAt.toLocaleString()})`);
    }
  }

  console.log('\nFinalizado com sucesso! Demo pronta para rodar amanhã.');
}

setup();
