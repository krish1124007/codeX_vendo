# VendorBridge

VendorBridge is a procurement and vendor management dashboard built with Next.js 16 and React 19.
It supports RFQs, quotations, approval workflows, purchase orders, invoices, activity reporting, and role-based access control.

## Features

- Authentication and registration flows
- Role-based dashboard navigation
- RFQ creation and vendor invitation
- Quotation comparison and selection
- Approval queue with multi-level workflow
- Purchase order and invoice tracking
- Reporting and analytics cards
- Vendor management and activity history

## Project Structure

- `src/app/` - Next.js app routes and layouts
- `src/components/` - reusable UI components and form controls
- `src/lib/` - auth helpers, RBAC, and shared utilities
- `src/services/` - data access and business logic
- `prisma/` - Prisma schema and data model

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The root route now serves the public landing page and links to login and registration.

## Build and Production

Build the app:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Notes

- The project includes Prisma schema support, but the current app uses an in-memory store implementation in `src/lib/db/store.ts`.
- If you switch to a live PostgreSQL database, configure `DATABASE_URL` and run Prisma migrations as needed.

## Dependencies

- `next` 16.2.7
- `react` 19.2.4
- `react-dom` 19.2.4
- `framer-motion`
- `prisma` / `@prisma/client`
- `react-hook-form`
- `zod`
- `recharts`
- `lucide-react`
- `tailwindcss` (with PostCSS plugin)

## Landing Page

- `/` renders a modern public landing page with hero, navigation, features, about section, and footer
- Uses React, Tailwind CSS, Lucide icons, and Framer Motion
- Responsive mobile-first layout with sticky navbar and hamburger menu

## System Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the app architecture, routing model, data flow, and deployment notes.

## License

This repository is private and intended for internal use.
