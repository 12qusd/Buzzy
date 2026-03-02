# Buzzy Today — Execution Plan & Cursor Agent Prompt

## Document Purpose

This document provides (1) a phased execution plan for building Buzzy Today and (2) a detailed prompt you can paste into Cursor to set up AI agents to implement the project. The plan is organized around the 8 milestones defined in the acceptance criteria, with each milestone broken into discrete, testable tasks.

---

## Part 1: Execution Plan

### Architecture Overview

```
buzzy-today/
├── apps/
│   ├── api/                    # Backend REST API (Node.js + Express/Fastify)
│   ├── mobile/                 # React Native mobile app
│   ├── web/                    # Next.js web app (SSR for SEO)
│   └── admin/                  # Admin panel (Next.js)
├── packages/
│   ├── shared/                 # Shared types, constants, utilities
│   ├── db/                     # Database schema, migrations, seeds (Firestore SDK)
│   └── ai/                     # AI pipeline (summarization, tag suggestion)
├── services/
│   ├── ingestion/              # RSS polling & processing (Python)
│   ├── summarization/          # AI summarization pipeline (Python)
│   ├── scheduler/              # Cron job orchestrator
│   └── notifications/          # Push & email service
├── infrastructure/
│   ├── firebase/               # Firebase config, rules, indexes
│   └── ci-cd/                  # GitHub Actions workflows
├── docs/                       # All project documentation
│   ├── architecture.md
│   ├── api-contracts.md
│   ├── data-model.md
│   ├── glossary.md
│   └── runbooks/
├── scripts/                    # Dev tooling, seed data, migration helpers
├── tests/                      # Integration & E2E tests
├── .env.example
├── package.json                # Monorepo root (Turborepo)
├── turbo.json
└── README.md
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Database | Google Firebase (Firestore) | Per meeting decision; real-time sync, scales without ops |
| Backend API | Node.js + Fastify | Fast, typed, Firebase SDK native |
| Ingestion Pipeline | Python 3.12 | RSS parsing, NLP, AI API calls |
| Summarization | Python + OpenAI API (GPT-5-nano default) | Matches existing Apps Script pipeline |
| Mobile App | React Native (Expo) | Cross-platform iOS/Android from single codebase |
| Web App | Next.js 14 (App Router) | SSR for SEO (Permanent Articles), ISR for performance |
| Admin Panel | Next.js + shadcn/ui | Internal tool, rapid development |
| Auth | Firebase Auth | Email/password + OAuth, tight Firestore integration |
| Storage | Firebase Storage + S3 (images) | Images in S3 (existing), metadata in Firestore |
| Push Notifications | Firebase Cloud Messaging (FCM) | Native integration |
| Email | SendGrid or Firebase Extensions | Transactional emails (welcome, digest) |
| Monorepo | Turborepo | Build caching, task orchestration |
| CI/CD | GitHub Actions | Staging + production deploy pipelines |
| Monitoring | Firebase Crashlytics + Cloud Logging | Error tracking, performance monitoring |

---

### Milestone 0 — Architecture & Environment Readiness

**Goal:** Technical foundation before feature work begins.

**Tasks:**

1. **Monorepo scaffold** — Initialize Turborepo with `apps/` and `packages/` structure. Configure shared TypeScript, ESLint, and Prettier configs.
2. **Firebase project setup** — Create staging and production Firebase projects. Configure Firestore, Auth, Cloud Functions, and Storage.
3. **Firestore data model** — Design and document all collections and subcollections with field types, indexes, and security rules. Core collections:
   - `users` — profile, interest graph, followed tags/categories
   - `articles` — full article record with all summary fields
   - `topic_tags` — canonical tag registry
   - `category_tags` — top-level categories with config
   - `rss_sources` — RSS feed registry
   - `buzzwords` — buzzword list
   - `signals` — user engagement events
   - `suggested_tags` — AI-suggested tags pending review
   - `reports` — user feedback reports
   - `daily_digests` — generated digest documents
4. **API contract stubs** — Define OpenAPI 3.1 spec for all endpoints. Stub routes returning mock data.
5. **CI/CD pipelines** — GitHub Actions workflows for: lint, type-check, test, build, deploy to staging on merge to `develop`, deploy to production on merge to `main`.
6. **Logging & monitoring** — Structured JSON logging in all services. Firebase Crashlytics for mobile. Cloud Logging dashboards for: RSS ingestion events, tag suggestion events, personalization signals, errors.
7. **Environment config** — `.env.example` with all required keys (Firebase, OpenAI, SendGrid, S3, Newsblur). Secrets in GitHub Actions and Firebase environment config.
8. **Documentation** — `docs/architecture.md`, `docs/data-model.md`, `docs/api-contracts.md`, `docs/glossary.md` (ported from MVVVP Glossary).

**Exit:** All environments running. API stubs respond. CI deploys to staging. Logging dashboards accessible.

---

### Milestone 1 — Content Ingestion & Tag Infrastructure

**Goal:** Stories enter the system cleanly and are tagged reliably.

**Tasks:**

1. **RSS Source Google Sheet sync** — Python service that reads the Master RSS Google Sheet (columns: Channel Name, Publisher Name, Source Link, optional Category) and syncs to Firestore `rss_sources` collection on a schedule.
2. **Universal RSS Reader** — Python service polling all active RSS feeds:
   - For new/unknown feeds: strip XML, pass to GPT to identify field mappings (title, image_url, description, content), save structure for reuse.
   - For known feeds: parse using saved structure without GPT call.
   - Store raw articles in `raw_articles` collection.
3. **Knockout filter** — Reject articles < 70 words or missing image (from Content Filtering sheet). Log rejections.
4. **Deduplication** — URL + content hash dedup. Reject duplicates before further processing.
5. **Image selection pipeline** — Three-tier priority:
   1. First image from source article meeting size criteria (≥400×300px, aspect 3:4 to 3:4.5).
   2. Buzzy Image Bank (by Category Tag).
   3. Pixabay search by Section and Category.
6. **Categorization engine** — Score articles against topic tags per category:
   - Title match: 5 points
   - Description match: 3 points
   - Content match: 1 point
   - Assign to highest-scoring Category Tag. Support optional secondary placement.
7. **Master Topic Tag table** — Seed Firestore `topic_tags` from the "Sourcing Tags Testing" sheet in the Article Sourcing spreadsheet. Fields per tag: ID, display_name, canonical_name, slug, topic_tag_type, category_id, bucket_id, created_at, related_tags.
8. **Topic Tag Suggester** — After canonical tag matching, run AI entity extraction. High-confidence unmatched entities go to `suggested_tags` queue with: term, slug, suggested bucket, proposed type, proposed category, AI confidence score.
9. **Admin tag review** — Admin panel page to approve/reject suggested tags. Approved tags write to Master Sheet and sync to Firestore.
10. **Demand Filter (Phase 1)** — Only articles with ≥1 approved tag enter candidate pool. Pool visible in admin interface.
11. **Candidate pool** — Articles passing all filters become Candidate Articles in `articles` collection with status `candidate`.

**Exit:** End-to-end demo: RSS → Tag Suggestion → Admin Approval → Candidate Pool. Zero duplicate tags. Zero duplicate stories.

---

### Milestone 2 — Mobile App Core Browser (Non-Personalized Feed)

**Goal:** Ship stable swipe-based story consumption experience.

**Tasks:**

1. **React Native project setup** — Expo with TypeScript, navigation (React Navigation), state management (Zustand or TanStack Query for server state).
2. **Story card component** — Displays: AI Headline, TL;DR (colored by Category Tag), Key Takeaways, Buzzy Take (if exists), Topic Tags, Source, AP-style dateline `(LOCATION) — Date, Time ET`.
3. **Vertical swipe navigation** — Swipe up/down to move between stories. Swipe latency ≤150ms. Preload next 3 cards asynchronously.
4. **Feed API** — Endpoint returning ranked Candidate Articles by Category Tag and Candidate Score. Pagination via cursor.
5. **Performance targets** — Time to first story ≤1.5s after app open. Cold start ≤2.5s on LTE.
6. **Session dedup** — No duplicate story within last 50 swipes per user session.
7. **Error/retry states** — API failure shows retry UI within 1 second.
8. **Bookmark system** — Bookmark/unbookmark action. Persists to Firestore `users/{uid}/bookmarks`. Bookmark list view accessible from profile.
9. **Source link** — Tap publisher name to open original article in in-app browser.
10. **Category Tag and Topic Tag display** — Category Tag shown with category color. Topic Tags shown as tappable chips.

**Exit:** Tested on 2 Android + 2 iOS devices. No critical/high bugs. Performance benchmarks documented.

---

### Milestone 3 — Topic Tag Browser & Following

**Goal:** Topic tags become a first-class user interaction object.

**Tasks:**

1. **Tag search** — Search endpoint with prefix matching and fuzzy search across canonical names and synonyms.
2. **Topic Tag Page** — Dedicated page per tag: description, related stories, related tags. Unique slug-based URL. Loads ≤1.5s.
3. **Follow/unfollow** — Persists to `users/{uid}/followed_tags`. Reflected in backend within 5 seconds.
4. **Category follow** — Same mechanism for Category Tags in `users/{uid}/followed_categories`.
5. **Tag cloud browser** — Visual browsable tag explorer grouped by Category.
6. **Deep linking** — URLs like `/tech/topics/artificial-intelligence` resolve to correct tag page on web and deep-link into mobile app.
7. **Slug enforcement** — Unique slug per tag at database level. Synonyms redirect via 301.

**Exit:** Follow action reflected in backend within 5s. No duplicate topic pages. Demo: Follow → Tag influences feed.

---

### Milestone 4 — Personalization Signals & Ranking

**Goal:** Activate personalization engine using structured signals.

**Tasks:**

1. **Signal capture** — Log all user actions to Firestore `signals` collection:
   - Swipe depth %, time on story, like, comment, bookmark, share, source click, follow tag
   - Each signal stored with: user_id, article_id, signal_type, value, timestamp
2. **User Interest Graph** — Weighted graph in `users/{uid}/interest_graph`:
   - Impression: +0, Click: +1, Tap: +2, Scroll: +3, Like: +5, Comment: +8, Share: +10, Follow Topic: +20, Follow Category: +15
   - Topic Tags get stronger weight than Category Tags.
3. **Time decay** — 5% weekly decay on tag weights (configurable). Run as scheduled Cloud Function.
4. **Ranking algorithm** — `Article Score × User Topic Match × Freshness`. Changes reflected within next 5 stories.
5. **Freshness window** — Configurable period preventing repeat stories per user session.
6. **Admin-configurable weights** — Personalization weights editable in admin panel.
7. **Reporting signals** — Signals queryable in admin dashboard.

**Exit:** Demo: Follow tag → Feed changes measurably. Signals visible in reporting. Ranking logic documented.

---

### Milestone 5 — Demand Filter & Publishing Quotas (Full Version)

**Goal:** Content supply is controlled and balanced.

**Tasks:**

1. **Publishing quotas** — Daily limits per Category Tag. Configurable in admin panel.
2. **Demand filter (full)** — Three priority rules:
   1. Article matches a Topic Tag followed by a user → ingest.
   2. Article matches a Buzzword → ingest.
   3. Article fills a remaining Category quota → ingest.
3. **Random injection** — Configurable % of random/serendipity content in feeds.
4. **Admin quota dashboard** — Shows per-category: ingested count, filtered out, published, quota utilization %.
5. **F&E Algorithm** — `(View pts + Like pts + Comment pts + Share pts + Buzzword score) / (days + 1)`. Calculated once at ingestion, stored immutably.
6. **Candidate → Permanent promotion** — Articles crossing engagement threshold (default 10 pts: click=1, comment=5, share=10) become Permanent Articles. Generate SEO-optimized Article Page with permalink.
7. **Parameter change auditing** — All quota/filter changes logged with timestamp + user. Take effect ≤60 seconds.

**Exit:** System respects quotas for 48-hour test. Dashboard shows accurate metrics.

---

### Milestone 6 — Notifications & Onboarding

**Goal:** Complete user lifecycle entry and re-engagement.

**Tasks:**

1. **Onboarding flow** — Max 5 screens explaining: swiping, following tags, personalization. User must follow ≥3 tags before entering feed. Does not reappear after completion.
2. **Intro screens** — "Swipe through today's buzz one story at a time", "Get the facts fast", "News without the noise is in TLDDR", "Understanding seconds built around you", "Follow topics. We'll handle the rest."
3. **Welcome email** — Sent within 60 seconds of signup via SendGrid. Contains product explanation + manage preferences link.
4. **Push notification system** — FCM integration. User can opt in/out separately for push and email. Daily push cap configurable.
5. **Email/notification preferences** — Toggle between off, daily digest, immediate alerts per Category/Topic Tag. Toggle for comment reply notifications.
6. **Daily Digest generation** — Scheduled Cloud Function generating digest with: What's Buzzy narrative, Top 5 Stories, What People Are Saying, By Category, Buzzy Moment, Why This Matters. Static URL by date.

**Exit:** End-to-end demo: Signup → Onboarding → Follow tags → Feed → Welcome email → Push. No push beyond daily cap.

---

### Milestone 7 — Reporting & Production Readiness

**Goal:** Operational readiness for launch.

**Tasks:**

1. **Analytics dashboard** — DAU, MAU, avg session time, stories per session, top topic tags, push open rate. Data delay ≤15 minutes.
2. **CSV export** — All report types exportable: Publisher Report, User Report, Comment Report, Article Report (columns as specified in MVVVP Reporting section).
3. **Regression test suite** — Automated tests for: feed rendering, tag follow, bookmark, signal logging, ingestion pipeline, summarization.
4. **Performance benchmarks** — Documented and repeatable benchmarks for all critical paths.
5. **User feedback form** — Accessible from article view and app menu. Supports report article, report comment, suggest improvement. Logs to Firestore and syncs to admin Google Sheet.
6. **Homepage (Personalized Feed)** — Continuous feed of Content Clumps. What's Buzzy, Topic Tag clumps, Category Tag clumps, Trending, Latest. No tag soup (1 clump per tag max). Tag Ticker at top.
7. **Admin operations** — Full admin panel: RSS source management, Topic Tag CRUD, Buzzword management, blacklisted tags, AI prompt variable editing (per-category: tone, headline style, reading level, hedge level, buzzy take style, emoji allowance, and global: TLDR length, takeaway length).

**Exit:** 7-day soft launch test with no critical regressions. Production signoff checklist completed.

---

### AI Summarization Pipeline (Cross-Milestone)

The summarization pipeline runs as a Python service and is wired in during Milestone 1 but refined throughout.

**Configuration (from Article Sourcing & Summarization System spreadsheet):**

- **Model:** GPT-5-nano (default, configurable)
- **Global params:** 7 SEO keywords, TLDR 12-26 words, Takeaways 21-30 words
- **Per-category params** (from Buzzy Categories Master → Subcategory Mapping NEW):
  - Section, Category, Keywords, RSS Channel, Publisher, RSS Feed, Sources
  - Topic Tags (comma-separated canonical list)
  - Tone, Headline Guide, Reading Level, Hedge Level, Buzzy Take Style, Emojis Allowed
  - Image URLs (fallback Pixabay URLs)
- **System prompt:** Uses the master prompt from `MAIN - Article Summaries` sheet cell A8
- **User prompt template:** Uses template from cell B8 with `{article_title}`, `{article_content}`, `{source}`, `{publication_date}` placeholders

**Output per article:**
- AI Headline
- TL;DR
- Key Takeaways (3 bullets)
- Buzzy Take
- SEO Keywords
- Meta Description
- Topic Tags (2-3 suggested)
- Snappy Sentence (thumbnail view)

---

### Cron Schedule (from Buzzy Categories Master → Chron Job Frequency)

| Category | RSS Pull | Publish |
|----------|---------|---------|
| Breaking News / Latest News | Every 2 hours | 1 hour after import |
| Tech | Every 6 hours | 3 hours after import |
| Science | Daily noon PST | 6 hours after import |
| Health | Daily 6pm PST | 6 hours after import |
| Sports | Every 6 hours | 2 hours after import |
| Entertainment | Every 6 hours | 6 hours after import |
| Politics | Every 6 hours | 2 hours after import |
| Money | Every 6 hours | varies |
| Markets | Every 30 min | 30 min after import |

---

## Part 2: Cursor Agent Prompt

Copy everything below this line and paste it as the system prompt / project instructions in Cursor.

---

```
# BUZZY TODAY — CURSOR AGENT INSTRUCTIONS

