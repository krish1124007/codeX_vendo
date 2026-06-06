# VendorBridge

VendorBridge is a modern procurement and vendor management platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS. It provides a public landing page, authentication flows, role-based dashboards, RFQ and quotation workflows, approval queues, purchase order and invoice tracking, vendor management, activity reporting, and analytics.

## What This Project Includes

- Public landing page with hero, features, about section, and footer
- Authentication routes for login and registration
- Role-based dashboard layout with protected routes
- RFQ creation, publication, and vendor invitation
- Quotation collection, comparison, and selection
- Approval workflow with manager review and decision actions
- Purchase order tracking and invoices lifecycle
- Vendor directory and activity log monitoring
- Analytics and reporting UI components
- In-memory data store with Prisma schema support for future database integration

## Full Feature List

- User authentication and registration
- Role-based access control (RBAC): ADMIN, PROCUREMENT_OFFICER, MANAGER, VENDOR
- Public landing page with responsive design and CTA buttons
- RFQ creation with configurable line items, deadlines, and invited vendors
- Quotation submission, comparison, and best-offer review
- Approval queue with approval detail pages and decision workflow
- Purchase order listing and detail views
- Invoice list and payment tracking
- Vendor directory with vendor profiles and status
- Activity feed for audit events and procurement actions
- Dashboard charts and reporting summaries
- UI utility components, forms, cards, tables, buttons, and icons

## Architecture Overview

### Frontend

- `src/app/` - Next.js App Router application routes and layout segments
- `src/app/(auth)/` - Public authentication pages: `/login`, `/register`
- `src/app/(dashboard)/` - Protected dashboard routes for procurement workflows
- `src/components/landing/` - Landing page components for hero, nav, features, about, footer, and loading state
- `src/components/forms/` - Reusable form components for login, register, RFQ creation, and quotation submission
- `src/components/layout/` - App shell, sidebar, topbar, and navigation elements
- `src/components/ui/` - Styled UI primitives: buttons, cards, inputs, tables, badges, skeletons

### Backend / Data Layer

- `src/lib/auth/` - Authentication, session management, and RBAC logic
  - `session.ts` manages cookies and current user resolution
  - `rbac.ts` defines permission checks and role-based navigation
- `src/lib/db/` - Data access layer, including the in-memory database store and Prisma runtime
  - `store.ts` contains seeded example data and async data access methods
  - `prisma.ts` connects to `@prisma/client` for future PostgreSQL support
- `prisma/schema.prisma` - PostgreSQL data model for users, vendors, RFQs, quotations, approvals, purchase orders, invoices, notifications, and activity logs

### Service Layer

- `src/services/` - Application business logic and data abstraction
  - `procurement.ts` handles RFQs, quotations, and PO operations
  - `vendors.ts` handles vendor list and vendor detail retrieval
  - `activity.ts` manages activity logging and audit events
  - `analytics.ts` aggregates reporting metrics for dashboards

## App Workflow and Route Map

### Public routes

- `/` - Public landing page (`src/app/page.tsx`)
- `/login` - Login form
- `/register` - Registration form

### Dashboard routes

- `/dashboard` - Main dashboard overview
- `/dashboard/rfqs` - RFQ list and create new RFQ
- `/dashboard/rfqs/new` - New RFQ creation flow
- `/dashboard/quotations` - Quotation list and RFQ comparison page
- `/dashboard/quotations/[rfqId]/compare` - Compare quotations for a selected RFQ
- `/dashboard/approvals` - Approval queue overview
- `/dashboard/approvals/[id]` - Approval decision detail page
- `/dashboard/purchase-orders` - Purchase order list
- `/dashboard/purchase-orders/[id]` - Purchase order detail
- `/dashboard/invoices` - Invoice tracking and payment status
- `/dashboard/vendors` - Vendor directory and profile management
- `/dashboard/reports` - Analytics and reporting dashboard
- `/dashboard/activity` - Activity feed and audit trail

### Data flow

1. User visits the public landing page at `/`
2. Authenticated users access `/dashboard` and protected routes
3. Page components call services in `src/services/`
4. Services access either the in-memory store in `src/lib/db/store.ts` or Prisma client in `src/lib/db/prisma.ts`
5. RBAC checks in `src/lib/auth/rbac.ts` determine route and sidebar visibility
6. Activity events are logged through `src/services/activity.ts`

