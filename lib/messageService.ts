import * as MessageModel from './messages';
import { NotFoundError, ValidationError, ForbiddenError } from './errors';
import { messageSchema } from './schemas';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export async function createMessage(raw: unknown, sessionUserId?: string) {
  let data;
  try {
    data = messageSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new ValidationError(err.issues[0].message);
    }
    throw err;
  }

  try {
    return await MessageModel.addMessage({
      ...data,
      authorId: sessionUserId,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ValidationError('อีเมลนี้ถูกใช้แล้ว กรุณาใช้อีเมลอื่น');
    }
    throw err;
  }
}

export async function listMessages(search?: string) {
  const all = await MessageModel.getMessages();
  if (!search) return all;
  return all.filter((m) =>
    m.name.includes(search) ||
    m.message.includes(search) ||
    (m.tag && m.tag.includes(search))
  );
}

export async function getMessageById(id: string) {
  const msg = await MessageModel.getMessageById(id);
  if (!msg) {
    throw new NotFoundError('ไม่พบข้อความนี้');
  }
  return msg;
}

export async function editMessage(id: string, updates: unknown, sessionUserId?: string) {
  const message = await getMessageById(id);

  if (message.authorId && message.authorId !== sessionUserId) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์แก้ไขข้อความนี้');
  }

  let text: string | undefined;
  if (typeof updates === 'object' && updates !== null && 'message' in updates) {
    text = (updates as { message?: string }).message;
  } else if (typeof updates === 'string') {
    text = updates;
  }

  if (text !== undefined && text.trim() === '') {
    throw new ValidationError('ข้อความห้ามเป็นค่าว่าง');
  }

  try {
    return await MessageModel.updateMessage(id, { message: text });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }
    throw err;
  }
}

export async function removeMessage(id: string, sessionUserId?: string) {
  const message = await getMessageById(id);

  if (message.authorId && message.authorId !== sessionUserId) {
    throw new ForbiddenError('คุณไม่มีสิทธิ์ลบข้อความนี้');
  }

  try {
    await MessageModel.deleteMessage(id);
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return false;
    }
    throw err;
  }
}