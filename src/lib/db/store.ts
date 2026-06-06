import type {
  ActivityLog,
  Approval,
  Invoice,
  PurchaseOrder,
  Quotation,
  RFQ,
  User,
  Vendor,
} from "@/types";

/**
 * In-memory data layer for VendorBridge.
 *
 * This stands in for the Prisma/Postgres layer described in prisma/schema.prisma.
 * It is intentionally shaped like a database: each collection is an array of
 * records and all access goes through async accessor functions, so replacing
 * this file with real Prisma queries is a mechanical change.
 *
 * The store is cached on `globalThis` so mutations survive Next.js dev HMR
 * recompiles within a single server process.
 */

export interface DBShape {
  users: User[];
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  approvals: Approval[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  activity: ActivityLog[];
  counters: Record<string, number>;
}

const T = (iso: string) => new Date(iso).toISOString();

function seed(): DBShape {
  const users: User[] = [
    {
      id: "u_admin",
      email: "admin@vendorbridge.io",
      name: "Aarav Kapoor",
      role: "ADMIN",
      phone: "+91 98200 10001",
      country: "India",
      status: "ACTIVE",
      createdAt: T("2025-01-02T09:00:00Z"),
      updatedAt: T("2025-01-02T09:00:00Z"),
    },
    {
      id: "u_officer",
      email: "officer@vendorbridge.io",
      name: "Procurement Officer",
      role: "PROCUREMENT_OFFICER",
      phone: "+91 98200 10002",
      country: "India",
      status: "ACTIVE",
      createdAt: T("2025-01-03T09:00:00Z"),
      updatedAt: T("2025-01-03T09:00:00Z"),
    },
    {
      id: "u_rahul",
      email: "rahul@vendorbridge.io",
      name: "Rahul Mehta",
      role: "MANAGER",
      phone: "+91 98200 10003",
      country: "India",
      status: "ACTIVE",
      createdAt: T("2025-01-03T09:00:00Z"),
      updatedAt: T("2025-01-03T09:00:00Z"),
    },
    {
      id: "u_priya",
      email: "priya@vendorbridge.io",
      name: "Priya Shah",
      role: "MANAGER",
      phone: "+91 98200 10004",
      country: "India",
      status: "ACTIVE",
      createdAt: T("2025-01-03T09:00:00Z"),
      updatedAt: T("2025-01-03T09:00:00Z"),
    },
  ];

  const vendors: Vendor[] = [
    {
      id: "v_infra",
      name: "Infra Supplies Pvt Ltd",
      gstNumber: "27AABCS1429B2D",
      category: "Construction",
      email: "sales@infrasupplies.in",
      contactNumber: "+91 90000 11111",
      address: "456, Industrial Estate, Surat",
      city: "Surat",
      rating: 4.5,
      status: "ACTIVE",
      createdById: "u_officer",
      createdAt: T("2025-02-10T09:00:00Z"),
      updatedAt: T("2025-02-10T09:00:00Z"),
    },
    {
      id: "v_techcore",
      name: "TechCore Ltd",
      gstNumber: "27AABCT5621C1Z",
      category: "IT Hardware",
      email: "orders@techcore.com",
      contactNumber: "+91 90000 22222",
      address: "12, Cyber Towers, Bengaluru",
      city: "Bengaluru",
      rating: 4.2,
      status: "ACTIVE",
      createdById: "u_officer",
      createdAt: T("2025-02-12T09:00:00Z"),
      updatedAt: T("2025-02-12T09:00:00Z"),
    },
    {
      id: "v_officemead",
      name: "Office Mead Co.",
      gstNumber: "24AAACO9981F1Z",
      category: "Furniture",
      email: "hello@officemead.co",
      contactNumber: "+91 90000 33333",
      address: "88, Business Park, Ahmedabad",
      city: "Ahmedabad",
      rating: 3.8,
      status: "ACTIVE",
      createdById: "u_officer",
      createdAt: T("2025-02-14T09:00:00Z"),
      updatedAt: T("2025-02-14T09:00:00Z"),
    },
    {
      id: "v_fastlog",
      name: "FastLog Transport",
      gstNumber: "27AABCF1010K1Z",
      category: "Logistics",
      email: "ops@fastlog.in",
      contactNumber: "+91 90000 44444",
      address: "5, Transport Nagar, Mumbai",
      city: "Mumbai",
      rating: 3.5,
      status: "BLOCKED",
      createdById: "u_officer",
      createdAt: T("2025-05-18T09:00:00Z"),
      updatedAt: T("2025-05-18T09:00:00Z"),
    },
    {
      id: "v_stationhub",
      name: "StationHub Supplies",
      gstNumber: "27AABCS7777P1Z",
      category: "Stationery",
      email: "sales@stationhub.in",
      contactNumber: "+91 90000 55555",
      address: "21, Market Road, Pune",
      city: "Pune",
      rating: 4.0,
      status: "ACTIVE",
      createdById: "u_officer",
      createdAt: T("2025-03-01T09:00:00Z"),
      updatedAt: T("2025-03-01T09:00:00Z"),
    },
    {
      id: "v_buildwell",
      name: "BuildWell Materials",
      gstNumber: "27AABCB3333Q1Z",
      category: "Construction",
      email: "contact@buildwell.in",
      contactNumber: "+91 90000 66666",
      address: "9, Sector 4, Noida",
      city: "Noida",
      rating: 0,
      status: "PENDING",
      createdById: "u_officer",
      createdAt: T("2025-05-29T09:00:00Z"),
      updatedAt: T("2025-05-29T09:00:00Z"),
    },
  ];

  // ── The seeded Q2 furniture procurement flow (matches the wireframes) ──────
  const rfqs: RFQ[] = [
    {
      id: "rfq_q2",
      rfqNumber: "RFQ-2025-0042",
      title: "Office Furniture Procurement Q2",
      category: "Furniture",
      description: "Ergonomic chairs and standing desks for 3rd floor.",
      deadline: T("2025-06-15T18:00:00Z"),
      attachments: [],
      status: "CLOSED",
      createdById: "u_officer",
      vendorIds: ["v_infra", "v_techcore", "v_officemead"],
      items: [
        { id: "ri_1", name: "Ergonomic chair", quantity: 25, unit: "NOS" },
        { id: "ri_2", name: "Standing desk", quantity: 10, unit: "NOS" },
      ],
      createdAt: T("2025-05-19T09:15:00Z"),
      updatedAt: T("2025-05-23T09:15:00Z"),
    },
    {
      id: "rfq_it",
      rfqNumber: "RFQ-2025-0040",
      title: "IT Hardware Refresh",
      category: "IT Hardware",
      description: "Laptops and docking stations for the engineering team.",
      deadline: T("2025-06-20T18:00:00Z"),
      attachments: [],
      status: "PUBLISHED",
      createdById: "u_officer",
      vendorIds: ["v_techcore"],
      items: [
        { id: "ri_3", name: "Laptop 14\"", quantity: 12, unit: "NOS" },
        { id: "ri_4", name: "Docking station", quantity: 12, unit: "NOS" },
      ],
      createdAt: T("2025-05-12T09:00:00Z"),
      updatedAt: T("2025-05-12T09:00:00Z"),
    },
  ];

  const quotations: Quotation[] = [
    {
      id: "q_infra",
      quotationNumber: "QT-2025-0101",
      rfqId: "rfq_q2",
      vendorId: "v_infra",
      subtotal: 155500,
      taxRate: 18,
      taxAmount: 27990,
      grandTotal: 183490,
      deliveryDays: 10,
      paymentTerms: "30 days net",
      notes: "Includes installation and 1-year warranty.",
      status: "UNDER_REVIEW",
      items: [
        { id: "qi_1", name: "Ergonomic chair", quantity: 25, unitPrice: 3500, total: 87500 },
        { id: "qi_2", name: "Standing desk", quantity: 10, unitPrice: 6800, total: 68000 },
      ],
      createdAt: T("2025-05-21T10:00:00Z"),
      updatedAt: T("2025-05-21T10:00:00Z"),
    },
    {
      id: "q_techcore",
      quotationNumber: "QT-2025-0102",
      rfqId: "rfq_q2",
      vendorId: "v_techcore",
      subtotal: 169500,
      taxRate: 18,
      taxAmount: 30510,
      grandTotal: 200010,
      deliveryDays: 14,
      paymentTerms: "30 days net",
      status: "SUBMITTED",
      items: [
        { id: "qi_3", name: "Ergonomic chair", quantity: 25, unitPrice: 3800, total: 95000 },
        { id: "qi_4", name: "Standing desk", quantity: 10, unitPrice: 7450, total: 74500 },
      ],
      createdAt: T("2025-05-21T11:00:00Z"),
      updatedAt: T("2025-05-21T11:00:00Z"),
    },
    {
      id: "q_officemead",
      quotationNumber: "QT-2025-0103",
      rfqId: "rfq_q2",
      vendorId: "v_officemead",
      subtotal: 211700,
      taxRate: 18,
      taxAmount: 38106,
      grandTotal: 249806,
      deliveryDays: 7,
      paymentTerms: "15 days net",
      status: "SUBMITTED",
      items: [
        { id: "qi_5", name: "Ergonomic chair", quantity: 25, unitPrice: 4600, total: 115000 },
        { id: "qi_6", name: "Standing desk", quantity: 10, unitPrice: 9670, total: 96700 },
      ],
      createdAt: T("2025-05-21T12:00:00Z"),
      updatedAt: T("2025-05-21T12:00:00Z"),
    },
  ];

  const approvals: Approval[] = [
    {
      id: "ap_l1",
      rfqId: "rfq_q2",
      quotationId: "q_infra",
      vendorId: "v_infra",
      level: "L1",
      status: "APPROVED",
      remarks: "Lowest price and acceptable delivery. Recommend approval.",
      approverId: "u_rahul",
      approverName: "Rahul Mehta",
      approverRole: "Procurement Head",
      decidedAt: T("2025-05-20T10:32:00Z"),
      createdAt: T("2025-05-20T09:00:00Z"),
      updatedAt: T("2025-05-20T10:32:00Z"),
    },
    {
      id: "ap_l2",
      rfqId: "rfq_q2",
      quotationId: "q_infra",
      vendorId: "v_infra",
      level: "L2",
      status: "PENDING",
      approverId: "u_priya",
      approverName: "Priya Shah",
      approverRole: "Finance Manager",
      createdAt: T("2025-05-21T09:00:00Z"),
      updatedAt: T("2025-05-21T09:00:00Z"),
    },
  ];

  // Extra historical POs so dashboard/report aggregates look realistic.
  const purchaseOrders: PurchaseOrder[] = [
    {
      id: "po_hist1",
      poNumber: "PO-2025-0061",
      vendorId: "v_techcore",
      subtotal: 161017,
      cgst: 14491,
      sgst: 14491,
      grandTotal: 190000,
      poDate: T("2025-04-08T09:00:00Z"),
      status: "COMPLETED",
      createdById: "u_officer",
      items: [{ id: "pl_h1", name: "Workstation desktop", quantity: 5, unitPrice: 32203, total: 161017 }],
      createdAt: T("2025-04-08T09:00:00Z"),
      updatedAt: T("2025-04-08T09:00:00Z"),
    },
    {
      id: "po_hist2",
      poNumber: "PO-2025-0058",
      vendorId: "v_stationhub",
      subtotal: 33898,
      cgst: 3051,
      sgst: 3051,
      grandTotal: 40000,
      poDate: T("2025-05-02T09:00:00Z"),
      status: "ACKNOWLEDGED",
      createdById: "u_officer",
      items: [{ id: "pl_h2", name: "Office stationery kit", quantity: 100, unitPrice: 339, total: 33898 }],
      createdAt: T("2025-05-02T09:00:00Z"),
      updatedAt: T("2025-05-02T09:00:00Z"),
    },
  ];

  const invoices: Invoice[] = [
    {
      id: "inv_hist1",
      invoiceNumber: "INV-2025-0061",
      purchaseOrderId: "po_hist1",
      vendorId: "v_techcore",
      billToName: "Your Organization Name",
      billToAddress: "123 Business Park, Ahmedabad",
      billToGstin: "25383438AFB",
      invoiceDate: T("2025-04-10T09:00:00Z"),
      dueDate: T("2025-04-25T09:00:00Z"),
      subtotal: 161017,
      cgst: 14491,
      sgst: 14491,
      grandTotal: 190000,
      status: "OVERDUE",
      items: [{ id: "il_h1", name: "Workstation desktop", quantity: 5, unitPrice: 32203, total: 161017 }],
      createdAt: T("2025-04-10T09:00:00Z"),
      updatedAt: T("2025-04-10T09:00:00Z"),
    },
  ];

  const activity: ActivityLog[] = [
    {
      id: "act_1",
      type: "QUOTATION",
      action: "Quotation selected",
      description: "Infra Supplies Pvt Ltd selected for Office Furniture Q2",
      entityType: "RFQ",
      entityId: "rfq_q2",
      actorId: "u_officer",
      actorName: "Procurement Officer",
      createdAt: T("2025-05-23T09:15:00Z"),
    },
    {
      id: "act_2",
      type: "APPROVAL",
      action: "Approval pending",
      description: "PO-2024 awaiting L2 approval by Priya Shah",
      entityType: "APPROVAL",
      entityId: "ap_l2",
      actorId: "u_rahul",
      actorName: "Rahul Mehta",
      createdAt: T("2025-05-22T04:15:00Z"),
    },
    {
      id: "act_3",
      type: "RFQ",
      action: "RFQ published",
      description: "Office furniture Q2 sent to 3 vendors",
      entityType: "RFQ",
      entityId: "rfq_q2",
      actorId: "u_officer",
      actorName: "Procurement Officer",
      createdAt: T("2025-05-19T09:15:00Z"),
    },
    {
      id: "act_4",
      type: "VENDOR",
      action: "Vendor added",
      description: "FastLog Transport registered and pending verification",
      entityType: "VENDOR",
      entityId: "v_fastlog",
      actorId: "u_officer",
      actorName: "Procurement Officer",
      createdAt: T("2025-05-18T15:20:00Z"),
    },
  ];

  return {
    users,
    vendors,
    rfqs,
    quotations,
    approvals,
    purchaseOrders,
    invoices,
    activity,
    counters: { rfq: 42, quotation: 103, po: 68, invoice: 61 },
  };
}

const globalForDB = globalThis as unknown as { __vbStore?: DBShape };

export const db: DBShape = globalForDB.__vbStore ?? (globalForDB.__vbStore = seed());

// ── id / sequence helpers ────────────────────────────────────────────────────

let idCounter = 0;
export function genId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}`;
}

/** Pad a running counter into a document number, e.g. nextNumber("po","PO-2025") -> PO-2025-0069. */
export function nextNumber(counter: keyof DBShape["counters"], prefix: string): string {
  db.counters[counter] = (db.counters[counter] ?? 0) + 1;
  return `${prefix}-${String(db.counters[counter]).padStart(4, "0")}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}
