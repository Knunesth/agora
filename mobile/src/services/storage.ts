/**
 * Ágora — Serviço de Storage (Upload de Evidências)
 * Responsável por comprimir fotos nativas e fazer o upload seguro para o Supabase.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
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

      // 2. Extrai o nome do arquivo
      const fileName = localUri.split('/').pop() || `alert_evidence_${Date.now()}.jpg`;
      
      // 3. Busca o user_id para montar o path conforme exigido pela RLS do bucket:
      //    policy: auth.uid()::text = (storage.foldername(name))[1]
      //    ou seja, o path DEVE começar com o user_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado.');
      const filePath = `${user.id}/${Date.now()}_${fileName}`;

      // 3. Lê o arquivo local como base64 via FileSystem
      //    IMPORTANTE: fetch() com URI file:// falha no Android/iOS nativo com "Network request failed"
      //    FileSystem.readAsStringAsync é a forma correta de ler arquivos locais no React Native
      const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 4. Converte base64 → ArrayBuffer (formato aceito pelo Supabase Storage)
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 5. Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, bytes.buffer, {
          contentType: 'image/jpeg',
        });

      if (error) {
        throw new Error(error.message);
      }

      // 6. Obter a URL Pública do arquivo recém upado
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
