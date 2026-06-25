/**
 * Ágora — Queue offline de alertas
 * Persiste alertas pendentes no AsyncStorage e os reenvia quando a conexão voltar.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { storageService } from './storage';

const QUEUE_KEY = 'agora:alert_queue';

export interface QueuedAlert {
  id: string;                  // UUID local gerado no momento do enqueue
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  photoUri: string | null;     // URI LOCAL da foto (não URL do Supabase ainda)
  userId: string;
  enqueuedAt: string;          // ISO string
  attempts: number;            // Contagem de tentativas
}

export const alertQueue = {
  // Lê a queue inteira
  async getAll(): Promise<QueuedAlert[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Adiciona um alerta à queue
  async enqueue(alert: Omit<QueuedAlert, 'id' | 'enqueuedAt' | 'attempts'>): Promise<void> {
    const queue = await alertQueue.getAll();
    queue.push({
      ...alert,
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      enqueuedAt: new Date().toISOString(),
      attempts: 0,
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  // Remove um item da queue pelo id local
  async dequeue(localId: string): Promise<void> {
    const queue = await alertQueue.getAll();
    await AsyncStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(queue.filter(a => a.id !== localId))
    );
  },

  async incrementAttempts(localId: string): Promise<void> {
    const queue = await alertQueue.getAll();
    await AsyncStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(queue.map(a => a.id === localId ? { ...a, attempts: a.attempts + 1 } : a))
    );
  },

  // Processa a queue: tenta enviar cada item ao Supabase
  // Máximo 3 tentativas por item — após isso descarta com log
  async process(): Promise<{ sent: number; failed: number }> {
    const queue = await alertQueue.getAll();
    if (queue.length === 0) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;

    for (const item of queue) {
      if (item.attempts >= 3) {
        // Descarta após 3 falhas — evita loop infinito
        await alertQueue.dequeue(item.id);
        failed++;
        continue;
      }

      try {
        await alertQueue.incrementAttempts(item.id);

        // Tenta fazer upload da foto se houver URI local
        let photoUrl: string | null = null;
        if (item.photoUri) {
          try {
            photoUrl = await storageService.uploadAlertPhoto(item.photoUri);
          } catch {
            // Foto falhou mas alerta segue sem ela
            photoUrl = null;
          }
        }

        const { error } = await supabase.from('alerts').insert({
          category: item.category,
          description: item.description,
          photo_url: photoUrl,
          location: `POINT(${item.longitude} ${item.latitude})`,
          user_id: item.userId,
        });

        if (error) throw error;

        await alertQueue.dequeue(item.id);
        sent++;
      } catch {
        // Mantém na queue para próxima tentativa
        failed++;
      }
    }

    return { sent, failed };
  },

  // Retorna quantos alertas estão pendentes
  async count(): Promise<number> {
    return (await alertQueue.getAll()).length;
  }
};
