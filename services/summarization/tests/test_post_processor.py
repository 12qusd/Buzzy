"""Tests for the post-processor."""

from src.summarizer import SummarizationResult
from src.post_processor import (
    validate_result,
    clean_headline,
    clean_tldr,
    count_words,
)


def _make_result(**overrides) -> SummarizationResult:
    """Create a test summarization result with sensible defaults."""
    defaults = dict(
        headline="AI Chips Surge After Earnings Shock",
        tldr="AI chip makers saw unexpected gains after quarterly results beat analyst expectations across the board",
        key_takeaways=[
            "Background: The semiconductor industry has been volatile throughout 2026",
            "Main fact: Three major chip makers reported earnings 40% above estimates",
            "Insight: Analysts suggest this may signal a broader AI infrastructure boom",
        ],
        buzzy_take="Wall Street is shocked. Again. Maybe they should just follow the AI money.",
        seo_keywords=["AI chips", "semiconductor", "earnings", "tech stocks", "NVIDIA", "AMD", "wall street"],
        meta_description="AI chip stocks surged after earnings reports from major semiconductor companies beat analyst expectations by significant margins.",
        topic_tags=["Artificial Intelligence", "Semiconductor"],
        snappy_sentence="AI chip stocks just blew past everyone's expectations.",
        location="NEW YORK",
        model_used="gpt-5-nano",
        prompt_tokens=500,
        completion_tokens=300,
    )
    defaults.update(overrides)
    return SummarizationResult(**defaults)


class TestValidateResult:
    def test_valid_result_passes(self):
        result = _make_result()
        validation = validate_result(result)
        assert validation.is_valid is True

    def test_missing_headline_fails(self):
        result = _make_result(headline="")
        validation = validate_result(result)
        assert validation.is_valid is False
        assert "Missing headline" in validation.errors

    def test_missing_tldr_fails(self):
        result = _make_result(tldr="")
        validation = validate_result(result)
        assert validation.is_valid is False

    def test_short_tldr_warns(self):
        result = _make_result(tldr="Too short")
        validation = validate_result(result)
        assert any("too short" in w for w in validation.warnings)

    def test_long_tldr_warns(self):
        result = _make_result(tldr=" ".join(["word"] * 30))
        validation = validate_result(result)
        assert any("too long" in w for w in validation.warnings)

    def test_few_takeaways_warns(self):
        result = _make_result(key_takeaways=["Just one takeaway"])
        validation = validate_result(result)
        assert any("takeaways" in w for w in validation.warnings)

    def test_short_meta_description_warns(self):
        result = _make_result(meta_description="Short")
        validation = validate_result(result)
        assert any("short" in w for w in validation.warnings)


class TestCleanHeadline:
    def test_removes_em_dashes(self):
        assert "Breaking " in clean_headline("Breaking\u2014News")

    def test_removes_en_dashes(self):
        assert "Breaking " in clean_headline("Breaking\u2013News")

    def test_normalizes_whitespace(self):
        assert clean_headline("  Extra   Spaces  ") == "Extra Spaces"


class TestCleanTldr:
    def test_replaces_em_dashes_with_commas(self):
        result = clean_tldr("First point\u2014second point")
        assert "\u2014" not in result
        assert "," in result

    def test_replaces_semicolons_with_commas(self):
        result = clean_tldr("First; second")
        assert ";" not in result
        assert "," in result


class TestCountWords:
    def test_counts_correctly(self):
        assert count_words("one two three") == 3
        assert count_words("") == 0
