import bcrypt from 'bcrypt';
import { getSessionUserId } from '@/lib/auth';
import { getUserById, updateUserPassword } from '@/lib/users';
import { changePasswordSchema } from '@/lib/schemas';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { UnauthorizedError, ValidationError, NotFoundError } from '@/lib/errors';
import { ZodError } from 'zod';

export const POST = withErrorHandling(async (request: Request) => {
  const sessionUserId = getSessionUserId(request);
  if (!sessionUserId) {
    throw new UnauthorizedError('กรุณาล็อกอินก่อนดำเนินการ');
  }

  const body = await request.json();

  let parsedData;
  try {
    parsedData = changePasswordSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ValidationError(err.issues[0].message);
    }
    throw err;
  }

  const user = await getUserById(sessionUserId);
  if (!user) {
    throw new NotFoundError('ไม่พบผู้ใช้ในระบบ');
  }

  const isPasswordValid = await bcrypt.compare(parsedData.oldPassword, user.password);
  if (!isPasswordValid) {
    throw new ValidationError('รหัสผ่านเดิมไม่ถูกต้อง');
  }

  const newHashedPassword = await bcrypt.hash(parsedData.newPassword, 10);
  await updateUserPassword(user.id, newHashedPassword);

  return Response.json({ ok: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
});
