import { createComment, listComments } from '@/lib/commentService';
import { withErrorHandling } from '@/lib/withErrorHandling';
import { getSessionUserId } from '@/lib/auth';

export const GET = withErrorHandling(async (request: Request) => {
  const url = new URL(request.url);
  const postId = url.searchParams.get('postId') ?? undefined;
  const comments = await listComments(postId);
  return Response.json({ comments });
});

export const POST = withErrorHandling(async (request: Request) => {
  const sessionUserId = getSessionUserId(request) ?? undefined;
  const body = await request.json();
  const comment = await createComment(body, sessionUserId);
  return Response.json({ ok: true, item: comment }, { status: 201 });
});
