# WHATNEXT INVESTMENT NIGERIA LIMITED — Business Management Dashboard

A manager dashboard for tracking products, customers, inventory, sales, logistics, and financials for a building-materials business (gypsum, paint chemicals, POP fillers).

## Features

- **Authentication (demo mode)** — email/password sign-in stored locally; ready to swap for Supabase Auth
- **Dashboard** — overview stats and charts
- **Inventory** — product catalog, add/edit products, stock status, low-stock tracking, shared across the app
- **Sales** — create/edit orders with customer details (name, address, phone), line items with manual price entry, automatic stock reduction, export to CSV/PDF
- **Analytics** — revenue/expense/profit charts, date range filters, export reports, driven by real sales data
- **Settings** — profile, notifications, security, appearance, company details
- **Global search** — find products, orders, and customers from the header (Ctrl/Cmd + K)
- **Mobile support** — responsive layout, bottom navigation, pull-to-refresh

> Note: Logistics, Documents, Production, and Notifications pages are placeholders. Data currently lives in browser memory/localStorage and resets on refresh — the Supabase backend replaces this.

## Getting Started

### Prerequisites

- Node.js 18+ (https://nodejs.org)

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app

```bash
npm run dev
```

Open http://localhost:8080 in your browser. Demo mode: sign in with any email and password.

### 3. Build for production

```bash
npm run build
npm run preview   # serve the production build locally
```

## Connecting Supabase (your backend)

1. Create a project at https://supabase.com (or run `supabase init` + `supabase start` locally with the Supabase CLI).
2. Copy `.env.example` to `.env` and fill in your project URL and anon key (Supabase Dashboard → Project Settings → API).
3. The Supabase client in `src/integrations/supabase/client.ts` reads these automatically (`isSupabaseConfigured` tells you whether it connected).
4. Recommended table structure to start: `products`, `customers`, `sales_orders`, `sale_items`, `user_roles` (see `user_roles` guidance below for admin/manager/staff permissions).
5. Enable Row Level Security on every table and write policies per role before exposing data to the browser.
6. Replace the localStorage login in `src/pages/Login.tsx` with `supabase.auth.signInWithPassword()` and register an `onAuthStateChange` listener.

**Never commit `.env`** — it is already listed in `.gitignore`.

## Tech Stack

- React 18 + Vite 5 + TypeScript 5
- Tailwind CSS v3 + shadcn/ui components
- Recharts for analytics charts
- React Router for navigation
- @supabase/supabase-js (backend client, ready to wire up)

## Default Login (demo)

Any email + password combination works in demo mode. Create a real admin account in Supabase Auth once the backend is connected.
