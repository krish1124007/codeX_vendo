# VendorBridge

VendorBridge is a modern procurement and vendor management platform built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma, and AI-assisted procurement chat.

The app includes a public landing page, authentication flows, role-based dashboards, RFQ and quotation workflows, approval queues, purchase order and invoice tracking, vendor management, activity reporting, and analytics.

## Key Features

- Public landing page with hero, features, about, and footer sections
- Authentication with login and registration
- Role-based dashboards for ADMIN, PROCUREMENT_OFFICER, MANAGER, and VENDOR
- RFQ creation, vendor invitation, and quotation collection
- Quotation comparison and selection workflows
- Approval queue with detailed approval actions
- Purchase order generation and tracking
- Invoice lifecycle tracking and payment updates
- Vendor directory and profile management
- Activity feed and audit trail
- Procurement AI chat assistant via `/api/chat`

## Tech Stack

- Next.js 16.2.7
- React 19.2.4
- TypeScript 5
- Tailwind CSS 4
- Prisma 7.8.0 with PostgreSQL adapter
- AI chat powered by `@ai-sdk/groq`, `@ai-sdk/react`, and `ai`
- `react-hook-form`, `zod`, `framer-motion`, `recharts`, `sonner`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create a `.env` file with:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
GROQ_API_KEY=your_groq_api_key
```

### 3. Generate the Prisma client

```bash
npx prisma generate --schema prisma/schema.prisma
```

### 4. Run the development server

```bash
npm run dev
```

The `dev` script runs `scripts/seed-prompt.ts` first, giving you the option to seed authentication data and dummy system data before starting the app.

Open the app at:

```text
http://localhost:3000
```

### 5. Build for production

```bash
npm run build
npm run start
```

### 6. Lint the code

```bash
npm run lint
```

## Scripts

- `npm run dev` — prompts for data seeding and starts Next.js in development mode
- `npm run build` — builds the app for production
- `npm run start` — starts the production server
- `npm run lint` — runs ESLint

## Architecture Overview

### Frontend

- `src/app/` — App Router routes and layouts
- `src/app/(auth)/` — public authentication pages
- `src/app/(dashboard)/` — protected dashboard pages
- `src/components/landing/` — landing page sections
- `src/components/forms/` — reusable form and submission components
- `src/components/layout/` — app shell, sidebar, topbar, and navigation
- `src/components/ui/` — design system primitives
- `src/components/chat/` — Procurement AI chat widget

### Backend / Data Layer

- `src/lib/auth/` — session handling and RBAC
- `src/lib/db/prisma.ts` — Prisma client initialization
- `src/lib/db/store.ts` — legacy in-memory seed store prototype
- `prisma/schema.prisma` — database schema definitions

### Services

- `src/services/procurement.ts` — RFQs, quotations, approvals, purchase orders, invoices
- `src/services/vendors.ts` — vendor search and vendor management
- `src/services/analytics.ts` — dashboard and reporting metrics
- `src/services/activity.ts` — activity logging and audit history
- `src/services/users.ts` — user list and role updates

### AI Chat

- `src/app/api/chat/route.ts` — Procurement AI assistant backend
- The chat route is protected and requires authenticated users with ADMIN, MANAGER, or PROCUREMENT_OFFICER roles
- It exposes tools for RFQ listing, quotation queries, and dashboard stats

## Project Notes

- The app is designed to run with Prisma and PostgreSQL.
- `DATABASE_URL` is required for the backend database and the AI chat route.
- `GROQ_API_KEY` is required for the AI chat assistant.
- `scripts/seed-prompt.ts` allows optional seeding of `prisma/auth_dummy_seed.ts` and `prisma/dummy_seed.ts`.
- There is a legacy in-memory store in `src/lib/db/store.ts` used by a prototype page, but most business logic uses Prisma.

## Package Analysis

Key runtime dependencies in `package.json`:

- `next` 16.2.7
- `react` 19.2.4 / `react-dom` 19.2.4
- `@prisma/client`, `prisma`, `pg`, `@prisma/adapter-pg`
- `@ai-sdk/groq`, `@ai-sdk/react`, `ai`
- `framer-motion`, `lucide-react`, `recharts`, `sonner`
- `react-hook-form`, `@hookform/resolvers`, `zod`

Key dev dependencies:

- `typescript` ^5
- `eslint` ^9
- `eslint-config-next` 16.2.7
- `tailwindcss` ^4
- `@tailwindcss/postcss` ^4
- `@types/node`, `@types/react`, `@types/react-dom`, `@types/bcryptjs`

### Recommendations

- The `dev` script uses `npx tsx scripts/seed-prompt.ts` before starting Next.js. For more deterministic installs, you may want to add `tsx` as a dev dependency.
- The Prisma/PostgreSQL stack is properly configured for the current codebase.
- AI-related dependencies are present and in use by the chat component and `/api/chat` route.

## File Structure Summary

- `src/app/` — app routes and page layouts
- `src/components/` — UI, forms, layout, dashboards, landing content, and chat
- `src/lib/` — auth, RBAC, Prisma client, and optional seed store
- `src/services/` — domain logic and data orchestration
- `prisma/` — schema and seed scripts
- `scripts/` — local seed prompt helper

## License

This repository is private and intended for internal or project-specific use.