## Frontend Architecture

- The dashboard uses a layout shell in `src/components/layout/` for responsive sidebars and topbars.
- UI and form components are designed to be reusable across pages.
- The landing page uses Tailwind CSS with a white/light theme, smooth motion via `framer-motion`, and modern section cards.
- Icons are provided by `lucide-react`.
- The app router is segmented into `auth` and `dashboard` groups for clear separation of public and protected areas.

## API and Data Access

This repository does not expose a separate REST API layer. Instead, the app uses an internal service API; page components and server actions call service functions directly.

### Auth API

- `src/lib/auth/session.ts`
  - `getCurrentUser()` reads the `vb_session` cookie, looks up the user, and returns the current authenticated user.
  - `createSession(userId)` sets a secure session cookie for the signed-in user.
  - `destroySession()` removes the session cookie to log out the user.
  - `verifyCredentials(email, password)` looks up a user by email and validates the password with `bcryptjs`.

- `src/lib/auth/rbac.ts`
  - `PERMISSIONS` maps each role to allowed capabilities.
  - `can(role, permission)` returns whether a role is allowed a permission.
  - `requireUser()` redirects unauthorized users to `/login`.
  - `requirePermission(permission)` redirects users without the requested permission back to `/dashboard`.

### Service API Modules

The application API is implemented in service modules under `src/services/`.

#### `src/services/procurement.ts`
- `listRFQs()` — fetch all RFQs, including items and invited vendors.
- `getRFQ(id)` — fetch a single RFQ by ID with related items and vendor ids.
- `createRFQ(input)` — create a new RFQ, save line items, invite vendors, set draft or published status, and log activity.
- `getQuotationsForRFQ(rfqId)` — fetch all quotations for a specific RFQ.
- `getQuotation(id)` — fetch one quotation by ID.
- `getQuotationByRfqAndVendor(rfqId, vendorId)` — fetch the quotation submitted by a specific vendor for an RFQ.
- `listQuotations()` — fetch all quotations, ordered by creation date.
- `createQuotation(input)` — build quotation totals, save the quotation and line items, and log the event.
- `updateQuotation(id, input)` — update an existing quotation, rebuild its item list, totals, and log the update.
- `listApprovals()` — fetch all approvals.
- `getApproval(id)` — fetch a single approval entry.
- `getApprovalsForRFQ(rfqId)` — fetch approvals ordered by level for one RFQ.
- `selectQuotation(input)` — mark one quotation selected, reject other quotations for the same RFQ, close the RFQ, and create approval records.
- `decideApproval(input)` — approve or reject an approval level, update the RFQ status when rejected, generate a purchase order after final approval, and log the decision.
- `listPurchaseOrders()` — fetch all POs with item details.
- `getPurchaseOrder(id)` — fetch one PO by ID.
- `getInvoiceForPO(poId)` — fetch the invoice tied to a purchase order.
- `generatePurchaseOrder(input)` — generate a PO from a selected quotation, create the related invoice, update RFQ status, and record activity.
- `listInvoices()` — fetch all invoices.
- `getInvoice(id)` — fetch a single invoice by ID.
- `markInvoicePaid(input)` — mark an invoice as paid, mark the related purchase order completed, and log the payment.

#### `src/services/vendors.ts`
- `listVendors(query?)` — search vendors by name, GST, or category, and optionally filter by status.
- `getVendor(id)` — fetch vendor detail by ID.
- `getVendorMap()` — return a `Map<string, Vendor>` keyed by vendor id.
- `vendorCounts()` — compute vendor totals by status.
- `createVendor(input)` — create a new vendor record with pending status.
- `updateVendorStatus(id, status)` — update a vendor’s status.

#### `src/services/analytics.ts`
- `getDashboardKpis()` — aggregate dashboard key performance indicators such as active RFQs, pending approvals, PO spend, and overdue invoices.
- `getMonthlyTrend()` — return a sample monthly spend trend for charting.
- `getReportSummary()` — return a summary of total spend, active vendors, PO fulfillment, and overdue invoices.
- `getSpendByCategory()` — return spend breakdown by category for visualization.
- `getTopVendorsBySpend()` — return top vendor spend rankings for analytics.

