import fs from 'fs';
import path from 'path';

export interface StoreSettings {
  storeName: string;
  metaDesc: string;
  socialImage?: string;
  hreflangAuto: boolean;
  regionRedirect: boolean;
  langRedirect: boolean;
  hCaptchaContact: boolean;
  hCaptchaAuth: boolean;
  dataScraping: boolean;
}

const settingsFilePath = path.join(process.cwd(), 'data', 'store-settings.json');

const defaultSettings: StoreSettings = {
  storeName: 'Modern Lifestyle Online Store',
  metaDesc: 'ร้านค้าออนไลน์สินค้าพรีเมียม สไตล์ Modern Lifestyle พร้อมคอลเลกชันกระเป๋า นาฬิกา น้ำหอม และสมาร์ทโฮมระดับลักชัวรี',
  socialImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
  hreflangAuto: true,
  regionRedirect: true,
  langRedirect: false,
  hCaptchaContact: true,
  hCaptchaAuth: true,
  dataScraping: true,
};

export function getStoreSettings(): StoreSettings {
  try {
    if (!fs.existsSync(settingsFilePath)) {
      fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings, null, 2), 'utf8');
      return defaultSettings;
    }
    const content = fs.readFileSync(settingsFilePath, 'utf8');
    if (!content.trim()) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(content) };
  } catch (err) {
    console.error('Error reading store-settings.json:', err);
    return defaultSettings;
  }
}

export function saveStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
  try {
    const current = getStoreSettings();
    const updated = { ...current, ...settings };
    const dir = path.dirname(settingsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(settingsFilePath, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  } catch (err) {
    console.error('Error saving store-settings.json:', err);
    throw err;
  }
}
