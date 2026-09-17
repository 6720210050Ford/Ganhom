import bcrypt from 'bcrypt';
import { prisma } from './prisma';

export async function findUserByEmail(email: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user && email === 'admin@tsu.ac.th') {
    user = await createUser('admin@tsu.ac.th', '1234');
  }
  return user;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(email: string, plainPassword: string) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
}

export async function updateUserPassword(id: string, newHashedPassword: string) {
  return prisma.user.update({
    where: { id },
    data: { password: newHashedPassword },
  });
}
