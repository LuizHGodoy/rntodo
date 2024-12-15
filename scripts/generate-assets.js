const sharp = require('sharp');
const path = require('node:path');

const ICON_SIZE = 1024;
const SPLASH_SIZE = 1242;
const BACKGROUND_COLOR = '#1A1B1E';
const ICON_COLOR = '#6750A4';

async function generateIcon() {
  const svg = `
    <svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 ${ICON_SIZE} ${ICON_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${BACKGROUND_COLOR}"/>
      <circle cx="${ICON_SIZE/2}" cy="${ICON_SIZE/2}" r="${ICON_SIZE/3}" fill="${ICON_COLOR}"/>
      <path 
        d="M ${ICON_SIZE/2 - ICON_SIZE/6} ${ICON_SIZE/2}
           l ${ICON_SIZE/8} ${ICON_SIZE/8}
           l ${ICON_SIZE/4} -${ICON_SIZE/4}"
        stroke="white"
        stroke-width="${ICON_SIZE/16}"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  `;

  // Generate icon.png
  await sharp(Buffer.from(svg))
    .resize(ICON_SIZE, ICON_SIZE)
    .toFile(path.join(__dirname, '../assets/icon.png'));

  // Generate adaptive-icon.png
  await sharp(Buffer.from(svg))
    .resize(ICON_SIZE, ICON_SIZE)
    .toFile(path.join(__dirname, '../assets/adaptive-icon.png'));

  // Generate favicon.png
  await sharp(Buffer.from(svg))
    .resize(64, 64)
    .toFile(path.join(__dirname, '../assets/favicon.png'));
}

async function generateSplash() {
  const svg = `
    <svg width="${SPLASH_SIZE}" height="${SPLASH_SIZE}" viewBox="0 0 ${SPLASH_SIZE} ${SPLASH_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${BACKGROUND_COLOR}"/>
      <circle cx="${SPLASH_SIZE/2}" cy="${SPLASH_SIZE/2}" r="${SPLASH_SIZE/3}" fill="${ICON_COLOR}"/>
      <path 
        d="M ${SPLASH_SIZE/2 - SPLASH_SIZE/6} ${SPLASH_SIZE/2}
           l ${SPLASH_SIZE/8} ${SPLASH_SIZE/8}
           l ${SPLASH_SIZE/4} -${SPLASH_SIZE/4}"
        stroke="white"
        stroke-width="${SPLASH_SIZE/16}"
        stroke-linecap="round"
        stroke-linejoin="round"
        fill="none"
      />
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(SPLASH_SIZE, SPLASH_SIZE)
    .toFile(path.join(__dirname, '../assets/splash-icon.png'));
}

async function main() {
  await generateIcon();
  await generateSplash();
  console.log('Assets generated successfully!');
}

main().catch(console.error);
