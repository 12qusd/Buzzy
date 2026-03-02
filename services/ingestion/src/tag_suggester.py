"""
Topic Tag Suggester for the Buzzy Today ingestion pipeline.

After canonical tag matching, runs AI entity extraction to identify
high-confidence entities not matching existing tags. These are added
to the suggested_tags queue for editorial review.

Dependencies: openai, structlog
"""

from dataclasses import dataclass
from typing import Optional

import structlog

logger = structlog.get_logger(__name__)


@dataclass
class SuggestedTagCandidate:
    """An AI-suggested topic tag pending editorial review."""
    term: str
    normalized_slug: str
    suggested_bucket: str
    proposed_tag_type: str
    proposed_category_id: str
    ai_confidence_score: float
    source_article_id: str


def _slugify(term: str) -> str:
    """
    Generate a URL-safe slug from a term.

    :param term: The term to slugify
    :returns: Lowercase, hyphen-separated slug
    """
    slug = term.lower().strip()
    slug = slug.replace("&", "and").replace("$", "")
    result = []
    for char in slug:
        if char.isalnum() or char == " " or char == "-":
            result.append(char)
    slug = "".join(result).strip()
    slug = "-".join(slug.split())
    return slug


async def suggest_tags_from_article(
    article_title: str,
    article_content: str,
    existing_canonical_names: set[str],
    existing_synonyms: set[str],
    category_id: str,
    source_article_id: str,
    openai_api_key: str = "",
) -> list[SuggestedTagCandidate]:
    """
    Run AI entity extraction on an article to suggest new topic tags.

    High-confidence entities not matching existing canonical tags or synonyms
    are returned as suggested tag candidates.

    :param article_title: The article headline
    :param article_content: The full article text
    :param existing_canonical_names: Set of existing canonical tag names (lowercased)
    :param existing_synonyms: Set of existing synonym terms (lowercased)
    :param category_id: The article's assigned category ID
    :param source_article_id: The article ID for reference
    :param openai_api_key: OpenAI API key (empty = skip AI extraction)
    :returns: List of SuggestedTagCandidate objects
    """
    if not openai_api_key:
        logger.warning("OpenAI API key not configured — skipping tag suggestion")
        return []

    try:
        # Lazy import to avoid requiring openai in tests
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=openai_api_key)

        prompt = (
            "Extract the most important named entities from this news article. "
            "For each entity, provide: term, type (Person, Company, Technology, "
            "Organization, Place, Event, Concept, Product, or other specific type), "
            "and a confidence score from 0 to 1.\n\n"
            "Return JSON array of objects with fields: term, type, confidence\n"
            "Only include entities with confidence >= 0.7.\n"
            "Maximum 10 entities.\n\n"
            f"Title: {article_title}\n\n"
            f"Content: {article_content[:3000]}"
        )

        response = await client.chat.completions.create(
            model="gpt-5-nano",
            messages=[
                {"role": "system", "content": "You extract named entities from news articles. Return valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=500,
        )

        content = response.choices[0].message.content
        if not content:
            return []

        import json
        data = json.loads(content)
        entities = data if isinstance(data, list) else data.get("entities", [])

        candidates: list[SuggestedTagCandidate] = []

        for entity in entities:
            term = entity.get("term", "").strip()
            if not term:
                continue

            # Check against existing tags
            term_lower = term.lower()
            if term_lower in existing_canonical_names:
                continue
            if term_lower in existing_synonyms:
                continue

            confidence = float(entity.get("confidence", 0))
            if confidence < 0.7:
                continue

            candidates.append(
                SuggestedTagCandidate(
                    term=term,
                    normalized_slug=_slugify(term),
                    suggested_bucket=entity.get("type", "Concept"),
                    proposed_tag_type=entity.get("type", "Concept"),
                    proposed_category_id=category_id,
                    ai_confidence_score=confidence,
                    source_article_id=source_article_id,
                )
            )

        logger.info(
            "Tag suggestions generated",
            article_title=article_title[:60],
            suggestions=len(candidates),
        )
        return candidates

    except Exception as e:
        logger.error(
            "Tag suggestion failed",
            error=str(e),
            article_title=article_title[:60],
        )
        return []
