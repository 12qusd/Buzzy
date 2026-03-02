"""Tests for the knockout filter."""

import pytest
from src.rss_reader import RawArticle
from src.knockout import apply_knockout, strip_html_tags, count_words


def _make_article(
    content: str = "word " * 100,
    image_url: str | None = "https://example.com/img.jpg",
) -> RawArticle:
    """Create a test article with defaults."""
    return RawArticle(
        title="Test Article",
        description="A test description",
        content=content,
        source_url="https://example.com/article",
        image_url=image_url,
        publisher_name="Test Publisher",
        feed_url="https://example.com/feed",
        published_at=None,
    )


class TestStripHtmlTags:
    def test_strips_tags(self):
        assert strip_html_tags("<p>Hello <b>world</b></p>") == "Hello world"

    def test_empty_string(self):
        assert strip_html_tags("") == ""

    def test_plain_text(self):
        assert strip_html_tags("No HTML here") == "No HTML here"


class TestCountWords:
    def test_counts_words(self):
        assert count_words("one two three four five") == 5

    def test_empty_string(self):
        assert count_words("") == 0


class TestApplyKnockout:
    def test_passes_valid_article(self):
        article = _make_article()
        result = apply_knockout(article)
        assert result.passed is True

    def test_rejects_missing_image(self):
        article = _make_article(image_url=None)
        result = apply_knockout(article)
        assert result.passed is False
        assert result.reason == "missing_image"

    def test_allows_missing_image_when_not_required(self):
        article = _make_article(image_url=None)
        result = apply_knockout(article, require_image=False)
        assert result.passed is True

    def test_rejects_short_content(self):
        article = _make_article(content="too short")
        result = apply_knockout(article)
        assert result.passed is False
        assert "word_count" in (result.reason or "")

    def test_rejects_below_custom_threshold(self):
        article = _make_article(content="one two three four five")
        result = apply_knockout(article, min_word_count=10)
        assert result.passed is False

    def test_passes_at_threshold(self):
        article = _make_article(content="word " * 70)
        result = apply_knockout(article, min_word_count=70)
        assert result.passed is True

    def test_strips_html_for_word_count(self):
        html_content = "<p>" + "word " * 100 + "</p>"
        article = _make_article(content=html_content)
        result = apply_knockout(article)
        assert result.passed is True
