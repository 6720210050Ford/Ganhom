import fs from 'fs';
import path from 'path';

export interface Product {
  id: string;
  title: string;
  description: string;
  media: string[];
  category: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  chargeTax: boolean;
  trackQuantity: boolean;
  quantity: number;
  sku?: string;
  barcode?: string;
  continueSellingWhenOutOfStock?: boolean;
  requiresShipping: boolean;
  weight?: number;
  packageSize?: string;
  status: 'active' | 'draft';
  productType?: string;
  vendor?: string;
  collections?: string[];
  tags?: string[];
  themeTemplate?: string;
  seoTitle?: string;
  seoDescription?: string;
  handle: string;
  variants?: Array<{ id: string; name: string; values: string[] }>;
  createdAt: string;
  updatedAt: string;
}

const productsFilePath = path.join(process.cwd(), 'data', 'products.json');

export function getProducts(): Product[] {
  try {
    if (!fs.existsSync(productsFilePath)) {
      const dir = path.dirname(productsFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(productsFilePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const content = fs.readFileSync(productsFilePath, 'utf8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading products.json:', err);
    return [];
  }
}

export function saveProducts(products: Product[]): void {
  try {
    const dir = path.dirname(productsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving products.json:', err);
    throw err;
  }
}

export function getProductById(id: string): Product | null {
  const products = getProducts();
  return products.find((p) => p.id === id) || null;
}

export function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const products = getProducts();
  const nextNum = products.length > 0
    ? Math.max(...products.map((p) => parseInt(p.id.replace(/\D/g, '') || '1000', 10))) + 1
    : 1001;

  const handle = productData.handle || productData.title
    .toLowerCase()
    .replace(/[^\w\u0E00-\u0E7F]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const newProduct: Product = {
    ...productData,
    id: `PROD-${nextNum}`,
    handle,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  products[idx] = {
    ...products[idx],
    ...updates,
    id, // protect id
    updatedAt: new Date().toISOString(),
  };

  saveProducts(products);
  return products[idx];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveProducts(filtered);
  return true;
}
