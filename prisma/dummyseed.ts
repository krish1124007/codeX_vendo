import 'dotenv/config';
import { prisma } from '../src/lib/db/prisma';

async function main() {
  console.log("Generating linked dummy data...");

  const officer = await prisma.user.findUnique({ where: { email: 'officer@vendorbridge.io' } });
  const manager = await prisma.user.findUnique({ where: { email: 'manager@vendorbridge.io' } });

  if (!officer || !manager) {
    throw new Error("Base users missing. Did you run the base seed first?");
  }

  // 1. Create 3 extra vendors
  const v1 = await prisma.vendor.upsert({
    where: { gstNumber: 'GSTIN333333333' },
    update: {},
    create: {
      name: 'Global IT Solutions',
      email: 'sales@globalit.io',
      category: 'IT Hardware',
      gstNumber: 'GSTIN333333333',
      status: 'ACTIVE',
      rating: 4.2,
      createdById: officer.id,
    }
  });

  const v2 = await prisma.vendor.upsert({
    where: { gstNumber: 'GSTIN444444444' },
    update: {},
    create: {
      name: 'Premier Furnishings',
      email: 'orders@premierfurn.io',
      category: 'Furniture',
      gstNumber: 'GSTIN444444444',
      status: 'ACTIVE',
      rating: 4.9,
      createdById: officer.id,
    }
  });

  const v3 = await prisma.vendor.upsert({
    where: { gstNumber: 'GSTIN555555555' },
    update: {},
    create: {
      name: 'Alpha Logistics',
      email: 'freight@alphalogistics.io',
      category: 'Logistics',
      gstNumber: 'GSTIN555555555',
      status: 'ACTIVE',
      rating: 4.1,
      createdById: officer.id,
    }
  });

  const allVendors = await prisma.vendor.findMany();

  // 2. Create RFQs
  const rfqsData = [
    {
      title: "Q3 Laptops Refresh",
      category: "IT Hardware",
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: "PUBLISHED" as const,
      items: [
        { name: "MacBook Pro 16", quantity: 10, unit: "NOS" },
        { name: "Dell XPS 15", quantity: 5, unit: "NOS" }
      ]
    },
    {
      title: "New Office Chairs",
      category: "Furniture",
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: "CLOSED" as const, // We will award this
      items: [
        { name: "Ergonomic Mesh Chair", quantity: 50, unit: "NOS" },
        { name: "Standing Desk", quantity: 15, unit: "NOS" }
      ]
    },
    {
      title: "Annual Logistics Contract",
      category: "Logistics",
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // past
      status: "AWARDED" as const,
      items: [
        { name: "Monthly Freight Volume", quantity: 1, unit: "LUMP" }
      ]
    }
  ];

  for (let i = 0; i < rfqsData.length; i++) {
    const data = rfqsData[i];
    const rfqNumber = `RFQ-2026-${String(i + 101).padStart(3, '0')}`;
    
    // Upsert to prevent duplication
    let rfq = await prisma.rFQ.findUnique({ where: { rfqNumber } });
    
    if (!rfq) {
      rfq = await prisma.rFQ.create({
        data: {
          rfqNumber,
          title: data.title,
          category: data.category,
          deadline: data.deadline,
          status: data.status,
          createdById: officer.id,
          items: {
            create: data.items
          }
        },
        include: { items: true }
      });

      // Link suitable vendors
      const suitableVendors = allVendors.filter(v => v.category === data.category);
      for (const sv of suitableVendors) {
        await prisma.rFQVendor.create({
          data: {
            rfqId: rfq.id,
            vendorId: sv.id,
            status: 'INVITED'
          }
        });
      }

      // If Closed or Awarded, create Quotations
      if (rfq.status === 'CLOSED' || rfq.status === 'AWARDED') {
        for (const sv of suitableVendors) {
          // Generate quotation
          const qItems = data.items.map(it => {
            const price = Math.floor(Math.random() * 500) + 100;
            return {
              name: it.name,
              quantity: it.quantity,
              unitPrice: price,
              total: price * it.quantity
            };
          });

          const subtotal = qItems.reduce((acc, curr) => acc + curr.total, 0);
          const taxRate = 18;
          const taxAmount = (subtotal * taxRate) / 100;
          const grandTotal = subtotal + taxAmount;

          let quotation = await prisma.quotation.findUnique({
            where: {
              rfqId_vendorId: { rfqId: rfq.id, vendorId: sv.id }
            }
          });

          if (!quotation) {
            quotation = await prisma.quotation.create({
              data: {
                quotationNumber: `QT-${rfqNumber}-${sv.id.substring(4,10).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                rfqId: rfq.id,
                vendorId: sv.id,
                subtotal,
                taxRate,
                taxAmount,
                grandTotal,
                deliveryDays: 15,
                status: sv === suitableVendors[0] ? 'SELECTED' : 'REJECTED',
                items: {
                  create: qItems
                }
              },
              include: { items: true }
            });
          }

          // Create PO for selected quotation
          if (quotation.status === 'SELECTED') {
            const existingApproval = await prisma.approval.findFirst({
              where: { quotationId: quotation.id }
            });
            if (!existingApproval) {
              await prisma.approval.create({
                data: {
                  rfqId: rfq.id,
                  quotationId: quotation.id,
                  vendorId: sv.id,
                  level: 'L2',
                  status: 'APPROVED',
                  approverId: manager.id,
                  decidedAt: new Date()
                }
              });
            }

            const poNumber = `PO-${rfqNumber}`;
            let po = await prisma.purchaseOrder.findUnique({ where: { poNumber } });
            if (!po) {
              po = await prisma.purchaseOrder.create({
                data: {
                  poNumber,
                  rfqId: rfq.id,
                  quotationId: quotation.id,
                  vendorId: sv.id,
                  subtotal,
                  cgst: taxAmount / 2,
                  sgst: taxAmount / 2,
                  grandTotal,
                  status: 'ISSUED',
                  createdById: officer.id,
                  items: {
                    create: qItems.map(qi => ({
                      name: qi.name,
                      quantity: qi.quantity,
                      unitPrice: qi.unitPrice,
                      total: qi.total
                    }))
                  }
                }
              });
            }

            // Create Invoice
            const invoiceNumber = `INV-${po.poNumber}`;
            const existingInvoice = await prisma.invoice.findUnique({ where: { invoiceNumber } });
            if (!existingInvoice) {
              await prisma.invoice.create({
                data: {
                  invoiceNumber,
                  purchaseOrderId: po.id,
                  vendorId: sv.id,
                  billToName: "VendorBridge Corp",
                  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                  subtotal,
                  cgst: taxAmount / 2,
                  sgst: taxAmount / 2,
                  grandTotal,
                  status: rfq.status === 'AWARDED' ? 'PAID' : 'PENDING_PAYMENT',
                  items: {
                    create: qItems.map(qi => ({
                      name: qi.name,
                      quantity: qi.quantity,
                      unitPrice: qi.unitPrice,
                      total: qi.total
                    }))
                  }
                }
              });
            }
          }
        }
      }
    }
  }

  console.log("Dummy linked data seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
