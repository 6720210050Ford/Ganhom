import fs from 'fs';
import path from 'path';

export interface OrderItem {
  id: string;
  customer: string;
  email: string;
  phone: string;
  product: string;
  itemsCount: number;
  total: number;
  status: 'paid' | 'shipping' | 'pending' | 'delivered' | 'cancelled';
  statusLabel: string;
  date: string;
  createdAt: string;
  paymentMethod: string;
  shippingAddress: string;
}

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

export function getOrders(): OrderItem[] {
  try {
    if (!fs.existsSync(ordersFilePath)) {
      fs.writeFileSync(ordersFilePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const content = fs.readFileSync(ordersFilePath, 'utf8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading orders.json:', err);
    return [];
  }
}

export function saveOrders(orders: OrderItem[]): void {
  try {
    const dir = path.dirname(ordersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving orders.json:', err);
    throw err;
  }
}

export function addOrder(orderData: Omit<OrderItem, 'id' | 'createdAt' | 'date'> & { date?: string }): OrderItem {
  const orders = getOrders();
  const nextNum = orders.length > 0
    ? Math.max(...orders.map((o) => parseInt(o.id.replace(/\D/g, '') || '9400', 10))) + 1
    : 9401;
  const newOrder: OrderItem = {
    ...orderData,
    id: `ORD-${nextNum}`,
    createdAt: new Date().toISOString(),
    date: orderData.date || 'เมื่อสักครู่',
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function updateOrderStatus(
  orderId: string,
  status: OrderItem['status'],
  statusLabel?: string
): OrderItem | null {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return null;

  const defaultLabels: Record<OrderItem['status'], string> = {
    paid: 'ชำระเงินแล้ว',
    shipping: 'กำลังจัดส่ง',
    pending: 'รอดำเนินการ',
    delivered: 'จัดส่งสำเร็จ',
    cancelled: 'ยกเลิกแล้ว',
  };

  orders[idx].status = status;
  orders[idx].statusLabel = statusLabel || defaultLabels[status] || status;
  saveOrders(orders);
  return orders[idx];
}

export function deleteOrder(orderId: string): boolean {
  const orders = getOrders();
  const filtered = orders.filter((o) => o.id !== orderId);
  if (filtered.length === orders.length) return false;
  saveOrders(filtered);
  return true;
}
