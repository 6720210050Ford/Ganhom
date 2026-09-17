import fs from 'fs';

export function getCatalogDimensions() {
  const banner4 = 'C:\\Users\\MSIWorrapon\\.gemini\\antigravity-ide\\brain\\590b1a69-0970-48d3-a6fe-68a4814addab\\.user_uploaded\\media_1788961879104.png';
  if (!fs.existsSync(banner4)) {
    return { width: 1000, height: 600 };
  }
  const buf = fs.readFileSync(banner4);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}
