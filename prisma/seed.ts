import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/db/prisma';

async function main() {
  const passwordHash = await bcrypt.hash("vendorbridge", 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@vendorbridge.io' },
    update: {},
    create: {
      email: 'admin@vendorbridge.io',
      name: 'Aarav Kapoor',
      passwordHash,
      role: 'ADMIN',
      phone: '+91 98200 10001',
      country: 'India',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'officer@vendorbridge.io' },
    update: {},
    create: {
      email: 'officer@vendorbridge.io',
      name: 'Procurement Officer',
      passwordHash,
      role: 'PROCUREMENT_OFFICER',
      phone: '+91 98200 10002',
      country: 'India',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'rahul@vendorbridge.io' },
    update: {},
    create: {
      email: 'rahul@vendorbridge.io',
      name: 'Rahul Mehta',
      passwordHash,
      role: 'MANAGER',
      phone: '+91 98200 10003',
      country: 'India',
      status: 'ACTIVE',
    },
  });

  await prisma.user.upsert({
    where: { email: 'priya@vendorbridge.io' },
    update: {},
    create: {
      email: 'priya@vendorbridge.io',
      name: 'Priya Shah',
      passwordHash,
      role: 'MANAGER',
      phone: '+91 98200 10004',
      country: 'India',
      status: 'ACTIVE',
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
