# Buzzy Today

A fast, social, human-first digital news platform. AI-summarized stories with TL;DRs, key takeaways, and personalized feeds — news without the noise.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + npm workspaces |
| Database | Google Firebase Firestore |
| Auth | Firebase Auth |
| Backend API | Node.js + Fastify + TypeScript |
| Ingestion | Python 3.12 (feedparser, httpx, BeautifulSoup) |
| AI Summarization | Python + OpenAI API (GPT-5-nano) |
| Web | Next.js 14 (App Router) + Tailwind CSS |
| Mobile | React Native (Expo) + TypeScript + Zustand |
| Admin | Next.js + shadcn-style components + Tailwind CSS |
| Scheduler | TypeScript cron job orchestrator |
| Testing | Vitest (TypeScript), pytest (Python) |

## Project Structure

```
buzzy-today/
├── apps/
│   ├── api/          # Fastify REST API (port 3001)
│   ├── web/          # Next.js web app (port 3000)
│   ├── mobile/       # React Native Expo app
│   └── admin/        # Next.js admin panel (port 3002)
├── packages/
│   ├── shared/       # Shared types, constants, utilities, seed data
│   ├── db/           # Firestore schema, rules, indexes
│   └── ai/           # AI pipeline shared code
├── services/
│   ├── ingestion/    # Python RSS ingestion pipeline
│   ├── summarization/# Python AI summarization pipeline
│   ├── scheduler/    # Cron job orchestrator
│   └── notifications/# Push & email notifications
├── config/           # Category configs, cron schedules, topic tags
├── docs/requirements/ # Product specs, acceptance criteria, architecture
└── scripts/          # Dev tooling, seed scripts
```

## Getting Started

### Prerequisites

- Node.js >= 20
- Python 3.12
- npm 11+

### Install & Run

```bash
# Install all dependencies
npm install

# Install Python dependencies
pip install -r services/ingestion/requirements.txt --break-system-packages
pip install -r services/summarization/requirements.txt --break-system-packages

# Copy env file and fill in values (see below)
cp .env.example .env.local

# Run API + web app in development
npx turbo dev --filter=@buzzy/api --filter=@buzzy/web
```

The API runs on `http://localhost:3001` and the web app on `http://localhost:3000`.

Seed data is enabled by default (`USE_SEED_DATA=true`) so you can browse the app without Firebase credentials. Visit `http://localhost:3000/browser` for the full-card scroll feed.

### Environment Variables

Copy `.env.example` to `.env.local`. The minimum for local development:

```
USE_SEED_DATA=true
NEXT_PUBLIC_API_URL=http://localhost:3001
BUZZY_API_URL=http://localhost:3001
```

For full functionality you also need:

| Variable | Required For |
|----------|-------------|
| `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, etc. | Firestore persistence, auth |
| `OPENAI_API_KEY` | AI summarization pipeline |
| `PIXABAY_API_KEY` | Fallback image search (Tier 3) |
| `SENDGRID_API_KEY` | Email notifications / digest |

### Running Tests

```bash
# All TypeScript tests (Vitest)
npx turbo test

# Typecheck all workspaces
npx turbo typecheck

# Python ingestion tests
cd services/ingestion && python3 -m pytest tests/ -v

# Python summarization tests
cd services/summarization && python3 -m pytest tests/ -v
```

**Test coverage:** 276 total tests (151 API + 30 shared + 17 scheduler + 78 Python).

## Key Features

### Buzzy Browser (`/browser`)
Full-card vertical-scroll feed mirroring the mobile swipe experience. CSS scroll-snap navigation, category filtering, keyboard controls (arrow keys / j/k), infinite scroll via IntersectionObserver, and session dedup.

### Homepage (`/`)
Server-rendered homepage with content clumps (What's Buzzy, trending, category highlights), tag ticker, and browse-by-category grid.

### Article Pages (`/article/[slug]`)
SEO-optimized article detail pages with structured data (schema.org), Open Graph tags, TL;DR, key takeaways, buzzy take, topic tags, and engagement actions.

### Admin Panel (`/admin`)
Dashboard for managing RSS sources, reviewing suggested tags, monitoring ingestion metrics, and editing AI prompt configurations.

---

## How Ingestion Works

The ingestion pipeline is the engine that turns raw RSS feeds into the AI-summarized stories users see in the app. Here's the complete flow:

### Architecture Overview

```
RSS Sources (Firestore)
    |
    v
