# Milk Agency Management

A production-oriented management system for milk agencies and distributors.
This repository is being built phase by phase; it does not yet contain
production customer, delivery, payment, or billing workflows.

## Phase 0: application foundation

Phase 0 establishes the Next.js App Router, strict TypeScript, Tailwind CSS,
Supabase browser/server client boundaries, environment validation, and tested
integer-paise calculations. It intentionally does not create business tables
or display sample financial data.

## Architecture

- `src/app/`: App Router pages, layouts, and route handlers.
- `src/components/`: reusable presentation components.
- `src/features/`: business modules as they are introduced.
- `src/lib/calculations/`: tested financial and domain calculations.
- `src/lib/supabase/`: public Supabase configuration and browser/server clients.
- `src/lib/validations/`: shared input schemas, added with the relevant modules.
- `src/services/`: server-side data access and business workflows, added with
  their domain schema.
- `src/types/`: generated Supabase and domain types, added after migrations
  define the database contract.
- `supabase/migrations/`: versioned PostgreSQL schema and RLS changes.

Server components and services will own database reads and authorization.
Client components should receive only the minimal data required for rendering.
Financial inputs are parsed into integer paise; PostgreSQL `NUMERIC` remains
the database representation for persisted monetary values.

## Requirements

- Node.js 20.9 or newer
- npm
- Supabase project for authenticated database features

Copy `.env.example` to `.env.local` and provide the project's URL and
publishable key. Never place a Supabase service-role key in client code or a
`NEXT_PUBLIC_` variable.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Planned modules

Customers, products and customer-specific pricing, recurring and manual
deliveries, append-only customer ledgers, payments, invoices and statements,
reporting, and offline-friendly caching will be implemented in later phases.
No live Supabase schema or seed data is included yet.
