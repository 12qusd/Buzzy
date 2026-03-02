"""
Deduplication service for the Buzzy Today ingestion pipeline.

Detects duplicate articles using URL hash and content hash.
Maintains an in-memory set for session-level dedup and checks
Firestore for persistent dedup across runs.

Dependencies: structlog
"""

import hashlib
from typing import Optional

import structlog

from .rss_reader import RawArticle

logger = structlog.get_logger(__name__)


def generate_url_hash(url: str) -> str:
    """
    Generate a SHA-256 hash of a normalized URL.

    :param url: The article source URL
    :returns: Hex-encoded SHA-256 hash
    """
    normalized = url.lower().strip()
    return hashlib.sha256(normalized.encode()).hexdigest()


def generate_content_hash(url: str, content: str) -> str:
    """
    Generate a SHA-256 hash combining URL and content for deduplication.

    :param url: The article source URL
    :param content: The article text content
    :returns: Hex-encoded SHA-256 hash
    """
    normalized = f"{url.lower().strip()}|{content.strip()}"
    return hashlib.sha256(normalized.encode()).hexdigest()


class DeduplicationService:
    """
    Tracks seen article hashes for deduplication.
    Uses both URL-only and URL+content hashes for two-tier checking.
    """

    def __init__(self) -> None:
        """Initialize with empty hash sets."""
        self._url_hashes: set[str] = set()
        self._content_hashes: set[str] = set()

    def add_known_hash(self, url_hash: str, content_hash: Optional[str] = None) -> None:
        """
        Register a known article hash (e.g., loaded from Firestore on startup).

        :param url_hash: URL-derived hash
        :param content_hash: Optional URL+content hash
        """
        self._url_hashes.add(url_hash)
        if content_hash:
            self._content_hashes.add(content_hash)

    def is_duplicate(self, article: RawArticle) -> bool:
        """
        Check if an article is a duplicate based on URL or content hash.

        :param article: The raw article to check
        :returns: True if the article is a duplicate
        """
        url_hash = generate_url_hash(article.source_url)

        # Fast path: check URL hash first
        if url_hash in self._url_hashes:
            logger.debug(
                "Duplicate detected by URL",
                source_url=article.source_url,
            )
            return True

        # Content hash check for near-duplicates from different URLs
        content_text = article.content or article.description
        content_hash = generate_content_hash(article.source_url, content_text)

        if content_hash in self._content_hashes:
            logger.debug(
                "Duplicate detected by content hash",
                source_url=article.source_url,
            )
            return True

        return False

    def mark_seen(self, article: RawArticle) -> tuple[str, str]:
        """
        Mark an article as seen and return its hashes.

        :param article: The raw article to mark
        :returns: Tuple of (url_hash, content_hash)
        """
        url_hash = generate_url_hash(article.source_url)
        content_text = article.content or article.description
        content_hash = generate_content_hash(article.source_url, content_text)

        self._url_hashes.add(url_hash)
        self._content_hashes.add(content_hash)

        return url_hash, content_hash

    @property
    def seen_count(self) -> int:
        """Number of unique articles tracked."""
        return len(self._url_hashes)