Scheduler (TypeScript cron jobs)
    |
    v
Python Ingestion Pipeline ──────────────────────────┐
  1. RSS Reader ── fetch & parse feeds               |
  2. Knockout Filter ── reject <70 words or no image |
  3. Dedup ── URL hash + content hash                |
  4. Image Selector ── source > Buzzy Bank > Pixabay |
  5. Categorizer ── topic tag scoring                |
  6. Demand Filter ── require 1+ approved tag        |
  7. Normalizer ── unified internal format           |
    |                                                |
    v                                                |
Python Summarization Pipeline ───────────────────────┘
  1. Prompt Builder ── per-category tone/style config
  2. OpenAI API Call ── GPT-5-nano, JSON response
  3. Post-Processor ── validate word counts & format
    |
    v
Firestore (status: "candidate")
    |
    v
Article Publish Job (after category-specific delay)
    |
    v
Firestore (status: "published") ── visible in feeds
    |
    v
Engagement tracking (views, likes, comments, shares)
    |
    v
Permanent promotion (engagement >= 10 pts) ── SEO page created
```

### Pipeline Stages in Detail

**1. RSS Polling** — The scheduler triggers per-category RSS pulls on configurable cron schedules. News polls every 2 hours, Markets every 30 minutes, most categories every 6 hours. Schedules are defined in `config/cron-schedules.json`.

**2. Ingestion Pipeline** (`services/ingestion/`) — For each RSS feed in a category:
- **RSS Reader** (`rss_reader.py`) — Fetches and parses feeds via `feedparser`. Extracts title, content, images, publication date, and publisher. Handles RSS 2.0 and Atom formats.
- **Knockout Filter** (`knockout.py`) — Quality gate. Rejects articles with fewer than 70 words or without an image. Configurable thresholds.
- **Dedup** (`dedup.py`) — Two-tier deduplication using SHA-256 hashes of the URL and combined URL+content. Prevents re-processing articles across polling cycles.
- **Image Selector** (`image_selector.py`) — Three-tier fallback: (1) original source image if >= 400x300px, (2) Buzzy Image Bank category fallback, (3) Pixabay search by category. Uses Pillow for dimension validation.
- **Categorizer** (`categorizer.py`) — Scores articles against all topic tags using weighted matching: title match = 5 pts, description = 3 pts, content = 1 pt. Assigns primary category and matched tags. RSS sources can also have a pre-assigned category.
- **Demand Filter** (`demand_filter.py`) — Articles must match at least one approved topic tag to enter the candidate pool. Future phases add buzzword matching and quota checks.
- **Normalizer** (`normalizer.py`) — Converts to a unified `NormalizedArticle` format, strips HTML, normalizes whitespace.

**3. Summarization Pipeline** (`services/summarization/`) — For each normalized article:
- **Prompt Builder** (`prompt_builder.py`) — Resolves per-category parameters (tone, headline style, reading level, hedge level, buzzy take style, emoji rules). Prompts are stored in Firestore and editable via admin — never hardcoded.
- **Summarizer** (`summarizer.py`) — Calls OpenAI (GPT-5-nano default) with structured JSON output. Generates: headline, TL;DR (12-26 words), 3 key takeaways (21-30 words each), buzzy take, snappy sentence, SEO keywords, meta description, AP-style dateline location.
- **Post-Processor** (`post_processor.py`) — Validates word counts and field presence. Cleans headline formatting. Articles that fail validation are logged and skipped.

**4. Storage & Publication** — Summarized articles are stored in Firestore with status `candidate`. The `articlePublish` scheduler job promotes candidates to `published` after a category-specific delay (30 min for Markets, 1 hour for News, up to 6 hours for Science/Lifestyle). Published articles become visible in all feeds.

**5. Engagement & Promotion** — Users interact with published articles (view, like, comment, share, bookmark). Engagement signals are aggregated. When an article crosses the permanent threshold (default 10 points: click=1, comment=5, share=10), it's promoted to `permanent` status — gaining a unique slug, SEO-optimized page, schema.org markup, and sitemap entry.

### Where It Runs

| Environment | How |
|------------|-----|
| **Local dev** | Python scripts run standalone. Seed data mode bypasses Firestore. `python3 -m services.ingestion.src.pipeline` |
| **Production** | Scheduler service triggers Python pipelines via HTTP. Deployed as Docker containers alongside Firebase Cloud Functions. |
| **Firestore** | All article state, RSS sources, topic tags, and engagement signals live in Firestore collections. |

### Cron Schedule

| Category | Poll Frequency | Publish Delay |
|----------|---------------|---------------|
| News | Every 2 hours | 1 hour |
| Markets | Every 30 minutes | 30 minutes |
| Tech | Every 6 hours | 3 hours |
| Sports | Every 6 hours | 2 hours |
| Politics | Every 6 hours | 2 hours |
| Money | Every 6 hours | 3 hours |
| Crypto | Every 6 hours | 3 hours |
| Science | Daily (noon) | 6 hours |
| Health | Daily (6 PM) | 6 hours |
| Entertainment | Every 6 hours | 6 hours |
| Lifestyle | Every 6 hours | 6 hours |

### Article Status Lifecycle

```
candidate ──> published ──> permanent
   (passed all       (visible in      (SEO page,
    filters,          user feeds,      slug, schema
    awaiting          collecting       markup,
    delay)            engagement)      sitemap)
