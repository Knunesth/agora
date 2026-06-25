// supabase/functions/classify-alert/index.ts
// Edge Function — Classificação de alertas com Groq (LLaMA 3.1)
//
// ⚠️  ANTES DO DEPLOY: configure a chave da API Groq como secret do servidor:
//     npx supabase secrets set GROQ_API_KEY=gsk_...
//     Nunca use EXPO_PUBLIC_GROQ_API_KEY — variáveis EXPO_PUBLIC são embutidas
//     no bundle do app e podem ser extraídas por qualquer pessoa.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // ── Autenticação JWT ───────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  // ── Lógica principal ───────────────────────────────────────────────────────
  try {
    const { description } = await req.json();

    if (!description || typeof description !== 'string' || description.length < 5) {
      return new Response(
        JSON.stringify({ error: 'description inválida' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY não configurada — rode: npx supabase secrets set GROQ_API_KEY=gsk_...');

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente de classificação de alertas urbanos do app Ágora, uma plataforma de segurança colaborativa de Brasília.

Classifique a descrição do usuário em UMA das categorias abaixo e responda APENAS em JSON válido, sem texto adicional:

Categorias disponíveis:
- furto: roubo, assalto, furto de veículo, carteira, celular
- iluminacao: poste apagado, rua escura, falta de luz
- infraestrutura: buraco, calçada quebrada, vazamento, sinalização
- assedio: assédio sexual, verbal, perseguição
- suspeito: pessoa ou veículo suspeito, comportamento estranho
- outro: qualquer coisa que não se encaixe nas categorias acima

Formato de resposta obrigatório:
{
  "category": "nome_da_categoria",
  "confidence": "high|medium|low",
  "suggestion": "mensagem curta e amigável confirmando a classificação em português"
}`,
          },
          { role: 'user', content: description },
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!groqResponse.ok) {
      const err = await groqResponse.text();
      throw new Error(`Groq API error: ${groqResponse.status} — ${err}`);
    }

    const groqData = await groqResponse.json();
    const content: string = groqData.choices?.[0]?.message?.content ?? '';

    // Extrai o JSON da resposta (pode vir com texto extra em alguns modelos)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!parsed?.category) throw new Error('Resposta inválida do Groq');

    return new Response(JSON.stringify(parsed), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    // Retorna "outro" como fallback — nunca quebra o fluxo do app
    return new Response(
      JSON.stringify({
        category: 'outro',
        confidence: 'low',
        suggestion: 'Não consegui identificar a categoria. Selecione manualmente.',
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
