import { prisma } from "@/lib/db/prisma";
import { logActivity } from "@/services/activity";
import { createManyNotifications, createNotification } from "@/services/notifications";
import type {
  Approval,
  ApprovalStatus,
  Invoice,
  PurchaseOrder,
  Quotation,
  RFQ,
} from "@/types";

// Helper for padding counters not really needed with DB sequence but to preserve exact API, we use Date.now() for unique strings if needed, though UUIDs/CUIDs are standard. Prisma uses CUIDs by default in the schema.

// ── RFQ ──────────────────────────────────────────────────────────────────────

export async function listRFQs(): Promise<RFQ[]> {
  const rfqs = await prisma.rFQ.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, vendors: true },
  });
  return rfqs.map((rfq: any) => ({
    ...rfq,
    vendorIds: rfq.vendors?.map((v: any) => v.vendorId) || [],
  })) as unknown as RFQ[];
}

export async function getRFQ(id: string): Promise<RFQ | undefined> {
  const rfq = await prisma.rFQ.findUnique({
    where: { id },
    include: { items: true, vendors: true },
  });
  if (!rfq) return undefined;
  return {
    ...rfq,
    vendorIds: (rfq as any).vendors?.map((v: any) => v.vendorId) || [],
  } as unknown as RFQ;
}

export async function createRFQ(input: {
  title: string;
  category: string;
  description?: string;
  deadline: string;
  vendorIds: string[];
  items: { name: string; quantity: number; unit: string }[];
  attachments?: string[];
  publish: boolean;
  createdById: string;
  actorName?: string;
}): Promise<RFQ> {
  const rfqNumber = `RFQ-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
  
  const rfq = await prisma.rFQ.create({
    data: {
      rfqNumber,
      title: input.title,
      category: input.category,
      description: input.description,
      deadline: new Date(input.deadline),
      status: input.publish ? "PUBLISHED" : "DRAFT",
      attachments: input.attachments || [],
      createdById: input.createdById,
      items: {
        create: input.items.map(it => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
        })),
      },
      vendors: {
        create: input.vendorIds.map(vId => ({
          vendorId: vId,
          status: "INVITED"
        }))
      }
    },
    include: { items: true, vendors: true },
  });

  await logActivity({
    type: "RFQ",
    action: input.publish ? "RFQ published" : "RFQ drafted",
    description: input.publish
      ? `${rfq.title} sent to ${input.vendorIds.length} vendor${input.vendorIds.length === 1 ? "" : "s"}`
      : `${rfq.title} saved as draft`,
    entityType: "RFQ",
    entityId: rfq.id,
    actorId: input.createdById,
    actorName: input.actorName,
  });

  if (input.publish && input.vendorIds.length > 0) {
    const vendors = await prisma.vendor.findMany({
      where: { id: { in: input.vendorIds } },
      select: { userId: true },
    });
    const userIds = vendors.map(v => v.userId).filter(Boolean) as string[];
    if (userIds.length > 0) {
      await createManyNotifications({
        userIds,
        type: "INFO",
        title: "New RFQ Invitation",
        message: `You have been invited to submit a quotation for RFQ: ${input.title}`,
      });
    }
  }

  return rfq as unknown as RFQ;
}

// ── Quotations ───────────────────────────────────────────────────────────────

export async function getQuotationsForRFQ(rfqId: string): Promise<Quotation[]> {
  const quotations = await prisma.quotation.findMany({
    where: { rfqId },
    include: { items: true },
    orderBy: { grandTotal: "asc" },
  });
  return quotations as unknown as Quotation[];
}

export async function getQuotation(id: string): Promise<Quotation | undefined> {
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: true },
  });
  return quotation ? (quotation as unknown as Quotation) : undefined;
}

export async function getQuotationByRfqAndVendor(rfqId: string, vendorId: string): Promise<Quotation | undefined> {
  const quotation = await prisma.quotation.findUnique({
    where: { rfqId_vendorId: { rfqId, vendorId } },
    include: { items: true },
  });
  return quotation ? (quotation as unknown as Quotation) : undefined;
}

export async function listQuotations(): Promise<Quotation[]> {
  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  return quotations as unknown as Quotation[];
}

export async function createQuotation(input: {
  rfqId: string;
  vendorId: string;
  taxRate: number;
  deliveryDays: number;
  paymentTerms?: string;
  notes?: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  actorName?: string;
}): Promise<Quotation> {
  const items = input.items.map((it) => ({
    name: it.name,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    total: it.quantity * it.unitPrice,
  }));
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const taxAmount = Math.round((subtotal * input.taxRate) / 100);
  const grandTotal = subtotal + taxAmount;
  
  const quotationNumber = `QT-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber,
      rfqId: input.rfqId,
      vendorId: input.vendorId,
      subtotal,
      taxRate: input.taxRate,
      taxAmount,
      grandTotal,
      deliveryDays: input.deliveryDays,
      paymentTerms: input.paymentTerms,
      notes: input.notes,
      status: "SUBMITTED",
      items: {
        create: items,
      }
    },
    include: { items: true },
  });

  const vendor = await prisma.vendor.findUnique({ where: { id: input.vendorId } });
  
  await logActivity({
    type: "QUOTATION",
    action: "Quotation submitted",
    description: `${vendor?.name ?? "Vendor"} submitted ${quotation.quotationNumber}`,
    entityType: "QUOTATION",
    entityId: quotation.id,
    actorName: input.actorName ?? vendor?.name,
  });

  const rfq = await prisma.rFQ.findUnique({ where: { id: input.rfqId }, select: { title: true } });
  const internalUsers = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "PROCUREMENT_OFFICER"] } },
    select: { id: true },
  });
  const internalUserIds = internalUsers.map(u => u.id);

  if (internalUserIds.length > 0) {
    await createManyNotifications({
      userIds: internalUserIds,
      type: "INFO",
      title: "New Quotation Submitted",
      message: `${vendor?.name ?? "A vendor"} has submitted a quotation for RFQ: ${rfq?.title ?? "Unknown"}`,
    });
  }
  
  return quotation as unknown as Quotation;
}

