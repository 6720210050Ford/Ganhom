import { prisma } from './prisma';

export async function addTodo(data: { title: string }) {
  return prisma.todo.create({ data });
}

export async function getTodos() {
  return prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function updateTodo(id: string, updates: { completed?: boolean; title?: string }) {
  return prisma.todo.update({ where: { id }, data: updates });
}

export async function deleteTodo(id: string) {
  return prisma.todo.delete({ where: { id } });
}
