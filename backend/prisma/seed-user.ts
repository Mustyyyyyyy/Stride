import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@stride.app';
  const password = 'demo123';
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      fullName: 'Demo Runner',
      weight: 70,
      height: 175,
      gender: 'PREFER_NOT_TO_SAY',
      unitSystem: 'METRIC',
      theme: 'DARK',
    },
  });

  console.log('✓ Seeded demo user:', user.email);
  console.log('  Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
