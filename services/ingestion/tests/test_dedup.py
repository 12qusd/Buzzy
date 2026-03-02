"""Tests for the deduplication service."""

import pytest
from src.rss_reader import RawArticle
from src.dedup import DeduplicationService, generate_url_hash, generate_content_hash


def _make_article(
    url: str = "https://example.com/article",
    content: str = "Some article content",
) -> RawArticle:
    """Create a test article."""
    return RawArticle(
        title="Test Article",
        description="description",
        content=content,
        source_url=url,
        image_url="https://example.com/img.jpg",
        publisher_name="Test",
        feed_url="https://example.com/feed",
        published_at=None,
    )


class TestHashGeneration:
    def test_url_hash_consistent(self):
        h1 = generate_url_hash("https://example.com")
        h2 = generate_url_hash("https://example.com")
        assert h1 == h2

    def test_url_hash_case_insensitive(self):
        h1 = generate_url_hash("HTTPS://EXAMPLE.COM")
        h2 = generate_url_hash("https://example.com")
        assert h1 == h2

    def test_content_hash_differs_by_content(self):
        h1 = generate_content_hash("url", "content A")
        h2 = generate_content_hash("url", "content B")
        assert h1 != h2


class TestDeduplicationService:
    def test_new_article_not_duplicate(self):
        svc = DeduplicationService()
        article = _make_article()
        assert svc.is_duplicate(article) is False

    def test_same_url_is_duplicate(self):
        svc = DeduplicationService()
        article = _make_article()
        svc.mark_seen(article)
        assert svc.is_duplicate(article) is True

    def test_different_url_not_duplicate(self):
        svc = DeduplicationService()
        a1 = _make_article(url="https://example.com/a")
        a2 = _make_article(url="https://example.com/b")
        svc.mark_seen(a1)
        assert svc.is_duplicate(a2) is False

    def test_known_hash_detected(self):
        svc = DeduplicationService()
        url_hash = generate_url_hash("https://example.com/article")
        svc.add_known_hash(url_hash)
        article = _make_article()
        assert svc.is_duplicate(article) is True

    def test_seen_count(self):
        svc = DeduplicationService()
        svc.mark_seen(_make_article(url="https://a.com"))
        svc.mark_seen(_make_article(url="https://b.com"))
        assert svc.seen_count == 2
