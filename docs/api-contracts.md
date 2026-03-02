# Buzzy Today — API Contracts

## Base URL

- Development: `http://localhost:3001`
- Staging: TBD
- Production: TBD

## Authentication

All authenticated endpoints require a Firebase Auth ID token in the `Authorization` header:
```
Authorization: Bearer <firebase-id-token>
```

## Endpoints

### Health Check
- `GET /health` — Returns `{ status: "ok", service: "buzzy-api", timestamp: "..." }`

### Articles
- `GET /api/articles/feed` — Personalized feed (query: category, limit, cursor, userId)
- `GET /api/articles/:id` — Single article detail
- `GET /api/articles/category/:categorySlug` — Articles by category
- `GET /api/articles/tag/:tagSlug` — Articles by topic tag
- `GET /api/articles/trending` — Trending articles
- `GET /api/articles/latest` — Latest articles
- `POST /api/articles/:id/like` — Like article (auth required)
- `POST /api/articles/:id/share` — Record share signal (auth required)
- `POST /api/articles/:id/bookmark` — Bookmark/unbookmark (auth required)

### Topic Tags
- `GET /api/tags/search?q=` — Search tags (prefix + fuzzy)
- `GET /api/tags/:slug` — Tag detail page
- `GET /api/tags/trending` — Trending tags
- `GET /api/tags/category/:categoryId` — Tags in category
- `POST /api/tags/:id/follow` — Follow/unfollow tag (auth required)

### Categories
- `GET /api/categories` — List all categories with metadata
- `GET /api/categories/:slug` — Category detail
- `POST /api/categories/:id/follow` — Follow/unfollow category (auth required)

### Users
- `GET /api/users/me` — Current user profile + interest graph summary (auth required)
- `PUT /api/users/me` — Update profile (auth required)
- `GET /api/users/me/bookmarks` — User bookmarks (auth required)
- `GET /api/users/me/feed` — Personalized home feed (auth required)
- `PUT /api/users/me/notifications` — Update notification preferences (auth required)
- `POST /api/users/me/onboarding` — Complete onboarding (auth required)

### Signals
- `POST /api/signals` — Batch record engagement signals (auth required)

### Comments
- `POST /api/comments/:id/like` — Like comment (auth required)

### Admin (admin role required)
- `GET /api/admin/rss-sources` — List RSS sources
- `POST /api/admin/rss-sources` — Add RSS source
- `GET /api/admin/suggested-tags` — List pending tag suggestions
- `POST /api/admin/suggested-tags/:id/approve` — Approve tag
- `POST /api/admin/suggested-tags/:id/reject` — Reject tag
- `GET /api/admin/dashboard` — Dashboard metrics
- `PUT /api/admin/quotas/:categoryId` — Update publishing quota
- `PUT /api/admin/summarization-config/:categoryId` — Update AI config
- `GET /api/admin/reports/:type` — Generate report
- `GET /api/admin/reports/:type/export` — CSV export

### Daily Digest
- `GET /api/digest/:date` — Get digest by date
- `GET /api/digest/latest` — Latest digest

## Error Response Format

All errors return:
```json
{
  "error": {
    "message": "Human-readable error description",
    "code": "MACHINE_READABLE_CODE",
    "statusCode": 400
  }
}
```
