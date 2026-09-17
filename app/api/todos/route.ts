import { createTodo, listTodos } from '@/lib/todoService';
import { withErrorHandling } from '@/lib/withErrorHandling';

export const GET = withErrorHandling(async (request: Request) => {
  const all = await listTodos();
  return Response.json({ todos: all });
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json();
  const saved = await createTodo(body);
  return Response.json({ ok: true, item: saved }, { status: 201 });
});
