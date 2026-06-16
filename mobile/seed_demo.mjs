import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qpcrfwjjfuelcgvivkir.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c3mkyf7gbExY_cqA7G4Zdw_CFyxKzMV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function seed() {
  console.log('Iniciando o Seed de Demonstração...');

  const users = [
    { email: 'demo1@agora.app', password: 'Agora@2025' },
    { email: 'demo2@agora.app', password: 'Agora@2025' },
  ];

  let demo1Id = null;

  for (const u of users) {
    console.log(`Fazendo login: ${u.email}`);
    
    const loginRes = await supabase.auth.signInWithPassword({
      email: u.email,
      password: u.password,
    });
    
    if (loginRes.error) {
      console.error('Erro no login:', loginRes.error.message);
    } else {
      console.log(`Login sucesso!`);
      if (u.email === 'demo1@agora.app') demo1Id = loginRes.data.user.id;
    }
  }

  if (!demo1Id) {
    console.error('Não consegui obter o ID do demo1@agora.app. Parando.');
    return;
  }

  console.log('Usuários prontos. Inserindo alertas...');

  // 24 horas a partir de agora
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const alerts = [
    {
      user_id: demo1Id,
      category: 'suspeito',
      description: 'Pessoa rondando os carros no estacionamento da quadra.',
      location: `SRID=4326;POINT(-47.8930 -15.8080)`, // Asa Sul
      status: 'pending',
      confirmations: 1,
      expires_at: expiresAt.toISOString()
    },
    {
      user_id: demo1Id,
      category: 'furto',
      description: 'Assalto próximo à parada de ônibus, levaram um celular.',
      location: `SRID=4326;POINT(-47.8700 -15.7600)`, // Asa Norte
      status: 'verified',
      confirmations: 3,
      expires_at: expiresAt.toISOString()
    },
    {
      user_id: demo1Id,
      category: 'infraestrutura',
      description: 'Acidente de trânsito no Eixão Sul envolvendo 2 carros.',
      location: `SRID=4326;POINT(-47.9000 -15.8200)`, // Eixão
      status: 'pending',
      confirmations: 0,
      expires_at: expiresAt.toISOString()
    },
    {
      user_id: demo1Id,
      category: 'suspeito',
      description: 'Grupo suspeito parado na entrada do Parque da Cidade.',
      location: `SRID=4326;POINT(-47.8950 -15.7950)`, // Parque da Cidade
      status: 'pending',
      confirmations: 2,
      expires_at: expiresAt.toISOString()
    },
    {
      user_id: demo1Id,
      category: 'furto',
      description: 'Tentativa de furto perto do comércio. Cuidado ao passar lá.',
      location: `SRID=4326;POINT(-47.8800 -15.7900)`, // Plano Piloto (Setor Comercial)
      status: 'pending',
      confirmations: 1,
      expires_at: expiresAt.toISOString()
    }
  ];

  const { error: insertError } = await supabase.from('alerts').insert(alerts);

  if (insertError) {
    console.error('Erro ao inserir alertas:', insertError.message, insertError.details);
  } else {
    console.log('✅ 5 Alertas de Demonstração inseridos com sucesso!');
  }
}

seed();
