import { describe, it, expect } from 'node:test';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { withErrorHandling } from './withErrorHandling.ts';

describe('withErrorHandling', () => {
  it('maps Prisma P2002 duplicate key error to 409 conflict', async () => {
    const handler = withErrorHandling(async () => {
      const err = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed on the fields: (`email`)',
        {
          code: 'P2002',
          clientVersion: 'test-version',
        }
      );
      throw err;
    });

    const response = await handler(new Request('http://localhost/test'), {});
    expect(response.status).toBe(409);

    const body = await response.json();
    expect(body.error).toMatch(/ซ้ำ|ถูกใช้แล้ว|ไม่สามารถ/);
  });

  it('maps SyntaxError to 400 Bad Request', async () => {
    const handler = withErrorHandling(async () => {
      throw new SyntaxError('Unexpected token in JSON');
    });

    const response = await handler(new Request('http://localhost/test'), {});
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toMatch(/JSON/);
  });

  it('maps ZodError to 400 Bad Request', async () => {
    const schema = z.object({ email: z.string().email('อีเมลไม่ถูกต้อง') });
    const handler = withErrorHandling(async () => {
      schema.parse({ email: 'invalid-email' });
      return new Response('ok');
    });

    const response = await handler(new Request('http://localhost/test'), {});
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('อีเมลไม่ถูกต้อง');
  });
});

