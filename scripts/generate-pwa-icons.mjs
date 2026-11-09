import { mkdirSync } from "node:fs";
import sharp from "sharp";

/**
 * Genera los iconos de la PWA a partir del mismo símbolo del favicon
 * (`src/app/icon.svg`). Uso: `node scripts/generate-pwa-icons.mjs`.
 */
const BRAND = "#f4b728";
const INK = "#17130a";

function icon(bars) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="112" fill="${BRAND}"/>
    <g fill="${INK}">${bars}</g>
  </svg>`;
}

const standard = icon(`
  <rect x="112" y="228" width="56" height="112" rx="28"/>
  <rect x="228" y="140" width="56" height="288" rx="28"/>
  <rect x="344" y="196" width="56" height="176" rx="28"/>
`);

// Zona segura para iconos maskable: el símbolo queda dentro del 80% central.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BRAND}"/>
  <g fill="${INK}" transform="translate(256 256) scale(0.78) translate(-256 -256)">
    <rect x="112" y="228" width="56" height="112" rx="28"/>
    <rect x="228" y="140" width="56" height="288" rx="28"/>
    <rect x="344" y="196" width="56" height="176" rx="28"/>
  </g>
</svg>`;

const targets = [
  { file: "public/icons/icon-192.png", svg: standard, size: 192 },
  { file: "public/icons/icon-512.png", svg: standard, size: 512 },
  { file: "public/icons/maskable-512.png", svg: maskable, size: 512 },
  { file: "public/icons/apple-touch-icon.png", svg: standard, size: 180 },
];

for (const target of targets) {
  mkdirSync("public/icons", { recursive: true });

  await sharp(Buffer.from(target.svg))
    .resize(target.size, target.size)
    .png({ compressionLevel: 9 })
    .toFile(target.file);

  console.log(`${target.file} (${target.size}x${target.size})`);
}
