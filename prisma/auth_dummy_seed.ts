import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/db/prisma';

export async function seedAuth() {
  console.log("Seeding Authentication & Users...");
  const passwordHash = await bcrypt.hash("vendorbridge", 10);
  
  const users = [
    {
      email: 'admin@vendorbridge.io',
      name: 'Aarav Kapoor',
      role: 'ADMIN',
      phone: '+91 98200 10001',
      country: 'India',
      status: 'ACTIVE',
    },
    {
      email: 'officer@vendorbridge.io',
      name: 'Procurement Officer',
      role: 'PROCUREMENT_OFFICER',
      phone: '+91 98200 10002',
      country: 'India',
      status: 'ACTIVE',
    },
    {
      email: 'rahul@vendorbridge.io',
      name: 'Rahul Mehta',
      role: 'MANAGER',
      phone: '+91 98200 10003',
      country: 'India',
      status: 'ACTIVE',
    },
    {
      email: 'priya@vendorbridge.io',
      name: 'Priya Shah',
      role: 'MANAGER',
      phone: '+91 98200 10004',
      country: 'India',
      status: 'ACTIVE',
    },
    {
      email: 'vendor@vendorbridge.io',
      name: 'Vendor User',
      role: 'VENDOR',
      phone: '+91 98200 10005',
      country: 'India',
      status: 'ACTIVE',
    },
    {
      email: 'vendor2@vendorbridge.io',
      name: 'Global Logistics User',
      role: 'VENDOR',
      phone: '+91 98200 10006',
      country: 'India',
      status: 'ACTIVE',
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        role: u.role as any,
        phone: u.phone,
        country: u.country,
        status: u.status,
      },
    });
  }

  console.log("Authentication & Users seeding complete!");
}

if (require.main === module) {
  seedAuth()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
