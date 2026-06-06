# VendorBridge System Architecture

## Overview

VendorBridge is a Next.js 16 application for procurement and vendor management.
It is built with React 19, TypeScript, Tailwind CSS, Prisma-compatible data modeling, and a server-side app router.

The app supports:
- Authentication and user registration
- Role-based access control (RBAC)
- RFQ creation and vendor invitation
- Quotation submission and comparison
- Approval workflows with multi-level checks
- Purchase order and invoice tracking
- Reporting and activity monitoring

## Architecture Components

### 1. Presentation Layer

- `src/app/` contains the Next.js App Router pages and layouts.
- `src/app/(auth)/` handles authentication routes (`/login`, `/register`).
- `src/app/(dashboard)/` contains the protected workspace routes.
- `src/components/` provides reusable UI components, forms, layout primitives, navigation, and data visualization.

### 2. Auth + RBAC

- `src/lib/auth/session.ts` manages session lookup and current user resolution.
- `src/lib/auth/rbac.ts` defines permissions and access control helpers.
- `requireUser()` and `requirePermission()` are used inside pages to protect server-side routes.
- `can()` is used by the sidebar navigation to hide unauthorized links.

### 3. Application Services

- `src/services/` contains app-specific business logic and data access wrappers.
- Service modules include:
  - `analytics.ts`
  - `procurement.ts`
  - `vendors.ts`
  - `activity.ts`

These services are consumed by page components to fetch and reshape data.

### 4. Data Layer

- `src/lib/db/store.ts` is the current in-memory data store implementation.
- It exposes collections shaped like a relational database and is intentionally compatible with future Prisma queries.
- `prisma/schema.prisma` defines the PostgreSQL data model, including users, vendors, RFQs, quotations, approvals, purchase orders, invoices, and activity logs.

> Note: The application currently uses the in-memory store for runtime development, but the Prisma schema is ready for a live PostgreSQL backend.

### 5. Routes and Workflow

The application follows a standard procurement workflow:

- `/login` / `/register` — authentication entry points
- `/dashboard` — role-based landing page with KPIs and quick actions
- `/rfqs` — list and create RFQs
- `/quotations` — review RFQ quotations and compare responses
- `/quotations/:rfqId/compare` — compare quotations for a specific RFQ
- `/approvals` — approval queue for managers and approvers
- `/approvals/:id` — approval detail and decision page
- `/purchase-orders` — PO list and PO detail pages
- `/invoices` — invoice tracking and management
- `/vendors` — vendor directory and management
- `/reports` — analytics dashboard
- `/activity` — audit trail and historical events

## Architecture Diagram

```mermaid
flowchart LR
  Browser[Browser / User Agent]
  subgraph NextApp[Next.js Application]
    AppRouter[App Router / src/app]
    AuthSegment[(auth) routes]
    DashboardSegment[(dashboard) routes]
    Components[UI Components]
    Services[Service Layer]
    DBStore[In-memory DB Store]
    PrismaSchema[Prisma Schema / Postgres model]
  end

  Browser --> AppRouter
  AppRouter --> AuthSegment
  AppRouter --> DashboardSegment
  DashboardSegment --> Components
  DashboardSegment --> Services
  AuthSegment --> Services
  Services --> DBStore
  DBStore --- PrismaSchema
  DBStore -->|Seed data / runtime storage| GlobalThis[globalThis cache]
```

## Deployment and Runtime

- `npm install` to install dependencies.
- `npm run dev` to start the Next.js development server.
- `npm run build` to compile for production.
- `npm start` to serve the built app.

### Data Persistence Future Path

1. Configure `DATABASE_URL` for PostgreSQL.
2. Use Prisma CLI to generate the client and run migrations.
3. Replace `src/lib/db/store.ts` with actual Prisma service calls.

## Key Design Principles

- Server-side route protection using Next.js server components.
- Clean separation between UI components and service/data layers.
- RBAC-driven navigation and access control.
- Modular route segments for auth and dashboard workflows.
- Database model designed for procurement lifecycle with explicit enums and relations.
