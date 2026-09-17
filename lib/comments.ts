import { prisma } from './prisma';

export async function addComment(data: { postId: string; author: string; text: string; authorId?: string }) {
  return prisma.comment.create({ data });
}

export async function getComments(postId?: string) {
  return prisma.comment.findMany({
    where: postId ? { postId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getCommentById(id: string) {
  return prisma.comment.findUnique({ where: { id } });
}

export async function updateComment(id: string, updates: { text?: string; reactions?: any }) {
  return prisma.comment.update({ where: { id }, data: updates });
}

export async function deleteComment(id: string) {
  return prisma.comment.delete({ where: { id } });
}
