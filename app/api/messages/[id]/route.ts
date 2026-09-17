import { getMessageById, editMessage, removeMessage } from '@/lib/messageService';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { getSessionUserId } from '@/lib/auth';

export const GET = withErrorHandling(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const message = await getMessageById(id);
  return Response.json({ message });
});

export const PATCH = withErrorHandling(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const sessionUserId = getSessionUserId(request) ?? undefined;
  const updates = await request.json();
  const updated = await editMessage(id, updates, sessionUserId);
  if (!updated) {
    return Response.json({ error: 'ไม่พบข้อความนี้' }, { status: 404 });
  }
  return Response.json({ ok: true, item: updated });
});

export const DELETE = withErrorHandling(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const sessionUserId = getSessionUserId(request) ?? undefined;
  const deleted = await removeMessage(id, sessionUserId);
  if (!deleted) {
    return Response.json({ error: 'ไม่พบข้อความนี้' }, { status: 404 });
  }
  return Response.json({ ok: true }, { status: 200 });
});
