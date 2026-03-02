"""
Knockout filter for the Buzzy Today ingestion pipeline.

Rejects articles that don't meet minimum quality thresholds:
- Text content must be ≥ 70 words (configurable)
- Image must be present (configurable)

Dependencies: structlog, beautifulsoup4
"""

from dataclasses import dataclass
from typing import Optional

from bs4 import BeautifulSoup
import structlog

from .rss_reader import RawArticle

logger = structlog.get_logger(__name__)


@dataclass
class KnockoutResult:
    """Result of the knockout filter check."""
    passed: bool
    reason: Optional[str] = None


def strip_html_tags(html_content: str) -> str:
    """
    Remove HTML tags from content, returning plain text.

    :param html_content: HTML string to strip
    :returns: Plain text content
    """
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "lxml")
    return soup.get_text(separator=" ", strip=True)


def count_words(text: str) -> int:
    """
    Count the number of words in a text string.

    :param text: Plain text to count
    :returns: Number of words
    """
    return len(text.split())


def apply_knockout(
    article: RawArticle,
    min_word_count: int = 70,
    require_image: bool = True,
) -> KnockoutResult:
    """
    Apply knockout filter rules to a raw article.

    Rules:
    1. Article text must contain ≥ min_word_count words
    2. Article must have an image (if require_image is True)

    :param article: The raw article to evaluate
    :param min_word_count: Minimum word count threshold (default 70)
    :param require_image: Whether to require an image (default True)
    :returns: KnockoutResult indicating pass/fail and reason
    """
    log = logger.bind(
        source_url=article.source_url,
        title=article.title[:80],
    )

    # Check image requirement
    if require_image and not article.image_url:
        log.info("Knockout: missing image")
        return KnockoutResult(passed=False, reason="missing_image")

    # Check word count on the best available text
    content_text = strip_html_tags(article.content or article.description)
    word_count = count_words(content_text)

    if word_count < min_word_count:
        log.info(
            "Knockout: insufficient word count",
            word_count=word_count,
            min_required=min_word_count,
        )
        return KnockoutResult(
            passed=False,
            reason=f"word_count_{word_count}_below_{min_word_count}",
        )

    log.debug("Knockout: passed", word_count=word_count)
    return KnockoutResult(passed=True)
