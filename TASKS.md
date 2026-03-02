## Buzzy Project Tasks

This file breaks the Buzzy project into granular, sequential tasks organized by milestone.  
Each task is small enough to complete in a focused session, ordered by dependencies (types before services, services before API routes, API before frontend).

---

### Milestone 0: Monorepo & Tooling Foundations

- [x] Task 0.1: Initialize Turborepo workspace — Create the root `package.json` with npm workspaces, `turbo.json` pipeline, and `apps/`, `packages/`, and `services/` directories in a Turborepo layout. _(Completed: root monorepo config added, workspace directories created, dependencies installed, and Turbo CLI verified.)_
  - [x] Subtask 0.1.a: Add root `package.json` configured with workspaces for `apps/*`, `packages/*`, and `services/*`.
  - [x] Subtask 0.1.b: Add `turbo.json` defining basic `build`, `lint`, `test`, and `dev` pipelines.
  - [x] Subtask 0.1.c: Create empty `apps/`, `packages/`, and `services/` directories.

- [ ] Task 0.2: Bootstrap TypeScript configuration — Add root `tsconfig.base.json` and shared TS config patterns for TypeScript apps and packages.
  - [ ] Subtask 0.2.a: Create `tsconfig.base.json` with shared compiler options.
  - [ ] Subtask 0.2.b: Add minimal `tsconfig.json` files to each TypeScript workspace (apps and packages) extending the base config.

- [ ] Task 0.3: Set up linting & formatting — Configure ESLint and Prettier at the repo root, with scripts wired into Turborepo.
  - [ ] Subtask 0.3.a: Add ESLint config for TypeScript/react and node targets.
  - [ ] Subtask 0.3.b: Add Prettier config and ignore files.
  - [ ] Subtask 0.3.c: Add `lint` and `format` scripts at root and in apps/packages.

- [ ] Task 0.4: Define Python service tooling — Create shared Python tooling for `services/` (version, dependencies, formatting, testing).
  - [ ] Subtask 0.4.a: Choose Python version and document it.
  - [ ] Subtask 0.4.b: Add shared `requirements.txt` or `pyproject.toml` for ingestion and summarization services.
  - [ ] Subtask 0.4.c: Add basic formatting (e.g., Black) and testing (e.g., pytest) configuration.

- [ ] Task 0.5: Expand core documentation — Update `README.md` and create a basic `docs/` structure describing architecture and local development.
  - [ ] Subtask 0.5.a: Document monorepo layout (`apps/`, `packages/`, `services/`) and technology choices (TypeScript + Firebase Firestore + Python services).
  - [ ] Subtask 0.5.b: Add a quickstart section for installing dependencies and running dev tasks.

- [ ] Task 0.VERIFY: Validate Milestone 0 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 1: Shared Types & Firestore DB Package

- [ ] Task 1.1: Define shared domain types — Create `packages/shared` TypeScript models for core entities (users, sources, feeds, articles, summaries, categories, topics).
  - [ ] Subtask 1.1.a: Model Firestore document shapes and collections in TypeScript.
  - [ ] Subtask 1.1.b: Add type-safe enums/constants for categories, tags, and statuses.

- [ ] Task 1.2: Design Firestore data model — Document the Firestore collections, subcollections, and indexes in `docs/` and align them with `packages/shared` types.
  - [ ] Subtask 1.2.a: Map entities to collections (e.g., `sources`, `articles`, `summaries`, `users`, `subscriptions`).
  - [ ] Subtask 1.2.b: Identify required composite indexes and security considerations at a high level.

- [ ] Task 1.3: Implement `packages/db` Firestore wrapper — Build a TypeScript package that wraps the Firebase Admin/Client SDKs with strongly typed helpers.
  - [ ] Subtask 1.3.a: Add Firestore initialization logic that reads config from environment variables.
  - [ ] Subtask 1.3.b: Implement CRUD helpers for core entities (create/update/read/query).
  - [ ] Subtask 1.3.c: Add basic integration tests against the Firestore emulator.

- [ ] Task 1.4: Configure Firestore emulator & local env — Add emulator config and scripts for running Firestore locally.
  - [ ] Subtask 1.4.a: Add Firebase config files and emulator setup docs.
  - [ ] Subtask 1.4.b: Add npm scripts to start the emulator and seed minimal sample data.

