import { z } from 'zod';

export const messageSchema = z.object({
  name: z.string().min(2, 'ชื่อสั้นเกินไป').max(100),
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  message: z.string().min(5, 'ข้อความสั้นเกินไป').max(1000),
  tag: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'กรุณากรอกรหัสผ่านเดิม'),
  newPassword: z.string().min(8, 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
});

export const commentSchema = z.object({
  postId: z.string().min(1, 'กรุณาระบุ postId'),
  author: z.string().min(1, 'กรุณาระบุชื่อผู้เขียน'),
  text: z.string().min(1, 'ข้อความคอมเมนต์ห้ามเป็นค่าว่าง'),
});
