// supabase/functions/sos-alert/index.ts
// Edge Function — Acionamento de Emergência SOS
//
// Segurança: o user_id é extraído do JWT (nunca do body).
// Qualquer tentativa de emitir SOS em nome de outro usuário é impossível.

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

  // ── Autenticação JWT ───────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Usar cliente anon + JWT do usuário para validar a sessão
  const supabaseAnon = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // user_id vem do JWT — nunca do body
  const userId = user.id;

  // ── Lógica principal ───────────────────────────────────────────────────────
  try {
    const { location } = await req.json();

    if (!location || !location.latitude || !location.longitude) {
      return new Response(
        JSON.stringify({ error: 'Localização é obrigatória para emissão de SOS.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inicializar Supabase com Service Role Key para ignorar RLS nas operações de banco
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Inserir Alerta SOS (status VERIFIED direto — bypassa quarentena)
    const { data: alert, error: dbError } = await supabaseAdmin
      .from('alerts')
      .insert({
        category: 'sos',
        description: 'ALERTA SOS EMITIDO PELO USUÁRIO',
        status: 'verified',
        location: `POINT(${location.longitude} ${location.latitude})`,
        user_id: userId,
        expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3h
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Camada 1: Buscar Contatos de Confiança Pessoais
    const { data: contacts } = await supabaseAdmin
      .from('trusted_contacts')
      .select('contact_user_id')
      .eq('user_id', userId);

    // 3. Camada 2: Buscar Guardiões Próximos (Raio 2km, TTL 30min, trust_score ≥ 80)
    const { data: guardians } = await supabaseAdmin
      .rpc('get_nearby_guardians', {
        sos_lon: location.longitude,
        sos_lat: location.latitude,
        radius_meters: 2000,
        exclude_user_id: userId,
      });

    const contactsCount = contacts?.length ?? 0;
    const guardiansCount = guardians?.length ?? 0;

    console.log(`[SOS] user_id: ${userId} | contatos: ${contactsCount} | guardiões: ${guardiansCount}`);

    // ── Push Notifications ────────────────────────────────────────────────────
    // Bloco isolado: falha no envio de push NUNCA interrompe o fluxo principal do SOS
    try {
      // Coletar IDs dos destinatários (contatos + guardiões, sem duplicatas, sem o próprio emissor)
      const contactIds = (contacts ?? []).map((c: { contact_user_id: string }) => c.contact_user_id);
      const guardianIds = (guardians ?? []).map((g: { user_id: string }) => g.user_id);
      const destinatarioIds = [...new Set([...contactIds, ...guardianIds])].filter(
        (id) => id !== userId
      );

      if (destinatarioIds.length > 0) {
        // Buscar nome do emissor para personalizar a mensagem
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('display_name')
          .eq('id', userId)
          .single();
        const senderName: string = (profile as { display_name?: string } | null)?.display_name ?? 'Alguém da sua rede';

        // Buscar tokens de push dos destinatários
        const { data: tokenRows } = await supabaseAdmin
          .from('push_tokens')
          .select('token')
          .in('user_id', destinatarioIds);

        const tokens = (tokenRows ?? []).map((r: { token: string }) => r.token);

        if (tokens.length > 0) {
          // Montar mensagens no formato Expo Push API
          const messages = tokens.map((token: string) => ({
            to: token,
            channelId: 'sos',
            title: '🚨 SOS — Emergência próxima',
            body: `${senderName} acionou o SOS. Toque para ver a localização.`,
            data: { type: 'sos', userId },
            sound: 'default',
            priority: 'high',
          }));

          // Enviar via Expo Push API (sem FCM/APNs manual)
          const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(messages),
          });

          if (!pushResponse.ok) {
            console.error('[SOS] Expo Push API erro:', pushResponse.status);
          } else {
            console.log(`[SOS] Push enviado para ${tokens.length} dispositivo(s).`);
          }
        }
      }
    } catch (pushErr: unknown) {
      // Log do erro sem propagar — o SOS já foi processado com sucesso
      const msg = pushErr instanceof Error ? pushErr.message : 'Erro desconhecido';
      console.error('[SOS] Falha no envio de push (não crítico):', msg);
    }

    // 4. Gerar URL temporária de rastreio (30 minutos)
    const tracking_url = `${Deno.env.get('APP_URL') || 'https://agora-app-swart.vercel.app'}/track/${alert.id}`;

    return new Response(
      JSON.stringify({
        message: 'SOS processado com sucesso',
        alert_id: alert.id,
        contacts_notified: contactsCount,
        guardians_notified: guardiansCount,
        tracking_url,
        tracking_expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[SOS] Falha na emissão:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
