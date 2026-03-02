# Operational Runbooks — Buzzy Today

## 1. Deployment

### Deploy API to Staging
```bash
# Build and deploy to Firebase staging
npx turbo build --filter=@buzzy/api
firebase deploy --only functions -P staging
```

### Deploy API to Production
```bash
npx turbo build --filter=@buzzy/api
firebase deploy --only functions -P production
```

### Deploy Admin Panel
```bash
npx turbo build --filter=@buzzy/admin
# Deploy to Vercel/Netlify or Firebase Hosting
firebase deploy --only hosting:admin -P production
```

### Deploy Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules -P production
firebase deploy --only firestore:indexes -P production
```

## 2. Ingestion Pipeline

### Run Manual Ingestion
```bash
cd services/ingestion
python -m src.pipeline --once
```

### Check Ingestion Status
```bash
# View recent ingestion logs
firebase functions:log --only ingestion -P production

# Check article counts
firebase firestore:export --collection articles --format json | jq '.documents | length'
```

### Troubleshoot Failed Ingestion
1. Check structlog output for errors
2. Verify RSS source URLs are accessible
3. Check OpenAI API key and rate limits
4. Verify Firestore write permissions
5. Check knockout filter isn't too aggressive (word count / image requirements)

## 3. Content Management

### Approve/Reject Suggested Tags
Access the admin panel at `/suggested-tags`. Review pending tags and approve or reject with optional overrides.

### Update Publishing Quotas
Access `/quotas` in admin panel. Adjust daily limits per category. Changes audit-logged and take effect within 60 seconds.

### Update AI Summarization Config
Access `/summarization` in admin panel. Modify tone, reading level, hedge level per category. Prompts are stored in Firestore.

### Manage Buzzwords
Access `/summarization` in admin panel. Activate/deactivate buzzwords. Active buzzwords boost F&E scores during ingestion.

## 4. Monitoring

### Check API Health
```bash
curl https://api.buzzy.today/health
# Expected: { "status": "ok", "timestamp": "..." }
```

### View Firebase Functions Logs
```bash
firebase functions:log -P production --only api
```

### Check Quota Utilization
Access `/quotas` in admin panel to see per-category utilization percentages.

### Check Signal Processing
Access `/signals` in admin panel to see signal volume and type breakdown.

## 5. User Management

### Check User Interest Graph
```bash
# Via Firestore console or CLI
firebase firestore:get users/{userId}/interest_graph
```

### Reset User Onboarding (Testing)
```bash
# Update user document
firebase firestore:update users/{userId} --data '{"onboardingCompleted": false}'
```

## 6. Emergency Procedures

### Disable Ingestion
```bash
# Disable the ingestion Cloud Function
firebase functions:disable ingestion -P production
```

### Rate Limit Override
```bash
# Temporarily increase API rate limits
firebase functions:config:set api.rate_limit=1000 -P production
firebase functions:deploy --only api -P production
```

### Rollback Deployment
```bash
# List recent deployments
firebase hosting:versions:list -P production

# Rollback to previous version
firebase hosting:rollback -P production
```

### Database Backup
```bash
# Export Firestore data
gcloud firestore export gs://buzzy-today-backups/$(date +%Y-%m-%d)
```

## 7. Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| RSS Ingestion | Every 15 min | Fetch new articles from all active RSS sources |
| Interest Decay | Weekly (Sun midnight UTC) | Apply 5% decay to all interest graph scores |
| Daily Digest | Daily 8:00 AM ET | Generate and send daily digest emails |
| Quota Reset | Daily midnight UTC | Reset daily publishing counters |
| Stale Article Cleanup | Weekly | Archive articles older than 30 days with no engagement |

## 8. Test Suite

### Run All TypeScript Tests
```bash
npx turbo test
```

### Run API Tests Only
```bash
npx turbo test --filter=@buzzy/api
```

### Run Python Ingestion Tests
```bash
cd services/ingestion && python -m pytest
```

### Run Python Summarization Tests
```bash
cd services/summarization && python -m pytest
```

### Run Full Typecheck
```bash
npx turbo typecheck
```
