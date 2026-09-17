import { getCommentById, editComment, removeComment } from '@/lib/commentService';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { getSessionUserId } from '@/lib/auth';

export const GET = withErrorHandling(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const comment = await getCommentById(id);
  return Response.json({ comment });
});

export const PATCH = withErrorHandling(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const sessionUserId = getSessionUserId(request) ?? undefined;
  const updates = await request.json();
  const updated = await editComment(id, updates, sessionUserId);
  return Response.json({ ok: true, item: updated });
});

export const DELETE = withErrorHandling(async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const sessionUserId = getSessionUserId(request) ?? undefined;
  await removeComment(id, sessionUserId);
  return Response.json({ ok: true });
});