You are building Buzzy Today, a fast, social, human-first digital news platform with hyper-personalization. This is a production application. Write production-quality code with comprehensive documentation, type safety, error handling, logging, and tests.

## PROJECT CONTEXT

Buzzy Today ingests news from RSS feeds, uses AI to summarize articles, personalizes feeds based on user behavior, and promotes high-engagement content. The platform has a mobile app, web app, and admin panel.

You have access to these reference documents:
- **Buzzy MVVVP Overview** — Complete product requirements
- **Buzzy Milestone Acceptance Criteria** — Engineering milestones and exit criteria
- **Buzzy Specs Meeting Notes + Transcript** — Clarifications on architecture decisions
- **Copy of Buzzy Categories Master.xlsx** — Category configuration, topic tags per category, prompt tuning variables, cron frequencies, content filtering rules
- **Copy of Article Sourcing & Summarization System.xlsx** — AI prompts, model config, token logging, RSS sources, article output schema

## TECHNOLOGY STACK

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Database | Google Firebase Firestore |
| Auth | Firebase Auth |
| Backend API | Node.js + Fastify + TypeScript |
| Ingestion Pipeline | Python 3.12 |
| AI Summarization | Python + OpenAI API (GPT-5-nano default) |
| Mobile App | React Native (Expo) + TypeScript |
| Web App | Next.js 14 (App Router) + TypeScript |
| Admin Panel | Next.js + shadcn/ui + TypeScript |
| Push Notifications | Firebase Cloud Messaging |
| Email | SendGrid |
| Image Storage | AWS S3 (existing) + Firebase Storage |
| CI/CD | GitHub Actions |
| Testing | Vitest (unit), Playwright (E2E), pytest (Python) |

