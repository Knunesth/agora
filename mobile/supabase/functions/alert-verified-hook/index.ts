import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record; // Row que ativou o webhook

    // Só reage se for o webhook de update e o status for verified
    if (payload.type !== 'UPDATE' || record.status !== 'verified') {
      return new Response('Not a verified update', { status: 200 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // 1. Extrair Latitude e Longitude do formato binário do PostGIS usando a RPC auxiliar
    const { data: coordsData, error: coordsError } = await supabaseClient
      .rpc('get_alert_coords', { a_id: record.id })
      .single();

    if (coordsError || !coordsData) {
      throw new Error('Falha ao obter coordenadas limpas do alerta.');
    }

    const { latitude, longitude } = coordsData;

    // 2. Reverse Geocoding via Nominatim (OpenStreetMap)
    const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    // Header obrigatório no Nominatim (User-Agent válido para não tomar block)
    const geoResponse = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'AgoraMobileApp/1.0 (B2B2C Security Layer)',
      }
    });
    
    const geoData = await geoResponse.json();
    
    // Pega bairro (suburb/neighbourhood) ou cidade/rua como fallback
    const locationName = geoData.address?.suburb 
      || geoData.address?.neighbourhood 
      || geoData.address?.city_district
      || geoData.address?.road
      || geoData.address?.city 
      || 'sua região';

    // 3. Mock de Push Notification Contextualizada
    console.log(`[PUSH NOTIFICATION] -> User: ${record.user_id}`);
    console.log(`💬 "Obrigado! O seu alerta de ${record.category.toUpperCase()} acabou de proteger a vizinhança em ${locationName}."`);

    return new Response(JSON.stringify({ success: true, location: locationName }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