```

---

## API Endpoints

### Articles
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/articles/feed` | Personalized feed (cursor-paginated) |
| GET | `/api/articles/homepage` | Homepage content clumps + tag ticker |
| GET | `/api/articles/trending` | Trending articles |
| GET | `/api/articles/latest` | Latest articles |
| GET | `/api/articles/category/:slug` | Articles by category |
| GET | `/api/articles/tag/:slug` | Articles by topic tag |
| GET | `/api/articles/by-slug/:slug` | Single article by slug |
| GET | `/api/articles/:id` | Single article by ID |
| POST | `/api/articles/:id/like` | Toggle like |
| POST | `/api/articles/:id/share` | Record share |
| POST | `/api/articles/:id/bookmark` | Toggle bookmark |

### Comments
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/articles/:id/comments` | List comments (cursor-paginated) |
| POST | `/api/articles/:id/comments` | Create comment |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/rss-sources` | List RSS sources |
| GET | `/api/admin/suggested-tags` | Pending tag suggestions |
| POST | `/api/admin/suggested-tags/:id/approve` | Approve a tag |
| GET | `/api/admin/dashboard` | Ingestion metrics |

---

## Workspaces

| Workspace | Package | Port | Description |
|-----------|---------|------|-------------|
| `apps/api` | `@buzzy/api` | 3001 | Fastify REST API |
| `apps/web` | `@buzzy/web` | 3000 | Next.js web app |
| `apps/admin` | `@buzzy/admin` | 3002 | Admin panel |
| `apps/mobile` | `@buzzy/mobile` | 8081 | React Native (Expo) |
| `packages/shared` | `@buzzy/shared` | — | Shared types, utils, constants |
| `packages/db` | `@buzzy/db` | — | Firestore schema & rules |
| `packages/ai` | `@buzzy/ai` | — | AI pipeline shared code |
| `services/ingestion` | `@buzzy/ingestion` | — | Python RSS ingestion |
| `services/summarization` | `@buzzy/summarization` | — | Python AI summarization |
| `services/scheduler` | `@buzzy/scheduler` | — | Cron job orchestrator |
| `services/notifications` | `@buzzy/notifications` | — | Push & email |

Shared types are imported via subpath exports: `@buzzy/shared/types`, `@buzzy/shared/utils`, `@buzzy/shared/constants`, `@buzzy/shared/seeds`.
