/**
 * Ágora — Serviço de Classificação com Grok (xAI)
 *
 * Chama a Edge Function do Supabase que, por sua vez, chama a API do Grok
 * server-side (a chave NÃO fica exposta no bundle do app).
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
 * Classifica a descrição de um alerta usando Grok via Edge Function.
 * Em caso de erro (sem internet, chave inválida, etc.), retorna null
 * para que o usuário selecione manualmente — nunca bloqueia o fluxo.
 */
export async function classifyAlert(
  description: string
): Promise<ClassificationResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('classify-alert', {
      body: { description },
    });

    if (error) throw error;
    return data as ClassificationResult;
  } catch (err) {
    console.warn('[Grok] Classificação automática indisponível:', err);
    return null;
  }
}