## PROJECT STRUCTURE

```
buzzy-today/
├── apps/
│   ├── api/                    # Fastify REST API
│   │   ├── src/
│   │   │   ├── routes/         # Route handlers by domain
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/      # Auth, logging, rate limiting
│   │   │   ├── validators/     # Zod schemas for request validation
│   │   │   └── index.ts
│   │   ├── tests/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── mobile/                 # React Native (Expo)
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── navigation/
│   │   │   ├── stores/         # Zustand stores
│   │   │   └── utils/
│   │   └── package.json
│   ├── web/                    # Next.js web app
│   │   ├── src/
│   │   │   ├── app/            # App Router pages
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── package.json
│   └── admin/                  # Admin panel
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── services/
│       └── package.json
├── packages/
│   ├── shared/                 # Shared types, constants, utils
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces for all entities
│   │   │   ├── constants/      # Category colors, signal weights, etc
│   │   │   ├── utils/          # Slug generation, scoring formulas
│   │   │   └── index.ts
│   │   └── package.json
│   ├── db/                     # Firestore schema, rules, indexes, seeds
│   │   ├── firestore.rules
│   │   ├── firestore.indexes.json
│   │   ├── seeds/
│   │   └── package.json
│   └── ai/                     # AI pipeline shared code
│       ├── prompts/            # System & user prompt templates
│       ├── config/             # Model settings, category overrides
│       └── package.json
├── services/
│   ├── ingestion/              # Python RSS ingestion
│   │   ├── src/
│   │   │   ├── rss_reader.py
│   │   │   ├── knockout.py
│   │   │   ├── dedup.py
│   │   │   ├── image_selector.py
│   │   │   ├── categorizer.py
│   │   │   ├── demand_filter.py
│   │   │   ├── tag_suggester.py
│   │   │   ├── normalizer.py
│   │   │   └── pipeline.py     # Orchestrates full pipeline
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── summarization/          # Python AI summarization
│   │   ├── src/
│   │   │   ├── prompt_builder.py
│   │   │   ├── summarizer.py
│   │   │   ├── post_processor.py
│   │   │   └── pipeline.py
│   │   ├── tests/
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── scheduler/              # Cron job orchestrator
│   │   └── src/
│   │       ├── jobs/           # Individual job definitions
│   │       └── scheduler.ts
│   └── notifications/          # Push & email
│       └── src/
│           ├── push.ts
│           ├── email.ts
│           └── templates/
├── infrastructure/
│   ├── firebase/
│   │   ├── firebase.json
│   │   ├── .firebaserc
│   │   └── functions/          # Cloud Functions
│   └── ci-cd/
│       └── .github/workflows/
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── api-contracts.md
│   ├── glossary.md
│   └── runbooks/
├── scripts/
│   ├── seed-categories.ts      # Seed from Buzzy Categories Master
│   ├── seed-tags.ts            # Seed from Sourcing Tags Testing
│   ├── seed-rss-sources.ts     # Seed from spreadsheet
│   └── sync-sheets.py          # Google Sheets → Firestore sync
├── .env.example
├── package.json
├── turbo.json
├── tsconfig.base.json
└── README.md
```

