import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './src/lib/db/prisma';

async function main() {
  const passwordHash = await bcrypt.hash("vendorbridge", 10);
  
  const vendor = await prisma.vendor.upsert({
    where: { gstNumber: 'GST987654321B' },
    update: {},
    create: {
      name: 'Global Logistics Co.',
      email: 'vendor2@vendorbridge.io',
      category: 'Logistics',
      gstNumber: 'GST987654321B',
      status: 'ACTIVE',
      rating: 4.5,
    }
  });

  const user = await prisma.user.upsert({
    where: { email: 'vendor2@vendorbridge.io' },
    update: {},
    create: {
      email: 'vendor2@vendorbridge.io',
      name: 'Global Logistics User',
      passwordHash,
      role: 'VENDOR',
    }
  });

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { userId: user.id }
  });

  console.log("Created second vendor user successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
