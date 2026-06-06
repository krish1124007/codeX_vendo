// Domain types for VendorBridge. These mirror prisma/schema.prisma, with money
// represented as `number` (the in-memory store uses plain numbers; a live
// Prisma layer would map these to Decimal). Dates are ISO strings for easy
// serialization across the server/client boundary.

export type Role = "ADMIN" | "PROCUREMENT_OFFICER" | "MANAGER" | "VENDOR";

export type VendorStatus = "ACTIVE" | "PENDING" | "BLOCKED";

export type RFQStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CLOSED"
  | "AWARDED"
  | "CANCELLED";

export type RFQVendorStatus = "INVITED" | "SUBMITTED" | "DECLINED";

export type QuotationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SELECTED"
  | "REJECTED";

export type ApprovalLevel = "L1" | "L2";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type POStatus =
  | "DRAFT"
  | "ISSUED"
  | "ACKNOWLEDGED"
  | "COMPLETED"
  | "CANCELLED";

export type InvoiceStatus = "DRAFT" | "PENDING_PAYMENT" | "PAID" | "OVERDUE";

export type ActivityType =
  | "AUTH"
  | "VENDOR"
  | "RFQ"
  | "QUOTATION"
  | "APPROVAL"
  | "PO"
  | "INVOICE";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  country?: string;
  avatarUrl?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  gstNumber: string;
  category: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  rating: number;
  status: VendorStatus;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFQItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  category: string;
  description?: string;
  deadline: string;
  attachments: string[];
  status: RFQStatus;
  createdById: string;
  vendorIds: string[];
  items: RFQItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  rfqId: string;
  vendorId: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  deliveryDays: number;
  paymentTerms?: string;
  notes?: string;
  status: QuotationStatus;
  items: QuotationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  level: ApprovalLevel;
  status: ApprovalStatus;
  remarks?: string;
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId?: string;
  quotationId?: string;
  vendorId: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  poDate: string;
  status: POStatus;
  createdById?: string;
  items: LineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId: string;
  vendorId: string;
  billToName: string;
  billToAddress?: string;
  billToGstin?: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: InvoiceStatus;
  items: LineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  entityType?: string;
  entityId?: string;
  actorId?: string;
  actorName?: string;
  createdAt: string;
}
