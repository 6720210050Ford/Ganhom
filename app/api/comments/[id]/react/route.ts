import { reactToComment } from '@/lib/commentService';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const POST = withErrorHandling(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const { emoji } = await request.json();

  if (!emoji || typeof emoji !== 'string') {
    return Response.json({ error: 'กรุณาระบุ emoji' }, { status: 400 });
  }

  const updated = await reactToComment(id, emoji);
  return Response.json({ ok: true, item: updated });
});
