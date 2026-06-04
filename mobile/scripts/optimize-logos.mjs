/**
 * Script de otimização de logos para o projeto Ágora.
 * 
 * Gera versões otimizadas das logos originais:
 * - icon.png (1024x1024) — ícone do app
 * - adaptive-icon.png (1024x1024) — ícone adaptativo Android
 * - splash-icon.png (288x288) — splash screen
 * - favicon.png (48x48) — favicon web
 * 
 * Uso: node scripts/optimize-logos.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMGS = path.resolve(ROOT, '..', 'imgs');
const ASSETS = path.resolve(ROOT, 'assets', 'images');

async function optimize() {
  const logoPath = path.join(IMGS, 'logo.png');

  console.log('🎨 Otimizando logos do Ágora...\n');

  // 1. App icon (1024x1024)
  await sharp(logoPath)
    .resize(1024, 1024, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(path.join(ASSETS, 'icon.png'));
  console.log('✅ icon.png (1024x1024)');

  // 2. Adaptive icon foreground (1024x1024 — só o ícone, com padding)
  await sharp(logoPath)
    .resize(680, 680, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 172,
      bottom: 172,
      left: 172,
      right: 172,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ quality: 90 })
    .toFile(path.join(ASSETS, 'adaptive-icon.png'));
  console.log('✅ adaptive-icon.png (1024x1024 com safe zone)');

  // 3. Splash icon (288x288)
  await sharp(logoPath)
    .resize(288, 288, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png({ quality: 85 })
    .toFile(path.join(ASSETS, 'splash-icon.png'));
  console.log('✅ splash-icon.png (288x288)');

  // 4. Favicon (48x48)
  await sharp(logoPath)
    .resize(48, 48, { fit: 'contain', background: { r: 10, g: 10, b: 10, alpha: 1 } })
    .png({ quality: 80 })
    .toFile(path.join(ASSETS, 'favicon.png'));
  console.log('✅ favicon.png (48x48)');

  console.log('\n🎉 Logos otimizadas com sucesso!');
}

optimize().catch(console.error);
