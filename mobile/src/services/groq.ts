/**
 * Ágora — Serviço de Classificação com Groq (LLaMA 3.1)
 *
 * Chama a API do Groq diretamente do app — Groq é gratuito, tem CORS habilitado
 * e responde em ~200ms com o modelo llama-3.1-8b-instant.
 *
 * Obter chave: console.groq.com → API Keys → Create API Key
 */

import { RiskCategory } from '@/types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export type AlertCategory = RiskCategory;

export interface ClassificationResult {
  category: AlertCategory;
  confidence: 'high' | 'medium' | 'low';
  suggestion: string;
}

const SYSTEM_PROMPT = `Você é um assistente de classificação de alertas urbanos do app Ágora, uma plataforma de segurança colaborativa de Brasília.

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
}`;

/**
 * Classifica a descrição de um alerta usando LLaMA 3.1 via Groq.
 * Retorna null em caso de falha — nunca bloqueia o fluxo do usuário.
 */
export async function classifyAlert(
  description: string
): Promise<ClassificationResult | null> {
  if (!GROQ_API_KEY) {
    console.warn('[Groq] EXPO_PUBLIC_GROQ_API_KEY não configurada.');
    return null;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description },
        ],
        temperature: 0.1,
        max_tokens: 150,
      }),
    });

    if (!response.ok) throw new Error(`Groq HTTP ${response.status}`);

    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content ?? '';

    // Extrai JSON da resposta (seguro caso venha com texto extra)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta sem JSON válido');

    return JSON.parse(jsonMatch[0]) as ClassificationResult;
  } catch (err) {
    console.warn('[Groq] Classificação indisponível:', err);
    return null;
  }
}