export async function updateQuotation(id: string, input: {
  taxRate: number;
  deliveryDays: number;
  paymentTerms?: string;
  notes?: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  actorName?: string;
}): Promise<Quotation> {
  const items = input.items.map((it) => ({
    name: it.name,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    total: it.quantity * it.unitPrice,
  }));
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const taxAmount = Math.round((subtotal * input.taxRate) / 100);
  const grandTotal = subtotal + taxAmount;
  
  await prisma.quotationItem.deleteMany({
    where: { quotationId: id }
  });

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      subtotal,
      taxRate: input.taxRate,
      taxAmount,
      grandTotal,
      deliveryDays: input.deliveryDays,
      paymentTerms: input.paymentTerms,
      notes: input.notes,
      items: {
        create: items,
      }
    },
    include: { items: true },
  });

  const vendor = await prisma.vendor.findUnique({ where: { id: quotation.vendorId } });
  
  await logActivity({
    type: "QUOTATION",
    action: "Quotation updated",
    description: `${vendor?.name ?? "Vendor"} updated ${quotation.quotationNumber}`,
    entityType: "QUOTATION",
    entityId: quotation.id,
    actorName: input.actorName ?? vendor?.name,
  });
  
  return quotation as unknown as Quotation;
}

// ── Approvals ────────────────────────────────────────────────────────────────

export async function listApprovals(): Promise<Approval[]> {
  const approvals = await prisma.approval.findMany({
    orderBy: { createdAt: "desc" },
  });
  return approvals as unknown as Approval[];
}

export async function getApproval(id: string): Promise<Approval | undefined> {
  const approval = await prisma.approval.findUnique({ where: { id } });
  return approval ? (approval as unknown as Approval) : undefined;
}

export async function getApprovalsForRFQ(rfqId: string): Promise<Approval[]> {
  const approvals = await prisma.approval.findMany({
    where: { rfqId },
    orderBy: { level: "asc" },
  });
  return approvals as unknown as Approval[];
}

