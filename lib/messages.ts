export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}
// เก็บใน memory ไปก่อน — Week 9 จะเปลี่ยนเป็น PostgreSQL + Prisma
const messages: ContactMessage[] = [];
export function addMessage(data: Omit<ContactMessage, 'id' | 'createdAt'>) {
    const item: ContactMessage = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...data,
    }
    messages.push(item);
    return item;
}
export function getMessages() {
    return messages;
}
//เพิ่มเติม
export function updateMessage(id: string, updates: Partial<ContactMessage>) { 
  const index = messages.findIndex((m) => m.id === id); 
  if (index === -1) return null; 
  messages[index] = { ...messages[index], ...updates }; 
  return messages[index]; 
} 
