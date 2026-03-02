"""Tests for the categorization engine."""

import pytest
from src.categorizer import (
    score_article_against_tags,
    categorize_article,
    TopicTagConfig,
)


def _make_tags() -> list[TopicTagConfig]:
    """Create test topic tags."""
    return [
        TopicTagConfig(
            tag_id="t1",
            tag_name="Artificial Intelligence",
            canonical_name="artificial intelligence",
            synonyms=["AI", "machine learning"],
            category_id="cat-tech",
            category_name="Tech",
            category_color="#3C82F6",
        ),
        TopicTagConfig(
            tag_id="t2",
            tag_name="Bitcoin",
            canonical_name="bitcoin",
            synonyms=["BTC", "cryptocurrency"],
            category_id="cat-crypto",
            category_name="Crypto",
            category_color="#F9751A",
        ),
        TopicTagConfig(
            tag_id="t3",
            tag_name="Apple",
            canonical_name="apple",
            synonyms=["AAPL"],
            category_id="cat-tech",
            category_name="Tech",
            category_color="#3C82F6",
        ),
    ]


class TestScoreArticleAgainstTags:
    def test_title_match_scores_5(self):
        tags = _make_tags()
        matches = score_article_against_tags(
            title="Artificial Intelligence changes everything",
            description="No match here",
            content="No match here",
            tags=tags,
        )
        assert len(matches) == 1
        assert matches[0].tag_id == "t1"
        assert matches[0].score == 5

    def test_description_match_scores_3(self):
        tags = _make_tags()
        matches = score_article_against_tags(
            title="No match here",
            description="Bitcoin surges to new high",
            content="No match here",
            tags=tags,
        )
        assert len(matches) == 1
        assert matches[0].tag_id == "t2"
        assert matches[0].score == 3

    def test_content_match_scores_1(self):
        tags = _make_tags()
        matches = score_article_against_tags(
            title="No match here",
            description="No match here",
            content="The new Apple product was announced",
            tags=tags,
        )
        assert len(matches) == 1
        assert matches[0].tag_id == "t3"
        assert matches[0].score == 1

    def test_all_fields_match_scores_9(self):
        tags = _make_tags()
        matches = score_article_against_tags(
            title="AI is transforming",
            description="AI in the description",
            content="AI in the content too",
            tags=tags,
        )
        assert matches[0].score == 9

    def test_synonym_match(self):
        tags = _make_tags()
        matches = score_article_against_tags(
            title="BTC price rally",
            description="Nope",
            content="Nope",
            tags=tags,
        )
        assert len(matches) == 1
        assert matches[0].tag_name == "Bitcoin"

    def test_no_matches_returns_empty(self):
        tags = _make_tags()
        matches = score_article_against_tags(
            title="Weather forecast",
            description="It will rain",
            content="Bring an umbrella",
            tags=tags,
        )
        assert matches == []

    def test_results_sorted_by_score(self):
        tags = _make_tags()
        matches = score_article_against_tags(
            title="AI and Bitcoin headline",
            description="Only AI here",
            content="Content about both AI and Bitcoin",
            tags=tags,
        )
        assert matches[0].score >= matches[-1].score


class TestCategorizeArticle:
    def test_categorizes_by_highest_scoring_category(self):
        tags = _make_tags()
        result = categorize_article(
            title="AI breakthrough at Apple",
            description="Tech industry buzz",
            content="Artificial Intelligence and Apple are leading",
            tags=tags,
        )
        assert result is not None
        assert result.primary_category_name == "Tech"

    def test_returns_none_when_no_match(self):
        tags = _make_tags()
        result = categorize_article(
            title="Weather forecast",
            description="Rain expected",
            content="Bring an umbrella",
            tags=tags,
        )
        assert result is None

    def test_assigned_category_overrides_scoring(self):
        tags = _make_tags()
        result = categorize_article(
            title="Bitcoin AI crossover",
            description="Crypto and tech",
            content="Bitcoin uses AI",
            tags=tags,
            assigned_category_id="cat-crypto",
            assigned_category_name="Crypto",
            assigned_category_color="#F9751A",
        )
        assert result is not None
        assert result.primary_category_id == "cat-crypto"

    def test_secondary_category_populated(self):
        tags = _make_tags()
        result = categorize_article(
            title="AI and Bitcoin in one article",
            description="Tech and crypto",
            content="Artificial Intelligence meets cryptocurrency",
            tags=tags,
        )
        assert result is not None
        # Should have both Tech and Crypto as potential categories
        assert result.secondary_category_id is not None