## FIRESTORE DATA MODEL

### Collection: `users`
```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  username: string;
  displayName: string;
  location?: string;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  notificationPreferences: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    dailyDigest: boolean;
    commentReplies: boolean;
    perTag: Record<string, 'off' | 'daily' | 'immediate'>;
    perCategory: Record<string, 'off' | 'daily' | 'immediate'>;
    dailyPushCap: number;
  };
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  loginCount: number;
}
// Subcollections: bookmarks, followed_tags, followed_categories, interest_graph, signals
```

### Collection: `articles`
```typescript
interface Article {
  id: string;
  status: 'raw' | 'potential_candidate' | 'candidate' | 'permanent';
  
  // Source data
  sourceTitle: string;
  sourceContent: string;
  sourceUrl: string;
  sourcePublisher: string;
  sourcePublishedAt: Timestamp;
  sourceImageUrl?: string;
  rssFeedUrl: string;
  
  // Classification
  sectionName: string;
  categoryTagId: string;
  categoryTagName: string;
  categoryColor: string;
  topicTagIds: string[];
  topicTagNames: string[];
  seoTags: string[];
  
  // AI-generated summary
  aiHeadline: string;
  tldr: string;
  keyTakeaways: string[];        // 3 items
  buzzyTake?: string;
  snappySentence: string;
  metaDescription: string;
  seoKeywords: string[];
  
  // Scoring
  candidateScore: number;
  buzzwordScore: number;
  engagementScore: number;       // F&E algorithm result
  permanentArticlePoints: number;
  
  // Engagement counters
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  
  // Image
  imageUrl: string;
  imageSource: 'original' | 'buzzy_bank' | 'pixabay';
  
  // SEO (for Permanent Articles)
  slug?: string;
  permalink?: string;
  schemaMarkup?: object;
  openGraphTags?: object;
  twitterCardTags?: object;
  
  // Location/dateline
  location?: string;
  dateline?: string;             // AP style: "(NEW YORK) — Jan. 20, 2026, 11:12 a.m. ET"
  
  // Metadata
  contentHash: string;           // For deduplication
  summarizationModel: string;
  createdAt: Timestamp;
  publishedAt?: Timestamp;
  promotedAt?: Timestamp;        // When became Permanent
}
```