export async function selectQuotation(input: {
  quotationId: string;
  actorId: string;
  actorName?: string;
}): Promise<void> {
  const quotation = await prisma.quotation.findUnique({ where: { id: input.quotationId } });
  if (!quotation) throw new Error("Quotation not found");

  await prisma.quotation.updateMany({
    where: { rfqId: quotation.rfqId, id: { not: quotation.id } },
    data: { status: "REJECTED" },
  });
  
  await prisma.quotation.update({
    where: { id: quotation.id },
    data: { status: "SELECTED" },
  });

  await prisma.rFQ.update({
    where: { id: quotation.rfqId },
    data: { status: "CLOSED" },
  });

  const existingApprovals = await prisma.approval.findMany({
    where: { quotationId: quotation.id }
  });

  if (existingApprovals.length === 0) {
    await prisma.approval.createMany({
      data: [
        {
          rfqId: quotation.rfqId,
          quotationId: quotation.id,
          vendorId: quotation.vendorId,
          level: "L1",
          status: "PENDING",
        },
        {
          rfqId: quotation.rfqId,
          quotationId: quotation.id,
          vendorId: quotation.vendorId,
          level: "L2",
          status: "PENDING",
        }
      ]
    });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: quotation.vendorId } });
  const rfq = await prisma.rFQ.findUnique({ where: { id: quotation.rfqId } });
  
  await logActivity({
    type: "QUOTATION",
    action: "Quotation selected",
    description: `${vendor?.name ?? "Vendor"} selected for ${rfq?.title ?? "RFQ"}`,
    entityType: "RFQ",
    entityId: quotation.rfqId,
    actorId: input.actorId,
    actorName: input.actorName,
  });

  // Notifications for vendors
  if (vendor?.userId) {
    await createNotification({
      userId: vendor.userId,
      type: "SUCCESS",
      title: "Quotation Selected!",
      message: `Congratulations! Your quotation for RFQ: ${rfq?.title} has been selected.`,
    });
  }

  // Notify rejected vendors
  const rejectedQuotations = await prisma.quotation.findMany({
    where: { rfqId: quotation.rfqId, status: "REJECTED" },
    include: { vendor: true }
  });
  const rejectedUserIds = rejectedQuotations
    .map(q => q.vendor.userId)
    .filter(Boolean) as string[];

  if (rejectedUserIds.length > 0) {
    await createManyNotifications({
      userIds: rejectedUserIds,
      type: "INFO",
      title: "RFQ Closed",
      message: `Thank you for participating. Another vendor was selected for RFQ: ${rfq?.title}.`,
    });
  }
}

export async function decideApproval(input: {
  approvalId: string;
  decision: ApprovalStatus;
  remarks?: string;
  approverId: string;
  approverName?: string;
}): Promise<{ approval: Approval; purchaseOrder?: PurchaseOrder }> {
  let approval = await prisma.approval.update({
    where: { id: input.approvalId },
    data: {
      status: input.decision,
      remarks: input.remarks || undefined,
      approverId: input.approverId,
      decidedAt: new Date(),
    }
  });

  await logActivity({
    type: "APPROVAL",
    action: input.decision === "APPROVED" ? "Approval granted" : "Approval rejected",
    description: `${approval.level} ${input.decision.toLowerCase()} by ${input.approverName ?? "approver"}`,
    entityType: "APPROVAL",
    entityId: approval.id,
    actorId: input.approverId,
    actorName: input.approverName,
  });

  let purchaseOrder: PurchaseOrder | undefined;

  if (input.decision === "REJECTED") {
    await prisma.rFQ.update({
      where: { id: approval.rfqId },
      data: { status: "CANCELLED" }
    });
  }

  if (input.decision === "APPROVED" && approval.level === "L2") {
    const levels = await prisma.approval.findMany({
      where: { quotationId: approval.quotationId }
    });
    const allApproved = levels.every((a: any) => a.status === "APPROVED");
    if (allApproved) {
      purchaseOrder = await generatePurchaseOrder({
        quotationId: approval.quotationId,
        actorId: input.approverId,
        actorName: input.approverName,
      });
    }
  }

  return { 
    approval: approval as unknown as Approval, 
    purchaseOrder: purchaseOrder as unknown as PurchaseOrder 
  };
}

