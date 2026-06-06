import { db, genId, nextNumber, nowISO } from "@/lib/db/store";
import { logActivity } from "@/services/activity";
import type {
  Approval,
  ApprovalStatus,
  Invoice,
  PurchaseOrder,
  Quotation,
  RFQ,
} from "@/types";

// ── RFQ ──────────────────────────────────────────────────────────────────────

export async function listRFQs(): Promise<RFQ[]> {
  return [...db.rfqs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRFQ(id: string): Promise<RFQ | undefined> {
  return db.rfqs.find((r) => r.id === id);
}

export async function createRFQ(input: {
  title: string;
  category: string;
  description?: string;
  deadline: string;
  vendorIds: string[];
  items: { name: string; quantity: number; unit: string }[];
  publish: boolean;
  createdById: string;
  actorName?: string;
}): Promise<RFQ> {
  const now = nowISO();
  const rfq: RFQ = {
    id: genId("rfq"),
    rfqNumber: nextNumber("rfq", "RFQ-2025"),
    title: input.title,
    category: input.category,
    description: input.description,
    deadline: input.deadline,
    attachments: [],
    status: input.publish ? "PUBLISHED" : "DRAFT",
    createdById: input.createdById,
    vendorIds: input.vendorIds,
    items: input.items.map((it) => ({ id: genId("ri"), ...it })),
    createdAt: now,
    updatedAt: now,
  };
  db.rfqs.unshift(rfq);

  await logActivity({
    type: "RFQ",
    action: input.publish ? "RFQ published" : "RFQ drafted",
    description: input.publish
      ? `${rfq.title} sent to ${rfq.vendorIds.length} vendor${rfq.vendorIds.length === 1 ? "" : "s"}`
      : `${rfq.title} saved as draft`,
    entityType: "RFQ",
    entityId: rfq.id,
    actorId: input.createdById,
    actorName: input.actorName,
  });
  return rfq;
}

// ── Quotations ───────────────────────────────────────────────────────────────

export async function getQuotationsForRFQ(rfqId: string): Promise<Quotation[]> {
  return db.quotations
    .filter((q) => q.rfqId === rfqId)
    .sort((a, b) => a.grandTotal - b.grandTotal);
}

export async function getQuotation(id: string): Promise<Quotation | undefined> {
  return db.quotations.find((q) => q.id === id);
}

export async function listQuotations(): Promise<Quotation[]> {
  return [...db.quotations].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
  const now = nowISO();
  const items = input.items.map((it) => ({
    id: genId("qi"),
    name: it.name,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    total: it.quantity * it.unitPrice,
  }));
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const taxAmount = Math.round((subtotal * input.taxRate) / 100);
  const quotation: Quotation = {
    id: genId("q"),
    quotationNumber: nextNumber("quotation", "QT-2025"),
    rfqId: input.rfqId,
    vendorId: input.vendorId,
    subtotal,
    taxRate: input.taxRate,
    taxAmount,
    grandTotal: subtotal + taxAmount,
    deliveryDays: input.deliveryDays,
    paymentTerms: input.paymentTerms,
    notes: input.notes,
    status: "SUBMITTED",
    items,
    createdAt: now,
    updatedAt: now,
  };
  db.quotations.push(quotation);

  const vendor = db.vendors.find((v) => v.id === input.vendorId);
  await logActivity({
    type: "QUOTATION",
    action: "Quotation submitted",
    description: `${vendor?.name ?? "Vendor"} submitted ${quotation.quotationNumber}`,
    entityType: "QUOTATION",
    entityId: quotation.id,
    actorName: input.actorName ?? vendor?.name,
  });
  return quotation;
}

// ── Approvals ────────────────────────────────────────────────────────────────

export async function listApprovals(): Promise<Approval[]> {
  return [...db.approvals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getApproval(id: string): Promise<Approval | undefined> {
  return db.approvals.find((a) => a.id === id);
}

export async function getApprovalsForRFQ(rfqId: string): Promise<Approval[]> {
  return db.approvals
    .filter((a) => a.rfqId === rfqId)
    .sort((a, b) => (a.level > b.level ? 1 : -1));
}

/**
 * Start the approval workflow for a selected quotation: marks the quotation
 * SELECTED, others REJECTED, and creates pending L1/L2 approvals.
 */
export async function selectQuotation(input: {
  quotationId: string;
  actorId: string;
  actorName?: string;
}): Promise<void> {
  const quotation = db.quotations.find((q) => q.id === input.quotationId);
  if (!quotation) throw new Error("Quotation not found");

  for (const q of db.quotations.filter((q) => q.rfqId === quotation.rfqId)) {
    q.status = q.id === quotation.id ? "SELECTED" : "REJECTED";
    q.updatedAt = nowISO();
  }

  const rfq = db.rfqs.find((r) => r.id === quotation.rfqId);
  if (rfq) {
    rfq.status = "CLOSED";
    rfq.updatedAt = nowISO();
  }

  // Only create approvals if none exist yet for this quotation.
  if (!db.approvals.some((a) => a.quotationId === quotation.id)) {
    const now = nowISO();
    db.approvals.push(
      {
        id: genId("ap"),
        rfqId: quotation.rfqId,
        quotationId: quotation.id,
        vendorId: quotation.vendorId,
        level: "L1",
        status: "PENDING",
        approverName: "Rahul Mehta",
        approverRole: "Procurement Head",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: genId("ap"),
        rfqId: quotation.rfqId,
        quotationId: quotation.id,
        vendorId: quotation.vendorId,
        level: "L2",
        status: "PENDING",
        approverName: "Priya Shah",
        approverRole: "Finance Manager",
        createdAt: now,
        updatedAt: now,
      },
    );
  }

  const vendor = db.vendors.find((v) => v.id === quotation.vendorId);
  await logActivity({
    type: "QUOTATION",
    action: "Quotation selected",
    description: `${vendor?.name ?? "Vendor"} selected for ${rfq?.title ?? "RFQ"}`,
    entityType: "RFQ",
    entityId: quotation.rfqId,
    actorId: input.actorId,
    actorName: input.actorName,
  });
}

/**
 * Record an approval decision. Approving the final (L2) level awards the RFQ
 * and auto-generates the Purchase Order + Invoice.
 */
export async function decideApproval(input: {
  approvalId: string;
  decision: ApprovalStatus;
  remarks?: string;
  approverId: string;
  approverName?: string;
}): Promise<{ approval: Approval; purchaseOrder?: PurchaseOrder }> {
  const approval = db.approvals.find((a) => a.id === input.approvalId);
  if (!approval) throw new Error("Approval not found");

  approval.status = input.decision;
  approval.remarks = input.remarks ?? approval.remarks;
  approval.approverId = input.approverId;
  if (input.approverName) approval.approverName = input.approverName;
  approval.decidedAt = nowISO();
  approval.updatedAt = nowISO();

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
    const rfq = db.rfqs.find((r) => r.id === approval.rfqId);
    if (rfq) rfq.status = "CANCELLED";
  }

  // Final approval (L2 approved) and all levels approved → award + generate PO.
  if (input.decision === "APPROVED" && approval.level === "L2") {
    const levels = db.approvals.filter((a) => a.quotationId === approval.quotationId);
    const allApproved = levels.every((a) => a.status === "APPROVED");
    if (allApproved) {
      purchaseOrder = await generatePurchaseOrder({
        quotationId: approval.quotationId,
        actorId: input.approverId,
        actorName: input.approverName,
      });
    }
  }

  return { approval, purchaseOrder };
}

// ── Purchase Orders & Invoices ───────────────────────────────────────────────

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  return [...db.purchaseOrders].sort((a, b) => b.poDate.localeCompare(a.poDate));
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
  return db.purchaseOrders.find((p) => p.id === id);
}

export async function getInvoiceForPO(poId: string): Promise<Invoice | undefined> {
  return db.invoices.find((i) => i.purchaseOrderId === poId);
}

/** Generate a PO + Invoice from an approved quotation. Idempotent per quotation. */
export async function generatePurchaseOrder(input: {
  quotationId: string;
  actorId?: string;
  actorName?: string;
}): Promise<PurchaseOrder> {
  const existing = db.purchaseOrders.find((p) => p.quotationId === input.quotationId);
  if (existing) return existing;

  const quotation = db.quotations.find((q) => q.id === input.quotationId);
  if (!quotation) throw new Error("Quotation not found");
  const rfq = db.rfqs.find((r) => r.id === quotation.rfqId);
  const vendor = db.vendors.find((v) => v.id === quotation.vendorId);

  const now = nowISO();
  const gstHalf = Math.round(quotation.taxAmount / 2);
  const items = quotation.items.map((it) => ({
    id: genId("pl"),
    name: it.name,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    total: it.total,
  }));

  const po: PurchaseOrder = {
    id: genId("po"),
    poNumber: nextNumber("po", "PO-2025"),
    rfqId: quotation.rfqId,
    quotationId: quotation.id,
    vendorId: quotation.vendorId,
    subtotal: quotation.subtotal,
    cgst: gstHalf,
    sgst: quotation.taxAmount - gstHalf,
    grandTotal: quotation.grandTotal,
    poDate: now,
    status: "ISSUED",
    createdById: input.actorId,
    items,
    createdAt: now,
    updatedAt: now,
  };
  db.purchaseOrders.unshift(po);

  if (rfq) {
    rfq.status = "AWARDED";
    rfq.updatedAt = now;
  }

  // Auto-generate invoice (due in 30 days).
  const due = new Date(now);
  due.setDate(due.getDate() + 30);
  const invoice: Invoice = {
    id: genId("inv"),
    invoiceNumber: nextNumber("invoice", "INV-2025"),
    purchaseOrderId: po.id,
    vendorId: po.vendorId,
    billToName: "Your Organization Name",
    billToAddress: "123 Business Park, Ahmedabad",
    billToGstin: "25383438AFB",
    invoiceDate: now,
    dueDate: due.toISOString(),
    subtotal: po.subtotal,
    cgst: po.cgst,
    sgst: po.sgst,
    grandTotal: po.grandTotal,
    status: "PENDING_PAYMENT",
    items: items.map((it) => ({ ...it, id: genId("il") })),
    createdAt: now,
    updatedAt: now,
  };
  db.invoices.unshift(invoice);

  await logActivity({
    type: "PO",
    action: "Purchase order generated",
    description: `${po.poNumber} issued to ${vendor?.name ?? "vendor"} (auto-generated after approval)`,
    entityType: "PO",
    entityId: po.id,
    actorId: input.actorId,
    actorName: input.actorName,
  });
  return po;
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export async function listInvoices(): Promise<Invoice[]> {
  return [...db.invoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  return db.invoices.find((i) => i.id === id);
}

export async function markInvoicePaid(input: {
  invoiceId: string;
  actorId?: string;
  actorName?: string;
}): Promise<Invoice> {
  const invoice = db.invoices.find((i) => i.id === input.invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  invoice.status = "PAID";
  invoice.updatedAt = nowISO();

  const po = db.purchaseOrders.find((p) => p.id === invoice.purchaseOrderId);
  if (po) po.status = "COMPLETED";

  await logActivity({
    type: "INVOICE",
    action: "Invoice paid",
    description: `${invoice.invoiceNumber} marked as paid`,
    entityType: "INVOICE",
    entityId: invoice.id,
    actorId: input.actorId,
    actorName: input.actorName,
  });
  return invoice;
}