### Collection: `topic_tags`
```typescript
interface TopicTag {
  id: string;
  displayName: string;
  canonicalName: string;
  slug: string;                  // Unique, URL-safe
  topicTagType: TopicTagType;    // Person, Company, Technology, etc.
  categoryId: string;
  categoryName: string;
  bucketId: string;
  bucketName: string;
  description?: string;
  synonyms: string[];
  followerCount: number;
  articleCount: number;
  relatedTagIds: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Collection: `category_tags`
```typescript
interface CategoryTag {
  id: string;
  name: string;                  // "Tech", "Sports", etc.
  sectionName: string;           // Parent section
  color: string;                 // Hex color from Categories Master
  slug: string;
  permalink: string;
  newsblurFeedUrl?: string;
  
  // Summarization config (from Subcategory Mapping NEW)
  summarizationConfig: {
    tone: string;
    headlineGuide: string;
    readingLevel: string;
    hedgeLevel: string;
    buzzyTakeStyle: string;
    emojisAllowed: boolean;
    fallbackImageUrls: string[];
  };
  
  // Publishing config
  publishingQuota: number;       // Daily article limit
  pullFrequency: string;         // Cron expression
  publishFrequency: string;
  
  followerCount: number;
  isActive: boolean;
  createdAt: Timestamp;
}
```

### Collection: `rss_sources`
```typescript
interface RssSource {
  id: string;
  channelName: string;
  publisherName: string;
  feedUrl: string;
  assignedCategoryId?: string;
  tagBasedClassification: boolean;
  feedStructure?: {              // Cached AI-detected structure
    titleField: string;
    imageUrlField: string;
    descriptionField: string;
    contentField: string;
  };
  lastPollAt?: Timestamp;
  lastSuccessAt?: Timestamp;
  failureCount: number;
  isActive: boolean;
  createdAt: Timestamp;
}
```

### Collection: `signals`
```typescript
interface Signal {
  id: string;
  userId: string;
  articleId: string;
  signalType: 'impression' | 'click' | 'tap' | 'scroll' | 'like' | 'comment' | 'share' | 'bookmark' | 'source_click' | 'follow_tag' | 'follow_category';
  value?: number;                // e.g., scroll depth %, time in seconds
  weight: number;                // From weighting model
  topicTagIds: string[];         // Tags on the article (for graph propagation)
  categoryTagId: string;
  timestamp: Timestamp;
}
```

### Collection: `suggested_tags`
```typescript
interface SuggestedTag {
  id: string;
  term: string;
  normalizedSlug: string;
  suggestedBucket: string;
  proposedTagType: string;
  proposedCategoryId: string;
  aiConfidenceScore: number;
  sourceArticleId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
}
```

### Collection: `buzzwords`
```typescript
interface Buzzword {
  id: string;
  term: string;
  isActive: boolean;
  createdAt: Timestamp;
}
```

### Collection: `daily_digests`
```typescript
interface DailyDigest {
  id: string;                    // Date-based: "2026-03-01"
  date: string;
  url: string;                   // "/whats-buzzy/2026-03-01"
  whatsNarrative: string;        // 2-3 sentence overview
  top5Stories: Array<{
    articleId: string;
    headline: string;
    whyItBlewUp: string;
    categoryName: string;
    categoryColor: string;
    thumbnailUrl: string;
  }>;
  whatPeopleAreSaying: string[];  // 2-4 bullet insights
  byCategory: Array<{
    categoryName: string;
    summary: string;
    articleId: string;
  }>;
  buzzyMoment: string;           // 1-2 sentences
  whyThisMatters: string;        // Pattern recognition
  generatedAt: Timestamp;
  isPublic: boolean;             // Internal-only initially
}
```

### Collection: `user_reports`
```typescript
interface UserReport {
  id: string;
  userId: string;
  reportType: 'report_article' | 'report_comment' | 'improvement_general';
  targetType: 'article' | 'comment' | 'none';
  targetId?: string;
  reasonSelected: string;
  description?: string;
  sourceLocation: string;
  createdAt: Timestamp;
}
```

## API ENDPOINTS

Design RESTful endpoints under these route groups:

### Articles
- `GET /api/articles/feed` — Personalized feed (query: category, limit, cursor, userId)
- `GET /api/articles/:id` — Single article detail
- `GET /api/articles/category/:categorySlug` — Articles by category
- `GET /api/articles/tag/:tagSlug` — Articles by topic tag
- `GET /api/articles/trending` — Trending articles
- `GET /api/articles/latest` — Latest articles
- `POST /api/articles/:id/like` — Like article
- `POST /api/articles/:id/share` — Record share signal
- `POST /api/articles/:id/bookmark` — Bookmark/unbookmark

### Topic Tags
- `GET /api/tags/search?q=` — Search tags
- `GET /api/tags/:slug` — Tag detail page (description, related stories, related tags)
- `GET /api/tags/trending` — Trending tags
- `GET /api/tags/category/:categoryId` — Tags in category
- `POST /api/tags/:id/follow` — Follow/unfollow tag

### Categories
- `GET /api/categories` — List all categories with metadata
- `GET /api/categories/:slug` — Category detail
- `POST /api/categories/:id/follow` — Follow/unfollow category

### Users
- `GET /api/users/me` — Current user profile + interest graph summary
- `PUT /api/users/me` — Update profile
- `GET /api/users/me/bookmarks` — User bookmarks
- `GET /api/users/me/feed` — Personalized home feed
- `PUT /api/users/me/notifications` — Update notification preferences
- `POST /api/users/me/onboarding` — Complete onboarding

### Signals
- `POST /api/signals` — Batch record engagement signals

### Comments
- `GET /api/articles/:id/comments` — List comments
- `POST /api/articles/:id/comments` — Create comment
- `POST /api/comments/:id/like` — Like comment

### Admin
- `GET /api/admin/rss-sources` — List RSS sources
- `POST /api/admin/rss-sources` — Add RSS source
- `GET /api/admin/suggested-tags` — List pending tag suggestions
- `POST /api/admin/suggested-tags/:id/approve` — Approve tag
- `POST /api/admin/suggested-tags/:id/reject` — Reject tag
- `GET /api/admin/dashboard` — Dashboard metrics (ingested, filtered, published, quotas)
- `PUT /api/admin/quotas/:categoryId` — Update publishing quota
- `PUT /api/admin/summarization-config/:categoryId` — Update AI config
- `GET /api/admin/reports/:type` — Generate report (publisher, user, comment, article)
- `GET /api/admin/reports/:type/export` — CSV export

### Daily Digest
- `GET /api/digest/:date` — Get digest by date
- `GET /api/digest/latest` — Latest digest

## CODING STANDARDS

### General
- TypeScript strict mode everywhere
- All functions must have JSDoc comments with `@param`, `@returns`, and `@throws`
- All API endpoints must validate input with Zod schemas
- All database operations must be wrapped in try/catch with structured error logging
- Use dependency injection pattern for testability
- No `any` types — use `unknown` and narrow with type guards
- Constants in `packages/shared/src/constants/`

### File naming
- Components: `PascalCase.tsx` (e.g., `StoryCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useFeed.ts`)
- Services: `camelCase.ts` (e.g., `articleService.ts`)
- Types: `camelCase.types.ts` (e.g., `article.types.ts`)
- Tests: `*.test.ts` or `*.spec.ts` co-located with source
- Python: `snake_case.py`

### Documentation requirements
- Every module gets a header comment explaining purpose and dependencies
- Every non-trivial function gets JSDoc/docstring
- Every API endpoint gets OpenAPI documentation
- README.md in every `apps/` and `services/` directory
- Architecture decisions documented in `docs/`

### Error handling
- Custom error classes extending a base `BuzzyError`
- HTTP errors use standard status codes with structured JSON body
- All async operations have timeout handling
- Circuit breaker pattern for external API calls (OpenAI, RSS feeds)

### Testing
- Unit tests for all business logic (services, utils, scoring)
- Integration tests for API endpoints
- E2E tests for critical user flows
- Python: pytest with fixtures for ingestion pipeline
- Minimum 80% coverage on business logic

### Logging
- Structured JSON logging (winston for Node, structlog for Python)
- Log levels: error, warn, info, debug
- Required context: timestamp, service_name, request_id, user_id (if applicable)
- Never log PII or API keys

## SIGNAL WEIGHTS (from MVVVP User Interest Graph)

```typescript
export const SIGNAL_WEIGHTS = {
  impression: 0,
  click: 1,
  tap: 2,
  scroll: 3,
  like: 5,
  comment: 8,
  share: 10,
  follow_topic: 20,
  follow_category: 15,
} as const;
```

## PERMANENT ARTICLE PROMOTION POINTS

```typescript
export const PROMOTION_POINTS = {
  click: 1,
  comment: 5,
  share: 10,
  threshold: 10,  // Configurable per Category Tag
} as const;
```

## CATEGORY CONFIGURATION

Seed the following top-level categories from the Buzzy Categories Master spreadsheet:

| Category | Color | Permalink |
|----------|-------|-----------|
| Tech | #3C82F6 | /tech |
| Science | #10B981 | /science |
| Health | #8554F6 | /health |
| Sports | #F59E09 | /sports |
| Entertainment | #EC4999 | /entertainment |
| Politics | #6467F1 | /politics |
| Money | #059669 | /money |
| Crypto | (from sheet) | /crypto |
| World | (from sheet) | /world |
| Good News | (from sheet) | /good-news |
| Markets | (from sheet) | /markets |
| News | (from sheet) | /news |
| Lifestyle | (from sheet) | /lifestyle |

Each category has subcategories (from the Subcategories sheet) which map to Category Tags in the taxonomy.

## AI SUMMARIZATION CONFIG

The summarization system uses a two-part prompt:
1. **System prompt** — Defines Buzzy's summarization style, output format, and rules
2. **User prompt** — Template with article data injected

Global parameters (from MAIN sheet):
- Model: gpt-5-nano
- SEO keywords: 7
- TLDR words: 12-26
- Takeaways words: 21-30

Per-category overrides (from Subcategory Mapping NEW sheet):
- Tone, Headline Guide, Reading Level, Hedge Level, Buzzy Take Style, Emojis Allowed

The system prompt and user prompt templates are stored in the spreadsheet and should be loaded from Firestore config at runtime, NOT hardcoded.

## CONTENT FILTERING RULES (from Content Filtering sheet)

Knockout rules:
- No image → knockout
- Text < 70 words → knockout

Scoring rules:
- Story has keyword from keyword column → 1 point per keyword

## IMPLEMENTATION ORDER

Follow this sequence. Each milestone must pass its acceptance criteria before moving to the next.

### Phase 1: Milestone 0 (Architecture)
1. Initialize Turborepo monorepo
2. Set up Firebase projects (staging + prod)
3. Create Firestore data model with all collections above
4. Write Firestore security rules
5. Stub all API routes with mock responses
6. Set up GitHub Actions CI/CD (lint → typecheck → test → build → deploy)
7. Configure structured logging
8. Write architecture and data model docs
9. Create .env.example with all required keys

### Phase 2: Milestone 1 (Ingestion)
1. Build Google Sheets → Firestore sync script for RSS sources
2. Implement universal RSS reader (Python) with AI feed structure detection
3. Build knockout filter
4. Build deduplication service (URL + content hash)
5. Build image selection pipeline (source → Buzzy Bank → Pixabay)
6. Build categorization engine (topic tag scoring)
7. Seed topic tags from spreadsheet
8. Build AI tag suggester
9. Build admin tag review page
10. Build demand filter (Phase 1 — require ≥1 approved tag)
11. Build AI summarization pipeline using the master prompt
12. Wire up full ingestion pipeline end-to-end
13. Write integration tests for entire pipeline

### Phase 3: Milestone 2 (Mobile Core)
1. Initialize Expo project with TypeScript
2. Build story card component
3. Build vertical swipe navigation
4. Build feed API endpoint with ranking
5. Implement preloading and performance optimizations
6. Build bookmark system
7. Build source link handler
8. Test on 2 Android + 2 iOS devices

### Phase 4: Milestone 3 (Tags)
1. Build tag search API
2. Build Topic Tag Page (web + mobile)
3. Build follow/unfollow system
4. Build tag cloud browser
5. Set up deep linking

### Phase 5: Milestone 4 (Personalization)
1. Build signal capture system
2. Build User Interest Graph
3. Implement time decay (scheduled function)
4. Build ranking algorithm
5. Build freshness window
6. Build admin weight configuration

### Phase 6: Milestone 5 (Quotas)
1. Build full demand filter with 3-tier priority
2. Build publishing quota system
3. Build admin quota dashboard
4. Build Candidate → Permanent promotion logic
5. Build F&E algorithm

### Phase 7: Milestone 6 (Onboarding & Notifications)
1. Build onboarding flow
2. Build welcome email
3. Set up FCM push notifications
4. Build notification preferences
5. Build Daily Digest generation

### Phase 8: Milestone 7 (Launch Readiness)
1. Build analytics dashboard
2. Build CSV export for all report types
3. Build user feedback form
4. Build Homepage personalized feed with Content Clumps
5. Build full admin panel
6. Write regression test suite
7. Run 7-day soft launch test
8. Document all runbooks

## ENV VARIABLES NEEDED

```
# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_KEY=    # JSON key for admin SDK

