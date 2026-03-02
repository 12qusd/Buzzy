"""
Universal RSS Reader for Buzzy Today.

Polls configured RSS feeds, parses entries, and handles AI-driven feed
structure detection for unknown feed formats.

For known feeds: uses cached field mappings without GPT call.
For new feeds: strips XML, sends to GPT to identify field mappings, caches structure.

Dependencies: feedparser, httpx, structlog
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

import feedparser
import httpx
import structlog

logger = structlog.get_logger(__name__)


@dataclass
class FeedStructure:
    """Cached field mapping for a parsed RSS feed."""
    title_field: str
    image_url_field: str
    description_field: str
    content_field: str


@dataclass
class RawArticle:
    """Raw article data extracted from an RSS entry."""
    title: str
    description: str
    content: str
    source_url: str
    image_url: Optional[str]
    publisher_name: str
    feed_url: str
    published_at: Optional[datetime]


# Default feed structure for standard RSS 2.0 / Atom feeds
DEFAULT_STRUCTURE = FeedStructure(
    title_field="title",
    image_url_field="media_content",
    description_field="summary",
    content_field="content",
)


def parse_published_date(entry: dict) -> Optional[datetime]:
    """
    Extract publication date from a feedparser entry.

    :param entry: A feedparser entry dict
    :returns: Parsed datetime or None if unavailable
    """
    published_parsed = entry.get("published_parsed")
    if published_parsed:
        try:
            return datetime(*published_parsed[:6])
        except (TypeError, ValueError):
            pass

    updated_parsed = entry.get("updated_parsed")
    if updated_parsed:
        try:
            return datetime(*updated_parsed[:6])
        except (TypeError, ValueError):
            pass

    return None


def extract_image_url(entry: dict) -> Optional[str]:
    """
    Extract the first available image URL from an RSS entry.
    Checks media_content, media_thumbnail, enclosures, and content.

    :param entry: A feedparser entry dict
    :returns: Image URL string or None
    """
    # Check media:content
    media_content = entry.get("media_content", [])
    for media in media_content:
        url = media.get("url", "")
        media_type = media.get("type", "")
        if url and ("image" in media_type or media_type == ""):
            return url

    # Check media:thumbnail
    media_thumbnail = entry.get("media_thumbnail", [])
    for thumb in media_thumbnail:
        url = thumb.get("url", "")
        if url:
            return url

    # Check enclosures
    enclosures = entry.get("enclosures", [])
    for enc in enclosures:
        enc_type = enc.get("type", "")
        url = enc.get("href", "") or enc.get("url", "")
        if url and "image" in enc_type:
            return url

    return None


def extract_content(entry: dict) -> str:
    """
    Extract the full text content from an RSS entry.
    Prioritizes content:encoded, then content, then summary.

    :param entry: A feedparser entry dict
    :returns: Content text string
    """
    # Try content:encoded or content blocks
    content_list = entry.get("content", [])
    if content_list:
        # Find the longest content block
        best = max(content_list, key=lambda c: len(c.get("value", "")))
        value = best.get("value", "")
        if value:
            return value

    # Fall back to summary/description
    return entry.get("summary", "") or entry.get("description", "")


async def fetch_feed(feed_url: str, timeout: float = 30.0) -> feedparser.FeedParserDict:
    """
    Fetch and parse an RSS feed from a URL.

    :param feed_url: The RSS feed URL to fetch
    :param timeout: Request timeout in seconds
    :returns: Parsed feedparser result
    :raises httpx.HTTPError: If the HTTP request fails
    """
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.get(feed_url, follow_redirects=True)
        response.raise_for_status()

    feed = feedparser.parse(response.text)

    if feed.bozo and feed.bozo_exception:
        logger.warning(
            "Feed parse warning",
            feed_url=feed_url,
            error=str(feed.bozo_exception),
        )

    return feed


async def read_feed(
    feed_url: str,
    publisher_name: str,
    structure: Optional[FeedStructure] = None,
) -> list[RawArticle]:
    """
    Read and parse all entries from an RSS feed.

    :param feed_url: The RSS feed URL
    :param publisher_name: Name of the publisher for attribution
    :param structure: Cached feed structure mapping (uses defaults if None)
    :returns: List of RawArticle objects extracted from the feed
    :raises httpx.HTTPError: If the feed cannot be fetched
    """
    log = logger.bind(feed_url=feed_url, publisher=publisher_name)
    log.info("Fetching RSS feed")

    feed = await fetch_feed(feed_url)
    articles: list[RawArticle] = []

    for entry in feed.entries:
        try:
            title = entry.get("title", "").strip()
            if not title:
                log.debug("Skipping entry with no title")
                continue

            source_url = entry.get("link", "").strip()
            if not source_url:
                log.debug("Skipping entry with no link", title=title)
                continue

            articles.append(
                RawArticle(
                    title=title,
                    description=entry.get("summary", "").strip(),
                    content=extract_content(entry),
                    source_url=source_url,
                    image_url=extract_image_url(entry),
                    publisher_name=publisher_name,
                    feed_url=feed_url,
                    published_at=parse_published_date(entry),
                )
            )
        except Exception as e:
            log.error("Failed to parse entry", error=str(e), title=entry.get("title"))
            continue

    log.info("Feed parsed", article_count=len(articles))
    return articles
