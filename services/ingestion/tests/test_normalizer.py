"""Tests for the article normalizer."""

from src.normalizer import clean_html_to_text, normalize_article


class TestCleanHtmlToText:
    def test_strips_html_tags(self):
        assert clean_html_to_text("<p>Hello <b>world</b></p>") == "Hello world"

    def test_removes_script_tags(self):
        assert clean_html_to_text("<p>Text</p><script>evil()</script>") == "Text"

    def test_removes_style_tags(self):
        assert clean_html_to_text("<style>.x{}</style><p>Text</p>") == "Text"

    def test_normalizes_whitespace(self):
        result = clean_html_to_text("<p>  lots   of   spaces  </p>")
        assert "  " not in result

    def test_empty_string(self):
        assert clean_html_to_text("") == ""


class TestNormalizeArticle:
    def test_creates_normalized_article(self):
        result = normalize_article(
            title="  Test Title  ",
            description="<p>Description</p>",
            content="<p>Full content of the article with many words</p>",
            source_url="https://example.com/article",
            source_publisher="Test Publisher",
            published_at=None,
            image_url="https://example.com/img.jpg",
            image_source="original",
            feed_url="https://example.com/feed",
            category_tag_id="cat-tech",
            category_tag_name="Tech",
            category_color="#3C82F6",
            topic_tag_ids=["t1", "t2"],
            topic_tag_names=["AI", "Tech"],
            categorization_score=9,
            content_hash="abc123",
            url_hash="def456",
        )
        assert result.title == "Test Title"
        assert "Full content" in result.full_text
        assert result.category_tag_name == "Tech"
        assert len(result.topic_tag_ids) == 2

    def test_falls_back_to_description_when_no_content(self):
        result = normalize_article(
            title="Title",
            description="<p>Description text</p>",
            content="",
            source_url="https://example.com",
            source_publisher="Pub",
            published_at=None,
            image_url="img.jpg",
            image_source="original",
            feed_url="feed.xml",
            category_tag_id="cat-1",
            category_tag_name="Cat",
            category_color="#000",
            topic_tag_ids=[],
            topic_tag_names=[],
            categorization_score=0,
            content_hash="hash",
            url_hash="url",
        )
        assert result.full_text == "Description text"
