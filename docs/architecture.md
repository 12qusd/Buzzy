# Buzzy Today — Architecture Overview

## System Architecture

Buzzy Today is a monorepo-based platform with four main application layers and supporting services:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Mobile   │  │   Web    │  │  Admin   │              │
│  │  (Expo)   │  │(Next.js) │  │(Next.js) │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼──────────────┼─────────────┼────────────────────┘
        │              │             │
        └──────────────┼─────────────┘
                       │
┌──────────────────────┼──────────────────────────────────┐
│                 API Layer (Fastify)                      │
│  Routes → Validators (Zod) → Services → Firestore       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┼──────────────────────────────────┐
│              Data & Services Layer                       │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Firestore  │  │  Ingestion   │  │Summarization │     │
│  │ (Database) │  │  (Python)    │  │  (Python)    │     │
│  └───────────┘  └──────────────┘  └──────────────┘     │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firebase  │  │  Scheduler   │  │Notifications │     │
│  │   Auth     │  │  (Cron)      │  │ (FCM/Email)  │     │
│  └───────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Firestore (not SQL)** — Document-based, denormalized data model. Subcollections for one-to-many (bookmarks, comments, interest graph). No complex joins.

2. **Monorepo with Turborepo** — Shared types and constants across all TypeScript apps. Build caching and task orchestration.

3. **Python ingestion/summarization** — RSS parsing, NLP, and OpenAI API calls in Python 3.12. Communicates with Firestore via Firebase Admin SDK.

4. **Prompts are config** — AI prompts and per-category summarization variables stored in Firestore, editable via admin panel. Never hardcoded.

5. **Topic Tags are canonical** — One canonical form per tag. Synonyms map to canonical. No freeform creation during ingestion.

6. **Signal-driven personalization** — Every user action generates a signal feeding the Interest Graph, which drives ranked feed personalization.

## Data Flow

### Ingestion Pipeline
```
RSS Feeds → Universal Reader → Knockout Filter → Dedup →
Image Selection → Categorization → Demand Filter →
Normalization → Summarization → Candidate Article
```

### User Engagement Loop
```
User browses → Signals captured → Interest Graph updated →
Feed re-ranked → Articles promoted (Candidate → Permanent)
```
