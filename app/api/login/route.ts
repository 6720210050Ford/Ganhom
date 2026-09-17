import bcrypt from 'bcrypt';
import { findUserByEmail } from '@/lib/users';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const POST = withErrorHandling(async (request: Request) => {
  const { email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  const isValid = user && (await bcrypt.compare(password, user.password));

  if (!isValid) {
    return Response.json({ error: 'อีเมล/รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const res = Response.json({ ok: true });
  res.headers.set('Set-Cookie', `session=${user.id}; Path=/; HttpOnly; SameSite=Lax`);
  return res;
});