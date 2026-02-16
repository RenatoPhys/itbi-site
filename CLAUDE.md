# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build (also validates TypeScript)
npm run lint     # Run ESLint (flat config, eslint-config-next)
```

No test framework is configured.

## Environment

Requires `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

Next.js App Router project for querying ITBI (real estate transfer tax) transactions in São Paulo. Data lives in Supabase (`transacoes_itbi` table) with RLS enabled (public read).

### Supabase Client Pattern

Two Supabase clients exist and must be used in the correct context:
- `@/lib/supabase-server` — `createClient()` is async, uses `cookies()`, for Server Components and server actions
- `@/lib/supabase-browser` — `createClient()` is sync, for Client Components

The middleware (`src/middleware.ts`) refreshes auth sessions on every request.

### Leaflet SSR Workaround

Leaflet requires browser APIs. The map page (`src/app/mapa/page.tsx`) uses `"use client"` + `dynamic()` with `ssr: false` to import the map component. Any new Leaflet-dependent components must follow this pattern. Marker icons are loaded from CDN to avoid webpack asset issues.

### Key Data Patterns

- `anomes` is an integer `YYYYMM`. To filter by year: `>= year*100+1` and `<= year*100+12`
- Map points are grouped by `logradouro|numero` key and averaged per year
- Map loads data within viewport bounds with a 5000 row limit and 400ms debounce on pan/zoom
- Search uses CEP (postal code) + street number to find transaction history

### Shared Query Layer

`src/lib/queries.ts` contains reusable Supabase queries (`getMapPoints`, `searchByCepNumero`). New data access should go here rather than inline in components.

### Pages

- `/` — Landing page (Server Component, checks auth state)
- `/mapa` — Interactive map with year filter, marker clustering, price-colored dots
- `/busca` — Search by CEP + number, shows scatter plots (price/m² and sale price over time)
- `/tendencias` — Placeholder page
- `/login` — Email/password + Google OAuth

Login is optional — all pages are accessible without authentication.
