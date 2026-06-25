// Follow this setup guide to integrate the Deno language server with your editor:
// https://supabase.com/docs/guides/functions/getting-started

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Setup CORS para permitir a chamada originada do React Native / Web
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com o preflight CORS (browser/react-native usa OPTIONS antes do POST)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { location, user_id } = await req.json();

    if (!user_id) {
      throw new Error('Usuário não autenticado.');
    }

    if (!location || !location.latitude || !location.longitude) {
      throw new Error('Localização é obrigatória para emissão de SOS.');
    }

    // Inicializar Supabase usando a Service Role Key para ignorar Row Level Security (RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Inserir Alerta na base de dados (Ignorando Quarentena - Status VERIFIED direto)
    const { data: alert, error: dbError } = await supabaseClient
      .from('alerts')
      .insert({
        category: 'sos',
        description: 'ALERTA SOS EMITIDO PELO USUÁRIO',
        status: 'verified',
        location: `POINT(${location.longitude} ${location.latitude})`,
        user_id,
        expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Camada 1: Buscar Contatos de Confiança Pessoais
    const { data: contacts } = await supabaseClient
      .from('trusted_contacts')
      .select('contact_user_id')
      .eq('user_id', user_id);

    // 3. Camada 2: Buscar Guardiões Próximos (Raio 2km, TTL 30m, Verificados)
    const { data: guardians } = await supabaseClient
      .rpc('get_nearby_guardians', {
        sos_lon: location.longitude,
        sos_lat: location.latitude,
        radius_meters: 2000,
        exclude_user_id: user_id
      });

    const contactsCount = contacts?.length || 0;
    const guardiansCount = guardians?.length || 0;

    console.log(`[SOS EMITIDO] user_id: ${user_id}`);
    console.log(`[CAMADA 1] Contatos notificados: ${contactsCount}`);
    console.log(`[CAMADA 2] Guardiões notificados: ${guardiansCount}`);

    // TODO: B2G2C - Disparar push notification assíncrono para as listas acima via serviço de Push

    // 4. Gerar URL temporária de rastreio (TTL)
    const tracking_expires_at = new Date(Date.now() + 30 * 60000).toISOString(); // 30 minutos no futuro
    const tracking_url = `https://agora.app/track/${alert.id}`;

    return new Response(
      JSON.stringify({ 
        message: 'SOS processado com sucesso',
        alert_id: alert.id,
        contacts_notified: contactsCount,
        guardians_notified: guardiansCount,
        tracking_url,
        tracking_expires_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Falha na emissão de SOS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
