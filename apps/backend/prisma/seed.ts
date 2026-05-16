import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@convertforge.app' },
    update: {},
    create: {
      email: 'admin@convertforge.app',
      name: 'Admin',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
      subscription: {
        create: {
          planId: 'enterprise',
          tier: 'ENTERPRISE',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          dailyConversionLimit: -1,
          maxFileSize: BigInt(5368709120),
          storageLimit: BigInt(50000000000),
          priority: 2,
          apiAccess: true,
        },
      },
    },
  });

  const demoPassword = await bcrypt.hash('demo123456', 12);

  await prisma.user.upsert({
    where: { email: 'demo@convertforge.app' },
    update: {},
    create: {
      email: 'demo@convertforge.app',
      name: 'Demo User',
      passwordHash: demoPassword,
      role: Role.USER,
      emailVerified: true,
      subscription: {
        create: {
          planId: 'free',
          tier: 'FREE',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          dailyConversionLimit: 10,
          maxFileSize: BigInt(104857600),
          storageLimit: BigInt(500000000),
          priority: 0,
        },
      },
    },
  });

  console.log(`Admin created: admin@convertforge.app / admin123456`);
  console.log(`Demo user created: demo@convertforge.app / demo123456`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
