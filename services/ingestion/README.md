# Buzzy Ingestion Service

Python 3.12 RSS ingestion pipeline for Buzzy Today.

## Pipeline Steps
1. **RSS Reader** — Polls configured feeds, AI-detects structure for new feeds
2. **Knockout Filter** — Rejects articles < 70 words or missing image
3. **Deduplication** — URL + content hash dedup
4. **Image Selection** — Source article → Buzzy Image Bank → Pixabay
5. **Categorization** — Topic tag scoring (title: 5, description: 3, content: 1)
6. **Tag Suggestion** — AI entity extraction for new tag candidates
7. **Demand Filter** — Requires ≥1 approved tag
8. **Normalization** — Unified internal format

## Setup

```bash
cd services/ingestion
pip install -r requirements.txt --break-system-packages
```

## Testing

```bash
cd services/ingestion
python -m pytest tests/ -v
```
