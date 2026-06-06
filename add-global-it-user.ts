import 'dotenv/config';
import { prisma } from './src/lib/db/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const passwordHash = await bcrypt.hash("vendorbridge", 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'sales@globalit.io' },
    update: {},
    create: {
      email: 'sales@globalit.io',
      name: 'Global IT Solutions',
      passwordHash,
      role: 'VENDOR',
      status: 'ACTIVE',
    }
  });

  await prisma.vendor.update({
    where: { gstNumber: 'GSTIN333333333' },
    data: { userId: user.id }
  });

  console.log("Global IT User created!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
