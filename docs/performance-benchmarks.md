# Performance Benchmarks — Buzzy Today

## Target Benchmarks

### Mobile App (React Native / Expo)
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| First Story Load | ≤ 1.5s | Time from app open to first StoryCard rendered |
| Cold Start | ≤ 2.5s | Time from tap to interactive feed |
| Swipe Response | < 100ms | Frame time during vertical swipe navigation |
| Image Load | ≤ 500ms | Time from card visible to hero image rendered |
| Memory Usage | < 200MB | Peak memory during 50-article browsing session |

### API Performance
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Feed Endpoint (p95) | ≤ 200ms | `GET /api/articles/feed` response time |
| Article Detail (p95) | ≤ 100ms | `GET /api/articles/:id` response time |
| Signal Batch (p95) | ≤ 150ms | `POST /api/signals/batch` response time |
| Homepage Build (p95) | ≤ 500ms | `GET /api/articles/homepage` with content clumps |
| Search (p95) | ≤ 300ms | `GET /api/tags/search` prefix search |

### Ingestion Pipeline
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| RSS Fetch (per source) | ≤ 5s | Time to fetch and parse one RSS feed |
| Article Processing | ≤ 10s | Single article through full pipeline |
| Batch Ingestion (100 articles) | ≤ 5min | Full pipeline including AI summarization |
| Dedup Check | ≤ 50ms | URL hash + content hash lookup |

### Firestore Operations
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Single Document Read | ≤ 50ms | Get one article/tag/user document |
| Collection Query | ≤ 200ms | Query with 1-2 filters + limit |
| Write (single) | ≤ 100ms | Create or update one document |
| Batch Write (10 docs) | ≤ 300ms | Firestore batched write |

## Optimization Strategies Applied

### Mobile
- `FlatList` with `getItemLayout` (pre-calculated heights, no measurement)
- `windowSize=7` (renders 7 screens ahead/behind)
- `maxToRenderPerBatch=3` (limits per-frame rendering)
- `initialNumToRender=2` (fast first paint)
- `removeClippedSubviews=true` (unmounts off-screen views)
- `snapToInterval` for smooth snap behavior
- Preload triggers at 3 articles from end of list
- Session dedup with 50-article sliding window

### API
- Cursor-based pagination (no offset counting)
- Firestore compound indexes on hot query paths
- F&E score calculated once at ingestion (immutable)
- Interest graph per-user (avoids cross-user joins)

### Data Architecture
- Denormalized Firestore documents (no joins at query time)
- Category/tag names stored on article (avoid lookup)
- Engagement counters on article doc (atomic increment)

## Testing Methodology

### Load Testing
```bash
# Install k6 for load testing
brew install k6

# Run feed endpoint load test
k6 run scripts/load-test-feed.js
```

### Mobile Profiling
```bash
# Run React Native performance monitor
npx react-native start --reset-cache

# In-app: Enable Performance Monitor via dev menu
# Measure: JS FPS, UI FPS, RAM usage
```

### API Profiling
```bash
# Start API with profiling
NODE_ENV=production node --prof apps/api/dist/index.js

# Process profiling output
node --prof-process isolate-*.log > profile.txt
```