#### `src/services/activity.ts`
- `logActivity(input)` — append a new immutable activity log entry.
- `listActivity(filter?)` — fetch activity log entries, optionally filtered by activity type.

#### `src/services/users.ts`
- `listUsers()` — fetch all users and hide password hashes.
- `updateUserRole(id, role)` — change a user’s role and return the updated user without password hash.

### Data Layer API

- `src/lib/db/prisma.ts` establishes the Prisma client.
- `src/lib/db/store.ts` provides the current in-memory store and seeded sample data.
- `prisma/schema.prisma` defines the production-ready data model.

### How the API works

- Most page routes and server components call service functions directly rather than going through a REST endpoint.
- The service layer is the canonical API boundary for business logic.
- Service functions use Prisma queries under the hood, and the same function names can be reused if the app switches to a Postgres backend.
- Activity logging is centralized in `src/services/activity.ts`, and every major procurement action calls `logActivity()`.

### Example flow

1. A procurement officer creates an RFQ via `createRFQ()`.
2. Vendors submit quotations via `createQuotation()`.
3. A manager selects one quotation using `selectQuotation()`.
4. Approval levels are advanced through `decideApproval()`.
5. When approvals complete, `generatePurchaseOrder()` creates a PO and invoice.
6. Payment is finalized with `markInvoicePaid()`.

## How to Start the Project

### 1. Install dependencies

```bash
npm install
```

### 2. Generate Prisma client (optional)

If you want to use the Prisma client or switch to a real database:

```bash
npx prisma generate --schema prisma/schema.prisma
```

### 3. Run the development server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### 4. Build for production

```bash
npm run build
npm start
```

### 5. Environment variables

Create a `.env` file with:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

If you keep using the built-in in-memory store, this variable is optional.

## Future Production Setup

To enable production-ready database persistence:

1. Set `DATABASE_URL` in `.env`
2. Run Prisma migrations:

```bash
npx prisma migrate dev --name init --schema prisma/schema.prisma
```

3. Ensure the app can access PostgreSQL and the Prisma generated client is available.

## File Structure Summary

- `src/app/` - App routes and page layouts
- `src/components/landing/` - Landing page sections and visuals
- `src/components/forms/` - Authentication and submission forms
- `src/components/layout/` - Dashboard shell and navigation
- `src/components/ui/` - Reusable atomic UI elements
- `src/lib/auth/` - Session handling and RBAC
- `src/lib/db/` - In-memory store and Prisma connection
- `src/services/` - Domain logic and data orchestration
- `prisma/` - Database schema
- `package.json` - app dependencies and scripts

## Notes on Current Implementation

- The current runtime uses seeded in-memory data from `src/lib/db/store.ts` to keep the app running without requiring a database.
- The Prisma schema is ready for a PostgreSQL migration if you want to transition to a live backend.
- `src/lib/db/prisma.ts` shows how the Prisma client is configured and ready for future DB access.
- `src/lib/auth/session.ts` uses a cookie named `vb_session` to maintain user sessions.

## Dependencies

Major libraries used in this project:

- `next` 16.2.7
- `react` 19.2.4
- `framer-motion` for landing page animation
- `tailwindcss` and `@tailwindcss/postcss`
- `lucide-react` for iconography
- `prisma` / `@prisma/client` for DB schema and future persistence
- `react-hook-form` and `zod` for form validation
- `recharts` for analytics charts
- `sonner` for toast notifications

## How the App Works

- Public visitors see the landing page at `/` and can navigate to login/register.
- Authenticated users enter the dashboard and only see routes they are permitted to use.
- RFQ workflows allow procurement officers to create requests, invite vendors, and collect quotations.
- Managers can compare quotations, approve requests, and move them into purchase orders.
- Invoice tracking supports lifecycle visibility from draft to payment.
- Vendor management centralizes vendor records, statuses, and activity.
- Activity logs provide traceability for major procurement actions.

## Additional Resources

- `ARCHITECTURE.md` provides a deeper systems-level overview of routes, service boundaries, and deployment notes.
- `prisma/schema.prisma` defines the full production-ready data model.
- `src/lib/db/store.ts` is the current seeded in-memory database used for development.
- `src/lib/auth/rbac.ts` contains permission logic for route and UI access.

## License

This repository is private and intended for internal or project-specific use.
