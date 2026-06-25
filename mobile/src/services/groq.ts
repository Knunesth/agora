/**
 * Ágora — Serviço de Classificação com Groq (via Edge Function)
 *
 * A chamada à API Groq foi movida para a Edge Function `classify-alert`
 * para proteger a chave da API. Variáveis `EXPO_PUBLIC_*` são embutidas
 * no bundle do app e facilmente extraíveis — nunca use para chaves de API.
 *
 * A Edge Function lê a chave de `Deno.env.get('GROQ_API_KEY')` (servidor).
 * Para configurar:
 *   npx supabase secrets set GROQ_API_KEY=gsk_...
 */

import { supabase } from './supabase';
import { RiskCategory } from '@/types';

export type AlertCategory = RiskCategory;

export interface ClassificationResult {
  category: AlertCategory;
  confidence: 'high' | 'medium' | 'low';
  suggestion: string;
}

/**
 * Classifica a descrição de um alerta usando LLaMA 3.1 via Edge Function.
 * Retorna null em caso de falha — nunca bloqueia o fluxo do usuário.
 */
export async function classifyAlert(
  description: string
): Promise<ClassificationResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('classify-alert', {
      body: { description },
    });

    if (error || !data || data.error) return null;

    return data as ClassificationResult;
  } catch {
    return null;
  }
}
