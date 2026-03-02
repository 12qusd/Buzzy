"""
Buzzy Today — RSS Ingestion Pipeline.

This service handles:
1. RSS feed polling and parsing
2. Knockout filtering (word count, image requirements)
3. URL + content hash deduplication
4. Image selection (source → Buzzy Bank → Pixabay)
5. Category tag scoring and assignment
6. AI-driven Topic Tag suggestion
7. Demand filtering (require ≥1 approved tag)
8. Article normalization to unified format
"""