// ── Purchase Orders & Invoices ───────────────────────────────────────────────

export async function listPurchaseOrders(vendorId?: string): Promise<PurchaseOrder[]> {
  const where = vendorId ? { vendorId } : {};
  const pos = await prisma.purchaseOrder.findMany({
    where,
    orderBy: { poDate: "desc" },
    include: { items: true },
  });
  return pos as unknown as PurchaseOrder[];
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });
  return po ? (po as unknown as PurchaseOrder) : undefined;
}

export async function getInvoiceForPO(poId: string): Promise<Invoice | undefined> {
  const invoice = await prisma.invoice.findUnique({
    where: { purchaseOrderId: poId },
    include: { items: true },
  });
  return invoice ? (invoice as unknown as Invoice) : undefined;
}

export async function generatePurchaseOrder(input: {
  quotationId: string;
  actorId?: string;
  actorName?: string;
}): Promise<PurchaseOrder> {
  const existing = await prisma.purchaseOrder.findUnique({
    where: { quotationId: input.quotationId },
    include: { items: true },
  });
  if (existing) return existing as unknown as PurchaseOrder;

  const quotation = await prisma.quotation.findUnique({
    where: { id: input.quotationId },
    include: { items: true }
  });
  if (!quotation) throw new Error("Quotation not found");

  const vendor = await prisma.vendor.findUnique({ where: { id: quotation.vendorId } });
  const gstHalf = Math.round(Number(quotation.taxAmount) / 2);
  const poNumber = `PO-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      rfqId: quotation.rfqId,
      quotationId: quotation.id,
      vendorId: quotation.vendorId,
      subtotal: quotation.subtotal,
      cgst: gstHalf,
      sgst: Number(quotation.taxAmount) - gstHalf,
      grandTotal: quotation.grandTotal,
      status: "ISSUED",
      createdById: input.actorId,
      items: {
        create: quotation.items.map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        }))
      }
    },
    include: { items: true }
  });

  await prisma.rFQ.update({
    where: { id: quotation.rfqId },
    data: { status: "AWARDED" }
  });

  const due = new Date();
  due.setDate(due.getDate() + 30);
  const invoiceNumber = `INV-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  await prisma.invoice.create({
    data: {
      invoiceNumber,
      purchaseOrderId: po.id,
      vendorId: po.vendorId,
      billToName: "Your Organization Name",
      billToAddress: "123 Business Park, Ahmedabad",
      billToGstin: "25383438AFB",
      dueDate: due,
      subtotal: po.subtotal,
      cgst: po.cgst,
      sgst: po.sgst,
      grandTotal: po.grandTotal,
      status: "PENDING_PAYMENT",
      items: {
        create: quotation.items.map((it: any) => ({
          name: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.total,
        }))
      }
    }
  });

  await logActivity({
    type: "PO",
    action: "Purchase order generated",
    description: `${po.poNumber} issued to ${vendor?.name ?? "vendor"}`,
    entityType: "PO",
    entityId: po.id,
    actorId: input.actorId,
    actorName: input.actorName,
  });
  return po as unknown as PurchaseOrder;
}

export async function listInvoices(vendorId?: string): Promise<Invoice[]> {
  const where = vendorId ? { vendorId } : {};
  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { invoiceDate: "desc" },
    include: { items: true },
  });
  return invoices as unknown as Invoice[];
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
  return invoice ? (invoice as unknown as Invoice) : undefined;
}

export async function markInvoicePaid(input: {
  invoiceId: string;
  actorId?: string;
  actorName?: string;
}): Promise<Invoice> {
  const invoice = await prisma.invoice.update({
    where: { id: input.invoiceId },
    data: { status: "PAID" },
    include: { items: true },
  });

  await prisma.purchaseOrder.update({
    where: { id: invoice.purchaseOrderId },
    data: { status: "COMPLETED" },
  });

  await logActivity({
    type: "INVOICE",
    action: "Invoice paid",
    description: `${invoice.invoiceNumber} marked as paid`,
    entityType: "INVOICE",
    entityId: invoice.id,
    actorId: input.actorId,
    actorName: input.actorName,
  });
  return invoice as unknown as Invoice;
}
