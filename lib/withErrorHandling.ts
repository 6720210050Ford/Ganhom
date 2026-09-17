import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

type Handler<T = any> = (req: Request, ctx: T) => Promise<Response>;

function getPrismaErrorResponse(err: unknown) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return {
          status: 409,
          message: 'ข้อมูลซ้ำกับที่มีอยู่ในระบบ โปรดตรวจสอบข้อมูลอีกครั้ง',
        };
      case 'P2025':
        return {
          status: 404,
          message: 'ไม่พบข้อมูลที่ต้องการในระบบ',
        };
      case 'P2003':
        return {
          status: 400,
          message: 'ข้อมูลอ้างอิงไม่ถูกต้อง (Foreign key constraint failed)',
        };
      case 'P2000':
        return {
          status: 400,
          message: 'ข้อมูลที่ระบุยาวเกินกว่ากำหนด',
        };
      default:
        break;
    }
  }

  if (err instanceof ZodError) {
    return {
      status: 400,
      message: err.issues[0]?.message || 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
    };
  }

  if (err instanceof SyntaxError || (typeof err === 'object' && err !== null && (err as Error).name === 'SyntaxError')) {
    return {
      status: 400,
      message: 'รูปแบบข้อมูล JSON ไม่ถูกต้อง หรือ Request Body ว่างเปล่า',
    };
  }

  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = Number((err as { status?: number }).status ?? 500);
    if (status >= 400 && status < 600) {
      return {
        status,
        message: (err as { message?: string }).message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
      };
    }
  }

  return {
    status: 500,
    message: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
  };
}

export function withErrorHandling<T = any>(handler: Handler<T>): Handler<T> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      console.error('API Error:', err);
      const { status, message } = getPrismaErrorResponse(err);
      return Response.json({ error: message }, { status });
    }
  };
}

