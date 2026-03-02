# CLAUDE.md — Buzzy Today Project Instructions

## Who You Are
You are the lead engineer building Buzzy Today, a fast, social, human-first digital news platform. You work autonomously through a task list, completing tasks one by one with production-quality code.

## Execution Mode
You work AUTONOMOUSLY and CONTINUOUSLY. After completing each task:
1. Update TASKS.md to mark it done with a note
2. Immediately proceed to the next uncompleted task
3. Do NOT stop to ask permission or confirmation
4. Only stop if you: need an API key/credential you don't have, hit an unresolvable error, or complete all tasks in the current milestone

When you stop at a milestone boundary, state which milestone was completed and list any acceptance criteria that need manual verification.

## Getting Started
- If TASKS.md does not exist, read all files in docs/requirements/ (especially buzzy-execution-plan.md and acceptance-criteria.md) and create a comprehensive TASKS.md breaking down all milestones into granular sequential tasks, then begin Task 0.1.
- If TASKS.md exists, read it, find the next uncompleted task, and resume.

## Project Documentation
All specs live in `docs/requirements/`:
- `buzzy-execution-plan.md` — Master execution plan. PRIMARY REFERENCE for architecture, data model, API endpoints, tech stack, implementation order.
- `mvvvp.md` — Full product requirements
- `acceptance-criteria.md` — Milestone acceptance criteria and exit gates
- `meeting-notes.md` — Architecture decisions and clarifications
- Excel spreadsheets — Category configs, topic tags, AI prompts, RSS sources, cron schedules

## Task Format in TASKS.md
```
## Milestone 0 — Architecture & Environment Readiness
- [x] Task 0.1: Initialize Turborepo monorepo — DONE (created root package.json, turbo.json, tsconfig.base.json)
- [ ] Task 0.2: Create shared TypeScript types for all entities
- [ ] Task 0.3: Set up Firebase project configuration
...
- [ ] Task 0.VERIFY: Validate Milestone 0 acceptance criteria
```

Each task should be:
- Small enough to complete in one focused pass (1 component, 1 service, or 1 feature)
- Ordered so dependencies are built first
- Specific about what "done" means and where files go

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Database | Google Firebase Firestore |
| Auth | Firebase Auth |
| Backend API | Node.js + Fastify + TypeScript |
| Ingestion | Python 3.12 |
| AI Summarization | Python + OpenAI API (GPT-5-nano default) |
| Mobile | React Native (Expo) + TypeScript |
| Web | Next.js 14 (App Router) + TypeScript |
| Admin | Next.js + shadcn/ui + TypeScript |
| Push | Firebase Cloud Messaging |
| Email | SendGrid |
| CI/CD | GitHub Actions |
| Testing | Vitest (TS), pytest (Python) |

## Project Structure
```
buzzy-today/
├── apps/
│   ├── api/                    # Fastify REST API
│   ├── mobile/                 # React Native (Expo)
│   ├── web/                    # Next.js web app
│   └── admin/                  # Next.js + shadcn/ui admin panel
├── packages/
│   ├── shared/                 # Shared types, constants, utilities
│   ├── db/                     # Firestore schema, rules, indexes, seeds
│   └── ai/                     # AI pipeline shared code
├── services/
│   ├── ingestion/              # Python RSS ingestion pipeline
│   ├── summarization/          # Python AI summarization pipeline
│   ├── scheduler/              # Cron job orchestrator
│   └── notifications/          # Push & email
├── infrastructure/
│   ├── firebase/               # Firebase config, Cloud Functions
│   └── ci-cd/                  # GitHub Actions workflows
├── docs/
│   ├── requirements/           # All project specs
│   ├── architecture.md
│   ├── data-model.md
│   └── api-contracts.md
├── config/                     # Seeded config data (CSVs, JSON)
├── scripts/                    # Dev tooling, seed scripts
├── .env.example
├── TASKS.md                    # Task tracker (you maintain this)
├── CLAUDE.md                   # This file
├── package.json
└── turbo.json
```

## Coding Standards

### General
- TypeScript strict mode everywhere. Python 3.12 for services.
- All functions get JSDoc/docstring comments with @param, @returns, @throws
- All API endpoints get Zod validation schemas
- All database operations wrapped in try/catch with structured error logging
- Custom error classes extending base `BuzzyError`
- Structured JSON logging (winston for Node, structlog for Python)
- No `any` types — use `unknown` and narrow with type guards
- Constants in `packages/shared/src/constants/`
- pip install always uses `--break-system-packages` flag

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `camelCase.ts`
- Types: `camelCase.types.ts`
- Tests: `*.test.ts` co-located with source
- Python: `snake_case.py`

### Testing
- Unit tests for all business logic (Vitest for TS, pytest for Python)
- Integration tests for API endpoints
- Write tests as part of each task, not as a separate phase

### Documentation
- README.md in every apps/ and services/ directory
- Architecture decisions in docs/
- Every module gets a header comment explaining purpose and dependencies

## Architecture Reminders
- **Firestore, not SQL** — Document-based. Denormalize. Use subcollections. No complex joins.
- **Prompts are config** — AI prompts stored in Firestore, editable via admin. Never hardcode.
- **Topic Tags are canonical** — One canonical form per tag. Synonyms map to canonical. No freeform creation during ingestion.
- **Slugs unique at DB level** — Lowercase, hyphen-separated, URL-safe.
- **Category colors** — TL;DR and badges use hex colors from Categories Master spreadsheet.
- **AP-style dateline** — `(NEW YORK) — Jan. 20, 2026, 11:12 a.m. ET` above TL;DR.
- **No tag soup** — Homepage limits 1 Content Clump per Tag at a time.
- **Acceptance criteria are gates** — Verify exit criteria before moving to next milestone.

## When You Need Credentials
If a task requires an API key or credential you don't have (Firebase, OpenAI, SendGrid, etc.), skip the runtime configuration, leave clear TODO comments with exactly what's needed, note it in TASKS.md, and move on to the next task that doesn't require those credentials. Do not block on missing keys.
