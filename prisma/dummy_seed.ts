import 'dotenv/config';
import { prisma } from '../src/lib/db/prisma';

export async function seedDummyData() {
  console.log("Seeding Dummy System Data (Vendors, RFQs, Quotations, POs, Invoices)...");

  // Get the users we created in auth_dummy_seed
  const officer = await prisma.user.findUnique({ where: { email: 'officer@vendorbridge.io' } });
  const vendorUser1 = await prisma.user.findUnique({ where: { email: 'vendor@vendorbridge.io' } });
  const vendorUser2 = await prisma.user.findUnique({ where: { email: 'vendor2@vendorbridge.io' } });

  if (!officer || !vendorUser1 || !vendorUser2) {
    console.error("Please run auth_dummy_seed.ts first to create user accounts!");
    return;
  }

  // Clear existing records to prevent unique constraints or duplication issues
  console.log("Cleaning up existing dummy data...");
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  await prisma.approval.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.rFQVendor.deleteMany({});
  await prisma.rFQItem.deleteMany({});
  await prisma.rFQ.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});

  // 1. Create Vendors
  console.log("Creating Vendors...");
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'TechCorp Supplies',
      email: 'vendor@vendorbridge.io',
      category: 'Electronics',
      gstNumber: 'GSTIN123456789',
      status: 'ACTIVE',
      rating: 4.8,
      userId: vendorUser1.id,
    }
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Global Logistics Co.',
      email: 'vendor2@vendorbridge.io',
      category: 'Logistics',
      gstNumber: 'GST987654321B',
      status: 'ACTIVE',
      rating: 4.5,
      userId: vendorUser2.id,
    }
  });

  // 2. Create RFQ
  console.log("Creating RFQ...");
  const rfq = await prisma.rFQ.create({
    data: {
      rfqNumber: 'RFQ-2026-001',
      title: 'Bulk Office Electronics & Monitors',
      category: 'Electronics',
      description: 'Requesting quotations for 50 high-end office monitors and 20 docking stations.',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'PUBLISHED',
      createdById: officer.id,
      items: {
        create: [
          { name: '4K IPS Office Monitor 27"', quantity: 50, unit: 'NOS' },
          { name: 'USB-C Universal Docking Station', quantity: 20, unit: 'NOS' }
        ]
      },
      vendors: {
        create: [
          { vendorId: vendor1.id, status: 'SUBMITTED' },
          { vendorId: vendor2.id, status: 'INVITED' }
        ]
      }
    }
  });

  // 3. Create Quotation for TechCorp Supplies (vendor1)
  console.log("Creating Quotation...");
  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: 'QT-2026-901',
      rfqId: rfq.id,
      vendorId: vendor1.id,
      subtotal: 1250000.00,
      taxRate: 18.00,
      taxAmount: 225000.00,
      grandTotal: 1475000.00,
      deliveryDays: 5,
      paymentTerms: 'Net 30 days',
      notes: 'Includes 3 years warranty on all monitors.',
      status: 'SELECTED',
      items: {
        create: [
          { name: '4K IPS Office Monitor 27"', quantity: 50, unitPrice: 20000.00, total: 1000000.00 },
          { name: 'USB-C Universal Docking Station', quantity: 20, unitPrice: 12500.00, total: 250000.00 }
        ]
      }
    }
  });

  // 4. Create Approval Level L1
  console.log("Creating Approvals...");
  await prisma.approval.create({
    data: {
      rfqId: rfq.id,
      quotationId: quotation.id,
      vendorId: vendor1.id,
      level: 'L1',
      status: 'APPROVED',
      remarks: 'Price is competitive and technical specs match requirements.',
      approverId: officer.id,
      decidedAt: new Date(),
    }
  });

  // 5. Create Purchase Order
  console.log("Creating Purchase Order...");
  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber: 'PO-2026-0001',
      rfqId: rfq.id,
      quotationId: quotation.id,
      vendorId: vendor1.id,
      subtotal: 1250000.00,
      cgst: 112500.00,
      sgst: 112500.00,
      grandTotal: 1475000.00,
      status: 'ISSUED',
      createdById: officer.id,
      items: {
        create: [
          { name: '4K IPS Office Monitor 27"', quantity: 50, unitPrice: 20000.00, total: 1000000.00 },
          { name: 'USB-C Universal Docking Station', quantity: 20, unitPrice: 12500.00, total: 250000.00 }
        ]
      }
    }
  });

  // 6. Create Invoice
  console.log("Creating Invoice...");
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-501',
      purchaseOrderId: po.id,
      vendorId: vendor1.id,
      billToName: 'VendorBridge Head Office',
      billToAddress: '404 Innovation Hub, Tech City, Karnataka - 560001',
      billToGstin: '29AAACV1111A1Z1',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subtotal: 1250000.00,
      cgst: 112500.00,
      sgst: 112500.00,
      grandTotal: 1475000.00,
      status: 'PENDING_PAYMENT',
      items: {
        create: [
          { name: '4K IPS Office Monitor 27"', quantity: 50, unitPrice: 20000.00, total: 1000000.00 },
          { name: 'USB-C Universal Docking Station', quantity: 20, unitPrice: 12500.00, total: 250000.00 }
        ]
      }
    }
  });

  // 7. Create Activity Log & Notifications
  console.log("Creating Activity Logs and Notifications...");
  await prisma.activityLog.create({
    data: {
      type: 'PO',
      action: 'PO_ISSUED',
      description: `Purchase Order PO-2026-0001 issued to TechCorp Supplies for bulk monitors`,
      actorId: officer.id,
      actorName: officer.name,
    }
  });

  await prisma.notification.create({
    data: {
      userId: officer.id,
      type: 'SUCCESS',
      title: 'PO Issued Successfully',
      message: 'Purchase Order PO-2026-0001 has been issued to TechCorp Supplies.',
      read: false,
    }
  });

  console.log("Dummy System Data seeding complete!");
}

if (require.main === module) {
  seedDummyData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
