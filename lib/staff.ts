import fs from 'fs';
import path from 'path';

export interface StaffItem {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'SUPPORT';
  roleLabel: string;
  status: 'Active' | 'Invited' | 'Suspended';
}

const staffFilePath = path.join(process.cwd(), 'data', 'staff.json');

export function getStaff(): StaffItem[] {
  try {
    if (!fs.existsSync(staffFilePath)) {
      fs.writeFileSync(staffFilePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const content = fs.readFileSync(staffFilePath, 'utf8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading staff.json:', err);
    return [];
  }
}

export function saveStaff(items: StaffItem[]): void {
  try {
    const dir = path.dirname(staffFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(staffFilePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving staff.json:', err);
    throw err;
  }
}

export function addStaff(data: Omit<StaffItem, 'id' | 'status'>): StaffItem {
  const list = getStaff();
  const roleLabels: Record<StaffItem['role'], string> = {
    OWNER: 'เจ้าของร้าน (OWNER / SUPERADMIN)',
    MANAGER: 'ผู้จัดการคำสั่งซื้อ (STORE MANAGER)',
    EDITOR: 'ฝ่ายเนื้อหาและแบนเนอร์ (EDITOR)',
    SUPPORT: 'ฝ่ายบริการลูกค้า (SUPPORT)',
  };

  const newItem: StaffItem = {
    ...data,
    id: `stf-${Date.now()}`,
    roleLabel: data.roleLabel || roleLabels[data.role] || data.role,
    status: 'Active',
  };
  list.push(newItem);
  saveStaff(list);
  return newItem;
}

export function deleteStaff(id: string): boolean {
  const list = getStaff();
  const filtered = list.filter((s) => s.id !== id);
  if (filtered.length === list.length) return false;
  saveStaff(filtered);
  return true;
}
