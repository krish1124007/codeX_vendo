import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './src/lib/db/prisma';

async function main() {
  const passwordHash = await bcrypt.hash("vendorbridge", 10);
  
  // Then create a user with the VENDOR role
  const user = await prisma.user.upsert({
    where: { email: 'vendor@vendorbridge.io' },
    update: {},
    create: {
      email: 'vendor@vendorbridge.io',
      name: 'Vendor User',
      passwordHash,
      role: 'VENDOR',
      status: 'ACTIVE',
    }
  });

  // First, create or find a vendor record
  const vendor = await prisma.vendor.upsert({
    where: { gstNumber: 'GSTIN123456789' },
    update: {},
    create: {
      name: 'TechCorp Supplies',
      email: 'vendor@vendorbridge.io',
      category: 'Electronics',
      gstNumber: 'GSTIN123456789',
      status: 'ACTIVE',
      rating: 4.5,
      userId: user.id
    }
  });

  console.log("Vendor user created!");
  console.log("Email: vendor@vendorbridge.io");
  console.log("Password: vendorbridge");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