# OpenAI
OPENAI_API_KEY=

# Google Sheets
GOOGLE_SHEETS_SERVICE_ACCOUNT=   # For Sheets API access
BUZZY_CATEGORIES_SHEET_ID=
ARTICLE_SOURCING_SHEET_ID=
RSS_MASTER_SHEET_ID=
TOPIC_TAG_MASTER_SHEET_ID=

# AWS S3 (existing image storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Pixabay
PIXABAY_API_KEY=

# Newsblur
NEWSBLUR_USERNAME=
NEWSBLUR_PASSWORD=

# App Config
NODE_ENV=development
API_PORT=3001
LOG_LEVEL=debug
```

## CRITICAL REMINDERS

1. **Firebase, not PostgreSQL** — All data lives in Firestore. Design for document-based queries, not relational joins. Use subcollections for one-to-many relationships.
2. **Prompts are config, not code** — AI prompts and per-category summarization variables must be stored in Firestore and editable via admin panel. Never hardcode prompts.
3. **Topic Tags are canonical** — Each tag has one canonical form. Plurals and synonyms map to the canonical tag via a synonym table. No freeform tag creation during ingestion.
4. **Slugs must be unique** — Enforce at database level. Format: lowercase, hyphen-separated, URL-safe.
5. **SEO matters for Permanent Articles** — Permanent Articles get full SSR pages with schema.org markup, Open Graph, Twitter Cards, and sitemap entries.
6. **Engagement drives everything** — The User Interest Graph is the foundation of personalization. Every user action should generate a signal.
7. **No tag soup** — Homepage limits 1 Content Clump per Tag at a time.
8. **AP-style dateline** — Format: `(NEW YORK) — Jan. 20, 2026, 11:12 a.m. ET` above the TLDR.
9. **Category colors** — TL;DR text and category badges use the hex color from the Categories Master sheet.
10. **Acceptance criteria are gates** — Each milestone has explicit acceptance criteria. Code is not "done" until all criteria are validated.

## GETTING STARTED

Begin with Milestone 0. Create the monorepo, Firebase project, data model, and API stubs. After each milestone, verify against the acceptance criteria in the Milestone Acceptance Criteria document before proceeding.

When implementing the ingestion pipeline, refer to the Buzzy Categories Master spreadsheet for the exact category configurations, topic tags, RSS feeds, and prompt tuning variables. When implementing summarization, use the prompts from the Article Sourcing & Summarization System spreadsheet.

Ask me if you need any API keys, credentials, or clarification on requirements.
```

---

## Appendix: Quick Reference

### Key Spreadsheet Tabs

**Buzzy Categories Master:**
- `Top Level Categories` — Category names, colors, Newsblur feeds, permalinks
- `Chron Job Frequency` — Pull and publish schedules per category
- `Subcategory Mapping NEW` — Full per-category config: RSS feeds, topic tags, tone, headline guide, reading level, hedge level, buzzy take style, emoji rules, image URLs
- `Content Filtering` — Knockout rules (no image, <70 words) and scoring rules

**Article Sourcing & Summarization System:**
- `MAIN - Article Summaries` — System prompt (A8), user prompt (B8), model config (A4-F4)
- `Token Log` — Historical token usage and costs
- `Model Pricing` — Available models and per-token costs
- `Article Sourcing` — RSS feed run history
- `Sourcing Tags Testing` — Full topic tag lists per category with new tag candidates
- `Schedule` — Pull and publish frequency per category
- `Test sheet` — Sample article outputs showing all generated fields
