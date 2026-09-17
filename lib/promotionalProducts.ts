import fs from 'fs';
import path from 'path';
import {
  TabData,
  DEFAULT_PROMOTIONAL_TABS,
} from '@/types/promotionalProducts';

export * from '@/types/promotionalProducts';

const DATA_FILE = path.join(process.cwd(), 'data', 'promotional-products.json');

export function getPromotionalTabs(): TabData[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading promotional-products.json:', err);
  }
  // Initialize file with default data if missing
  savePromotionalTabs(DEFAULT_PROMOTIONAL_TABS);
  return DEFAULT_PROMOTIONAL_TABS;
}

export function savePromotionalTabs(tabs: TabData[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(tabs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing promotional-products.json:', err);
  }
}
