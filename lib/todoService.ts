import * as TodoModel from './todos';
import { NotFoundError, ValidationError } from './errors';
import { Prisma } from '@prisma/client';

export async function createTodo(data: { title: string }) {
  if (!data.title || data.title.trim() === '') {
    throw new ValidationError('ชื่องานห้ามเป็นค่าว่าง');
  }
  try {
    return await TodoModel.addTodo(data);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ValidationError('ชื่องานนี้ถูกใช้แล้ว (ห้ามซ้ำ)');
    }
    throw err;
  }
}

export async function listTodos() {
  return await TodoModel.getTodos();
}

export async function getTodoById(id: string) {
  const todos = await TodoModel.getTodos(); // Fetch all and find (or you can create a findUnique in Model)
  const todo = todos.find((t) => t.id === id) ?? null;
  if (!todo) {
    throw new NotFoundError('ไม่พบงานนี้');
  }
  return todo;
}

export async function editTodo(id: string, updates: Partial<{ title: string; completed: boolean }>) {
  if (updates.title !== undefined && updates.title.trim() === '') {
    throw new ValidationError('ชื่องานห้ามเป็นค่าว่าง');
  }
  try {
    return await TodoModel.updateTodo(id, updates);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('ไม่พบงานนี้');
    }
    throw err;
  }
}

export async function removeTodo(id: string) {
  try {
    await TodoModel.deleteTodo(id);
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return false; // Controller expects false for not found
    }
    throw err;
  }
}
