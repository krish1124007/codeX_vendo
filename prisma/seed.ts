import 'dotenv/config';
import { prisma } from '../src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding database...");
  const passwordHash = await bcrypt.hash("vendorbridge", 10);

  // Recreate default users
  const users = [
    { email: 'admin@vendorbridge.io', name: 'System Admin', role: 'ADMIN' as const },
    { email: 'officer@vendorbridge.io', name: 'Procurement Officer', role: 'PROCUREMENT_OFFICER' as const },
    { email: 'manager@vendorbridge.io', name: 'Approving Manager', role: 'MANAGER' as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role,
        status: 'ACTIVE',
      }
    });
  }

  // Vendors
  const vendorUser1 = await prisma.user.upsert({
    where: { email: 'vendor@vendorbridge.io' },
    update: {},
    create: {
      email: 'vendor@vendorbridge.io',
      name: 'Vendor One',
      passwordHash,
      role: 'VENDOR',
      status: 'ACTIVE',
    }
  });

  await prisma.vendor.upsert({
    where: { gstNumber: 'GSTIN111111111' },
    update: {},
    create: {
      name: 'TechCorp Supplies',
      email: 'vendor@vendorbridge.io',
      category: 'IT Hardware',
      gstNumber: 'GSTIN111111111',
      status: 'ACTIVE',
      rating: 4.5,
      userId: vendorUser1.id
    }
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'vendor2@vendorbridge.io' },
    update: {},
    create: {
      email: 'vendor2@vendorbridge.io',
      name: 'Vendor Two',
      passwordHash,
      role: 'VENDOR',
      status: 'ACTIVE',
    }
  });

  await prisma.vendor.upsert({
    where: { gstNumber: 'GSTIN222222222' },
    update: {},
    create: {
      name: 'Office Essentials Ltd',
      email: 'vendor2@vendorbridge.io',
      category: 'Furniture',
      gstNumber: 'GSTIN222222222',
      status: 'ACTIVE',
      rating: 4.8,
      userId: vendorUser2.id
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