- [ ] Task 1.VERIFY: Validate Milestone 1 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 2: AI Prompts, Config, and Spreadsheets Integration

- [ ] Task 2.1: Model configuration spreadsheets — Document how the Excel spreadsheets map to Firestore collections and config types.
  - [ ] Subtask 2.1.a: Define TypeScript interfaces for category configurations, topic tags, AI prompts, and RSS sources.
  - [ ] Subtask 2.1.b: Capture mapping rules and validation requirements in `docs/requirements/`.

- [ ] Task 2.2: Implement `packages/ai` configuration module — Create a TypeScript package for AI prompts, prompt templates, and summarization instructions.
  - [ ] Subtask 2.2.a: Add prompt templates for each content category and summarization style.
  - [ ] Subtask 2.2.b: Expose a small API for selecting prompts based on category and use-case.

- [ ] Task 2.3: Build spreadsheet parsing & validation — Implement utilities (likely in `packages/db` or a dedicated script package) to parse Excel spreadsheets and validate them against the shared types.
  - [ ] Subtask 2.3.a: Choose a Node Excel parsing library and add it as a dependency.
  - [ ] Subtask 2.3.b: Add validation logic and helpful error messages for bad rows or missing fields.

- [ ] Task 2.4: Implement Firestore seeding from spreadsheets — Create scripts to load spreadsheet data into Firestore collections in a repeatable, idempotent way.
  - [ ] Subtask 2.4.a: Seed category configurations, topic tags, and RSS sources.
  - [ ] Subtask 2.4.b: Seed AI prompt templates and related config.

- [ ] Task 2.VERIFY: Validate Milestone 2 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 3: Python Ingestion Service

- [ ] Task 3.1: Scaffold ingestion service — Create `services/ingestion` as a Python service with structured entrypoint, logging, and config loading.
  - [ ] Subtask 3.1.a: Define a simple application structure (e.g., `main.py`, `config/`, `jobs/`).
  - [ ] Subtask 3.1.b: Add configuration for Firestore access and RSS source lists.

- [ ] Task 3.2: Implement RSS/source fetchers — Add components that pull content from RSS feeds and any additional configured sources.
  - [ ] Subtask 3.2.a: Implement asynchronous HTTP fetching with robust error handling and retries.
  - [ ] Subtask 3.2.b: Normalize raw items into the shared article schema.

- [ ] Task 3.3: Write ingestion-to-Firestore pipeline — Persist normalized articles into Firestore using the canonical schema.
  - [ ] Subtask 3.3.a: Implement batch writes with backoff and rate limiting.
  - [ ] Subtask 3.3.b: Deduplicate articles by source URL or content hash.

- [ ] Task 3.4: Add basic scheduling hooks — Expose CLI or task entrypoints that scheduler/cron can call.
  - [ ] Subtask 3.4.a: Define commands for "run once" and "run continuous" modes.

- [ ] Task 3.VERIFY: Validate Milestone 3 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 4: Python Summarization Service

- [ ] Task 4.1: Scaffold summarization service — Create `services/summarization` with structure similar to ingestion, wired into `packages/ai` prompt definitions.
  - [ ] Subtask 4.1.a: Configure access to Firestore and AI provider credentials via environment variables.

- [ ] Task 4.2: Implement summarization workers — Pull unsummarized articles from Firestore, call AI APIs with the right prompts, and store summaries back.
  - [ ] Subtask 4.2.a: Implement idempotent summarization jobs and job state tracking.
  - [ ] Subtask 4.2.b: Handle rate limiting, retries, and partial failures gracefully.

- [ ] Task 4.3: Support multiple summary formats — Add support for different summary lengths/styles (e.g., bullet digest, narrative, headline-only).
  - [ ] Subtask 4.3.a: Use `packages/ai` to drive variations in prompt styles.

- [ ] Task 4.4: Expose summarization entrypoints — Provide CLI or task-level commands for the scheduler to trigger summarization runs.

- [ ] Task 4.VERIFY: Validate Milestone 4 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 5: API Backend (apps/api)

