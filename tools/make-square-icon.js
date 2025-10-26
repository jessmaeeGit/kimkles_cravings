#!/usr/bin/env node
/*
Usage:
  node tools/make-square-icon.js <inputPath> <outputPath> [backgroundHex]
Example:
  node tools/make-square-icon.js ./images/kimkles_logo.png ./images/kimkles_logo_square.png #E8D8FF
*/
const sharp = require('sharp');

function hexToRgba(hex, alpha = 1) {
  if (!hex) return { r: 0, g: 0, b: 0, alpha: 0 };
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b, alpha };
}

(async () => {
  const [input, output, bgHex] = process.argv.slice(2);
  if (!input || !output) {
    console.error('Usage: node tools/make-square-icon.js <inputPath> <outputPath> [backgroundHex]');
    process.exit(1);
  }
  try {
    // Load and trim to remove transparent borders, then center on square canvas
    const background = bgHex ? hexToRgba(bgHex) : { r: 0, g: 0, b: 0, alpha: 0 };
    const trimmed = sharp(input).trim();
    const tMeta = await trimmed.metadata();
    const base = Math.max(tMeta.width || 0, tMeta.height || 0) || 1024;
    const canvasSize = base; // keep original max dimension
    const marginFactor = 0.85; // slight margin to compress the logo a bit
    const targetW = Math.round(canvasSize * marginFactor);
    const targetH = targetW; // square target box
    const resizedBuf = await trimmed
      .resize(targetW, targetH, { fit: 'inside' })
      .toBuffer();

    const canvas = sharp({
      create: {
        width: canvasSize,
        height: canvasSize,
        channels: 4,
        background,
      },
    });

    await canvas
      .composite([{ input: resizedBuf, gravity: 'center' }])
      .toFile(output);
    console.log(`Wrote square icon: ${output} (${canvasSize}x${canvasSize})`);
  } catch (e) {
    console.error('Failed to create square icon:', e.message);
    process.exit(2);
  }
})();
