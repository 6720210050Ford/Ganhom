import path from 'node:path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// โหลดค่าจากไฟล์ .env ก่อน
config();

export default defineConfig({
  // @ts-ignore
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    seed: 'npx tsx prisma/seed.ts',
  },
});
