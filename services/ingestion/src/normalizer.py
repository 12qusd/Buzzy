"""
Article normalizer for the Buzzy Today ingestion pipeline.

Normalizes raw articles into a unified internal format ready for
AI summarization and Firestore storage.

Dependencies: structlog, beautifulsoup4
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

from bs4 import BeautifulSoup
import structlog

logger = structlog.get_logger(__name__)


@dataclass
class NormalizedArticle:
    """Normalized article ready for summarization and storage."""
    title: str
    full_text: str
    source_url: str
    source_publisher: str
    published_at: Optional[datetime]
    image_url: str
    image_source: str  # 'original', 'buzzy_bank', or 'pixabay'
    feed_url: str
    category_tag_id: str
    category_tag_name: str
    category_color: str
    topic_tag_ids: list[str]
    topic_tag_names: list[str]
    categorization_score: int
    content_hash: str
    url_hash: str
    section_name: str = ""
    secondary_category_id: Optional[str] = None


def clean_html_to_text(html_content: str) -> str:
    """
    Convert HTML content to clean plain text.

    :param html_content: HTML string to clean
    :returns: Plain text with normalized whitespace
    """
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "lxml")

    # Remove script and style elements
    for element in soup(["script", "style"]):
        element.decompose()

    text = soup.get_text(separator=" ", strip=True)

    # Normalize whitespace
    return " ".join(text.split())


def normalize_article(
    title: str,
    description: str,
    content: str,
    source_url: str,
    source_publisher: str,
    published_at: Optional[datetime],
    image_url: str,
    image_source: str,
    feed_url: str,
    category_tag_id: str,
    category_tag_name: str,
    category_color: str,
    topic_tag_ids: list[str],
    topic_tag_names: list[str],
    categorization_score: int,
    content_hash: str,
    url_hash: str,
    section_name: str = "",
    secondary_category_id: Optional[str] = None,
) -> NormalizedArticle:
    """
    Normalize article fields into a unified internal format.

    Uses the best available text (content > description), strips HTML,
    and normalizes whitespace.

    :param title: Article title (plain text)
    :param description: Article description (may contain HTML)
    :param content: Article full content (may contain HTML)
    :param source_url: Original article URL
    :param source_publisher: Publisher name
    :param published_at: Publication datetime
    :param image_url: Selected image URL
    :param image_source: Image source tier ('original', 'buzzy_bank', 'pixabay')
    :param feed_url: RSS feed URL this article came from
    :param category_tag_id: Primary category tag ID
    :param category_tag_name: Primary category name
    :param category_color: Primary category hex color
    :param topic_tag_ids: Matched topic tag IDs
    :param topic_tag_names: Matched topic tag names
    :param categorization_score: Total tag match score
    :param content_hash: Content dedup hash
    :param url_hash: URL dedup hash
    :param section_name: Section name (optional)
    :param secondary_category_id: Optional secondary category
    :returns: NormalizedArticle
    """
    # Use content if available, fall back to description
    raw_text = content if content else description
    full_text = clean_html_to_text(raw_text)

    clean_title = title.strip()

    logger.debug(
        "Article normalized",
        title=clean_title[:80],
        text_length=len(full_text),
        category=category_tag_name,
        tags=len(topic_tag_ids),
    )

    return NormalizedArticle(
        title=clean_title,
        full_text=full_text,
        source_url=source_url,
        source_publisher=source_publisher,
        published_at=published_at,
        image_url=image_url,
        image_source=image_source,
        feed_url=feed_url,
        category_tag_id=category_tag_id,
        category_tag_name=category_tag_name,
        category_color=category_color,
        topic_tag_ids=topic_tag_ids,
        topic_tag_names=topic_tag_names,
        categorization_score=categorization_score,
        content_hash=content_hash,
        url_hash=url_hash,
        section_name=section_name,
        secondary_category_id=secondary_category_id,
    )
