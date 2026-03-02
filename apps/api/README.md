# @buzzy/api — Buzzy Today REST API

Fastify + TypeScript REST API serving all client applications.

## Stack
- **Runtime:** Node.js + Fastify 5
- **Validation:** Zod schemas
- **Logging:** Winston (structured JSON)
- **Database:** Firebase Firestore

## Development

```bash
# From monorepo root
npm run dev --workspace=@buzzy/api

# Or directly
cd apps/api && npm run dev
```

Server starts on `http://localhost:3001` by default.

## Endpoints

See [docs/api-contracts.md](../../docs/api-contracts.md) for the full API reference.

## Environment Variables

See [.env.example](../../.env.example) for required configuration.
