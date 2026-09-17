import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  await prisma.todo.createMany({
    data: [
      { title: 'ซื้อของเข้าบ้าน' },
      { title: 'อ่านหนังสือเตรียมสอบ', completed: true },
      { title: 'ออกกำลังกาย 30 นาที' },
    ],
    skipDuplicates: true,
  });

  await prisma.message.createMany({
    data: [
      { name: 'Alice', email: 'a@tsu.ac.th', message: 'สวัสดี' },
      { name: 'Bob', email: 'b@tsu.ac.th', message: 'Hello' },
    ],
    skipDuplicates: true,
  });

  const hashed = await bcrypt.hash('1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tsu.ac.th' },
    update: {},
    create: { email: 'admin@tsu.ac.th', password: hashed },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
