# @buzzy/admin — Buzzy Today Admin Panel

Next.js + shadcn/ui internal admin panel for platform management.

## Stack
- **Framework:** Next.js + shadcn/ui
- **Language:** TypeScript

## Features
- RSS source management
- Topic Tag CRUD and suggested tag review
- Buzzword management
- AI prompt variable editing (per-category)
- Publishing quota configuration
- Analytics dashboard and CSV exports

## Development

```bash
# From monorepo root
npm run dev --workspace=@buzzy/admin

# Or directly
cd apps/admin && npm run dev
```

Runs on `http://localhost:3002` by default.
