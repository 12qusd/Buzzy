# Buzzy Summarization Service

Python 3.12 AI summarization pipeline for Buzzy Today.

## Pipeline Steps
1. **Prompt Builder** — Resolves per-category config and assembles system + user prompts
2. **Summarizer** — Calls OpenAI API (GPT-5-nano default) to generate structured output
3. **Post-Processor** — Validates output structure, extracts fields

## Output Per Article
- AI Headline
- TL;DR (12-26 words)
- Key Takeaways (3 bullets, 21-30 words each)
- Buzzy Take
- SEO Keywords (7)
- Meta Description (150-160 chars)
- Topic Tags (2-3 suggested)
- Snappy Sentence

## Setup

```bash
cd services/summarization
pip install -r requirements.txt --break-system-packages
```

## Testing

```bash
cd services/summarization
python -m pytest tests/ -v
```