- [ ] Task 5.1: Scaffold API application — Create `apps/api` as a TypeScript API service (e.g., Node/Express or Next.js API routes) using `packages/db` for data access.
  - [ ] Subtask 5.1.a: Configure environment loading and secure handling of credentials.
  - [ ] Subtask 5.1.b: Add health check and basic observability endpoints.

- [ ] Task 5.2: Implement core read endpoints — Add read-only endpoints for feeds, summaries, and user subscriptions.
  - [ ] Subtask 5.2.a: Implement pagination and filtering (by category, topic, date).
  - [ ] Subtask 5.2.b: Add simple response caching where appropriate.

- [ ] Task 5.3: Implement basic user/session handling — Provide endpoints for managing user profiles and preferences (without full auth integration yet).

- [ ] Task 5.4: Add API tests & validation — Use a testing framework to cover core endpoints and request validation.

- [ ] Task 5.VERIFY: Validate Milestone 5 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 6: Web App (apps/web)

- [ ] Task 6.1: Scaffold web application — Create `apps/web` as a modern React/Next.js frontend that consumes `apps/api`.
  - [ ] Subtask 6.1.a: Set up routing, layout, and design system primitives.

- [ ] Task 6.2: Implement feed browsing UI — Build pages to browse summaries by category, topic, and time.
  - [ ] Subtask 6.2.a: Integrate with API read endpoints and handle loading/error states.

- [ ] Task 6.3: Implement user preferences UI — Allow users to manage their categories, topics, and notification preferences.

- [ ] Task 6.4: Add responsive & accessibility polish — Ensure layouts work across screen sizes and meet baseline a11y standards.

- [ ] Task 6.VERIFY: Validate Milestone 6 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 7: Admin App (apps/admin)

- [ ] Task 7.1: Scaffold admin application — Create `apps/admin` with layout and auth guard for internal users.

- [ ] Task 7.2: Content & config management UI — Provide interfaces to manage sources, categories, topics, and AI config.
  - [ ] Subtask 7.2.a: CRUD UI for RSS sources and category metadata.
  - [ ] Subtask 7.2.b: UI for editing AI prompts and seeding new configurations.

- [ ] Task 7.3: Monitoring & health dashboards — Add views for ingestion/summarization job status, error logs, and throughput.

- [ ] Task 7.VERIFY: Validate Milestone 7 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 8: Mobile App (apps/mobile)

- [ ] Task 8.1: Scaffold mobile application — Create `apps/mobile` (e.g., React Native or Expo) consuming the same API and shared types.

- [ ] Task 8.2: Implement core mobile UX — Build views for reading summaries, managing subscriptions, and saving favorites.

- [ ] Task 8.3: Integrate push notifications — Wire mobile notifications to the notifications service for new digests.

- [ ] Task 8.VERIFY: Validate Milestone 8 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 9: Scheduler & Notifications Services

- [ ] Task 9.1: Implement scheduler service — Create `services/scheduler` to trigger ingestion and summarization on configured cadences.
  - [ ] Subtask 9.1.a: Define schedules for each feed/category and environment-specific overrides.

- [ ] Task 9.2: Implement notifications service — Create `services/notifications` to send email/push digests based on user preferences.
  - [ ] Subtask 9.2.a: Integrate with email and push providers.
  - [ ] Subtask 9.2.b: Implement digest generation logic using summaries in Firestore.

- [ ] Task 9.3: Wire scheduler to ingestion/summarization/notifications — Ensure scheduled jobs trigger the appropriate services end-to-end.

- [ ] Task 9.VERIFY: Validate Milestone 9 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

---

### Milestone 10: End-to-End QA, Performance, and Polish

- [ ] Task 10.1: End-to-end integration tests — Implement tests that cover ingestion → summarization → API → web/mobile flows.

- [ ] Task 10.2: Performance and cost optimization — Review Firestore usage, AI calls, and infrastructure patterns to reduce latency and cost.

- [ ] Task 10.3: Security and access control review — Validate Firestore rules, API authorization, and secrets management.

- [ ] Task 10.4: Documentation and handoff — Finalize architecture docs, runbooks for each service, and onboarding guides.

- [ ] Task 10.VERIFY: Validate Milestone 10 acceptance criteria — Review all exit criteria from `acceptance-criteria.md` and confirm each is met.

