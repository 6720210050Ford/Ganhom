import * as CommentModel from './comments';
import { cleanRichText } from './sanitize';
import { commentSchema } from './schemas';
import { NotFoundError, ValidationError, ForbiddenError } from './errors';
import { ZodError } from 'zod';
import { getUserById } from './users';

export async function createComment(raw: unknown, sessionUserId?: string) {
  let parsed;
  try {
    parsed = commentSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ValidationError(err.issues[0].message);
    }
    throw err;
  }

  const safeText = cleanRichText(parsed.text);
  if (!safeText.trim()) {
    throw new ValidationError('คอมเมนต์ไม่มีเนื้อหาที่อนุญาต');
  }

  return await CommentModel.addComment({
    postId: String(parsed.postId),
    author: parsed.author,
    text: safeText,
    authorId: sessionUserId,
  });
}

export async function listComments(postId?: string) {
  return await CommentModel.getComments(postId ? String(postId) : undefined);
}

export async function getCommentById(id: string) {
  const comment = await CommentModel.getCommentById(id);
  if (!comment) {
    throw new NotFoundError('ไม่พบคอมเมนต์นี้');
  }
  return comment;
}

export async function editComment(id: string, updates: unknown, sessionUserId?: string) {
  const comment = await getCommentById(id);

  const currentUser = sessionUserId ? await getUserById(sessionUserId) : null;
  const isAdmin = currentUser?.email === 'admin@tsu.ac.th';
  const isOwner = Boolean(comment.authorId && comment.authorId === sessionUserId);

  if (comment.authorId && !isOwner && !isAdmin) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์แก้ไขความคิดเห็นนี้ มีเพียงผู้เขียนหรือแอดมินเท่านั้นที่แก้ไขได้');
  }

  let text: string | undefined;
  if (typeof updates === 'object' && updates !== null && 'text' in updates) {
    text = (updates as { text?: string }).text;
  }

  if (text !== undefined) {
    const safeText = cleanRichText(text);
    if (!safeText.trim()) {
      throw new ValidationError('เนื้อหาคอมเมนต์ห้ามเป็นค่าว่าง');
    }
    return await CommentModel.updateComment(id, { text: safeText });
  }

  return comment;
}

export async function removeComment(id: string, sessionUserId?: string) {
  const comment = await getCommentById(id);

  const currentUser = sessionUserId ? await getUserById(sessionUserId) : null;
  const isAdmin = currentUser?.email === 'admin@tsu.ac.th';
  const isOwner = Boolean(comment.authorId && comment.authorId === sessionUserId);

  if (comment.authorId && !isOwner && !isAdmin) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์ลบความคิดเห็นนี้ มีเพียงผู้เขียนหรือแอดมินเท่านั้นที่ลบได้');
  }

  await CommentModel.deleteComment(id);
  return true;
}

export async function reactToComment(id: string, emoji: string) {
  const comment = await getCommentById(id);
  const currentReactions: Record<string, number> = (comment.reactions as Record<string, number>) || {};
  const newCount = (currentReactions[emoji] || 0) + 1;
  const updatedReactions = { ...currentReactions, [emoji]: newCount };
  return await CommentModel.updateComment(id, { reactions: updatedReactions });
}
