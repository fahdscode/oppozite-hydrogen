# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server via Shopify Hydrogen (Mini Oxygen worker runtime)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

The dev server runs via `shopify hydrogen dev` using the Mini Oxygen Cloudflare Worker emulator. There are no test commands configured.

## Architecture Overview

This is a **Shopify Hydrogen** storefront (React Router 7 + Cloudflare Workers) for the Oppozite Wears streetwear brand. The project has an unusual split-directory structure:

### Two Parallel UI Layers

**`app/`** — The Hydrogen SSR layer (server-rendered, Shopify-integrated)
- `app/routes/` — File-based routes via `@react-router/fs-routes` (flat file convention: `_index.tsx`, `products.$handle.tsx`, etc.)
- `app/components/` — SSR-safe components that can access Shopify `storefront` context; includes `home/`, `layout/`, `product/`, `ui/` subdirs
- `app/lib/` — Hydrogen utilities: `context.ts` (creates `HydrogenRouterContext`), `fragments.ts` (shared GraphQL fragments), `session.ts`, `i18n.ts`, `shopify.ts` (direct Storefront API client for client-side use)
- `app/graphql/` — Additional GraphQL query files
- Route loaders use `context.storefront.query()` for SSR data fetching; deferred data uses `Await`/`Suspense`

**`src/`** — A legacy/supplementary client-side layer (not SSR)
- `src/pages/` — Page components not currently used via React Router (superseded by `app/routes/`)
- `src/components/` — Client-side components; `src/components/ui/` has shadcn/ui primitives
- `src/context/`, `src/stores/`, `src/hooks/` — Client state: `CartContext.tsx`, `cartStore.ts` (Zustand), `useShopifyProducts.ts` / `useShopifyCollections.ts` (TanStack Query hooks hitting Storefront API directly)

### Path Aliases

- `~` → `./app` (used in Hydrogen SSR routes and components)
- `@` → `./src` (used in client-side src components)

shadcn/ui components are added to `src/components/ui/` via `npx shadcn@latest add <component>`.

### Server Entry

`server.ts` is the Cloudflare Worker entry point. It calls `createHydrogenRouterContext()` from `app/lib/context.ts` to create the Hydrogen context (storefront client, session, cart, customer account), then delegates to React Router's request handler.

### Key Environment Variables

Required in `.env`:
- `PUBLIC_STORE_DOMAIN` / `PUBLIC_STOREFRONT_API_TOKEN` — Shopify Storefront API
- `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` / `SHOPIFY_SHOP_ID` — Customer Account API
- `SESSION_SECRET` — Cookie session signing
- `VITE_META_PIXEL_ID` — Meta Pixel analytics

### Styling

Tailwind CSS with custom fonts (`Bebas Neue` for display/headings, `Inter` for body). CSS variables power the shadcn/ui color system (defined in `src/index.css`). Custom animations are registered in `tailwind.config.ts`. The app stylesheet is at `app/styles/app.css`.

### Deployment

Deployed to Vercel (see `vercel.json`) and Shopify Oxygen. The `vercel.json` rewrites handle SPA routing and SEO API endpoints at `/api/seo`.
