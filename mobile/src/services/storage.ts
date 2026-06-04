/**
 * Ágora — Serviço de Storage (Upload de Evidências)
 * Responsável por comprimir fotos nativas e fazer o upload seguro para o Supabase.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from './supabase';

// Nome do bucket que você criou no painel do Supabase
const BUCKET_NAME = 'alert-photos';

export const storageService = {
  /**
   * Comprime uma imagem tirada pela câmera e faz upload para o Supabase
   * @param localUri A URI local do arquivo gerado pelo expo-camera
   * @returns A URL pública da imagem salva no bucket
   */
  async uploadAlertPhoto(localUri: string): Promise<string> {
    try {
      // 1. Otimização da imagem para economizar dados do usuário (RF-03/Performance)
      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 800 } }], // Reduz para 800px de largura
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 2. Extrai o nome do arquivo e a extensão
      const fileName = localUri.split('/').pop() || `alert_evidence_${Date.now()}.jpg`;
      const filePath = `${Date.now()}_${fileName}`; // Evita colisão de nomes

      // 3. Converte a URI local num Blob para ser aceita pelo Supabase/Fetch API
      const response = await fetch(manipResult.uri);
      if (!response.ok) throw new Error('Falha ao processar arquivo local.');
      const blob = await response.blob();

      // 4. Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
        });

      if (error) {
        throw new Error(error.message);
      }

      // 5. Obter a URL Pública do arquivo recém upado
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      const finalUrl = publicUrlData.publicUrl;

      // 6. VALIDAÇÃO ESTRITA: Exigência para garantir que o insert no banco nunca fique sem foto
      if (!finalUrl) {
        throw new Error('Upload da foto falhou — alerta não pode ser salvo.');
      }

      return finalUrl;

    } catch (err: any) {
      console.error('[StorageService] Erro no upload:', err.message);
      throw new Error(`Upload falhou: ${err.message}`);
    }
  }
};
