# Buzzy Today — Data Model

## Firestore Collections

### Top-Level Collections

| Collection | Document ID | Description |
|-----------|------------|-------------|
| `users` | Firebase Auth UID | User profiles and preferences |
| `articles` | Auto-generated | Full article records (raw → candidate → permanent) |
| `topic_tags` | Auto-generated | Canonical topic tag registry |
| `category_tags` | Auto-generated | Top-level category configuration |
| `rss_sources` | Auto-generated | RSS feed registry |
| `signals` | Auto-generated | User engagement events |
| `suggested_tags` | Auto-generated | AI-suggested tags pending review |
| `buzzwords` | Auto-generated | Buzzword scoring terms |
| `daily_digests` | Date string (YYYY-MM-DD) | Generated daily summaries |
| `user_reports` | Auto-generated | User feedback reports |
| `ai_config` | Config key | AI prompt configuration |
| `publishing_quotas` | Category ID | Per-category publishing limits |

### Subcollections

| Parent | Subcollection | Description |
|--------|-------------|-------------|
| `users/{uid}` | `bookmarks` | Saved articles |
| `users/{uid}` | `followed_tags` | Followed topic tags |
| `users/{uid}` | `followed_categories` | Followed categories |
| `users/{uid}` | `interest_graph` | Weighted tag interest scores |
| `articles/{id}` | `comments` | User comments on articles |

## Type Definitions

All TypeScript interfaces are defined in `packages/shared/src/types/` and exported from `@buzzy/shared`.

See the type source files for complete field documentation.

## Indexes

Composite indexes are defined in `packages/db/firestore.indexes.json`. Key indexes:
- Articles by status + category + score (feed queries)
- Articles by status + creation time (latest)
- Signals by user + timestamp (interest graph)
- Topic tags by category + follower count (tag browsing)

## Security Rules

Firestore security rules are in `packages/db/firestore.rules`. Key principles:
- Public read for articles, tags, categories, digests
- Authenticated write for own user data
- Admin-only for configuration, RSS sources, suggested tags
