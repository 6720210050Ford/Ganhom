import fs from 'fs';
import path from 'path';

export interface DiscountItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  description: string;
  minSpend: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}

const discountsFilePath = path.join(process.cwd(), 'data', 'discounts.json');

export function getDiscounts(): DiscountItem[] {
  try {
    if (!fs.existsSync(discountsFilePath)) {
      fs.writeFileSync(discountsFilePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const content = fs.readFileSync(discountsFilePath, 'utf8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading discounts.json:', err);
    return [];
  }
}

export function saveDiscounts(items: DiscountItem[]): void {
  try {
    const dir = path.dirname(discountsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(discountsFilePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving discounts.json:', err);
    throw err;
  }
}

export function addDiscount(data: Omit<DiscountItem, 'id' | 'usedCount'>): DiscountItem {
  const list = getDiscounts();
  const newItem: DiscountItem = {
    ...data,
    id: `dsc-${Date.now()}`,
    code: data.code.toUpperCase().trim(),
    usedCount: 0,
  };
  list.unshift(newItem);
  saveDiscounts(list);
  return newItem;
}

export function toggleDiscountStatus(id: string): DiscountItem | null {
  const list = getDiscounts();
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  list[idx].active = !list[idx].active;
  saveDiscounts(list);
  return list[idx];
}

export function deleteDiscount(id: string): boolean {
  const list = getDiscounts();
  const filtered = list.filter((d) => d.id !== id);
  if (filtered.length === list.length) return false;
  saveDiscounts(filtered);
  return true;
}
