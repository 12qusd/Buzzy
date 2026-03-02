"""
Integration tests for the full summarization pipeline.

Tests the end-to-end flow from article input through prompt building,
AI summarization (mocked at function level), post-processing, and final
output validation. Mocks `summarize_article` rather than the OpenAI client
to avoid architecture-dependent import issues.
"""

from unittest.mock import AsyncMock, patch

import pytest

from src.prompt_builder import SummarizationParams, build_prompt
from src.summarizer import SummarizationResult
from src.pipeline import run_summarization, SummarizationPipelineResult


# --- Fixtures ---

SAMPLE_ARTICLE_TITLE = "Major Tech Company Announces Breakthrough in Quantum Computing"
SAMPLE_ARTICLE_CONTENT = (
    "In a groundbreaking announcement today, QuantumCorp revealed its new "
    "quantum processor that achieves 1000 qubits of stable operation. The "
    "chip, codenamed Aurora, represents a significant leap forward in quantum "
    "computing technology. Experts say this could accelerate drug discovery, "
    "climate modeling, and cryptography research by decades. The breakthrough "
    "was achieved through a novel error-correction method developed by the "
    "company's research team in partnership with MIT and Stanford University. "
    "Wall Street reacted positively, with QuantumCorp shares rising 15% in "
    "after-hours trading. Competitors including IBM and Google acknowledged "
    "the achievement while noting their own quantum programs continue to "
    "advance. Industry analysts predict the quantum computing market will "
    "reach $125 billion by 2030."
)
SAMPLE_SOURCE = "TechCrunch"
SAMPLE_DATE = "2026-03-01"
SAMPLE_CATEGORY = "Tech"
SAMPLE_API_KEY = "test-api-key"


def _make_valid_result(**overrides) -> SummarizationResult:
    """Create a valid SummarizationResult with sensible defaults."""
    defaults = dict(
        headline="QuantumCorp Smashes Records With 1000 Qubit Processor",
        tldr=(
            "QuantumCorp unveiled Aurora, a 1000-qubit quantum processor that "
            "could revolutionize drug discovery and climate modeling, sending "
            "shares up 15%"
        ),
        key_takeaways=[
            "Background: Quantum computing has long promised transformative breakthroughs but stable large-scale processors have remained elusive until now",
            "Main fact: QuantumCorp's Aurora chip achieves 1000 stable qubits through a novel error-correction method developed with MIT and Stanford",
            "Insight: Industry analysts predict the quantum computing market will reach $125 billion by 2030 as this breakthrough accelerates practical applications",
        ],
        buzzy_take="Quantum just went from science fair project to the real deal. Your move, classical computers.",
        seo_keywords=[
            "quantum computing", "QuantumCorp", "Aurora processor",
            "qubits", "drug discovery", "tech stocks", "quantum breakthrough",
        ],
        meta_description=(
            "QuantumCorp's Aurora processor achieves 1000 stable qubits, "
            "marking a quantum computing breakthrough that could transform "
            "drug discovery and climate research."
        ),
        topic_tags=["Quantum Computing", "Semiconductor"],
        snappy_sentence="Quantum computing just hit a thousand-qubit milestone that changes everything.",
        location="SAN FRANCISCO",
        model_used="gpt-5-nano",
        prompt_tokens=450,
        completion_tokens=280,
    )
    defaults.update(overrides)
    return SummarizationResult(**defaults)


# --- Integration Tests ---


class TestSummarizationPipelineIntegration:
    """Integration tests for the full pipeline flow."""

    @pytest.mark.asyncio
    async def test_full_pipeline_success(self):
        """Test the happy path: article in -> validated summary out."""
        mock_result = _make_valid_result()
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert isinstance(result, SummarizationPipelineResult)
        assert result.success is True
        assert result.result is not None
        assert "QuantumCorp" in result.result.headline
        assert result.result.model_used == "gpt-5-nano"
        assert result.result.prompt_tokens == 450
        assert result.result.completion_tokens == 280

    @pytest.mark.asyncio
    async def test_pipeline_cleans_headline_dashes(self):
        """Test that em dashes in the headline get cleaned during post-processing."""
        mock_result = _make_valid_result(
            headline="Tech Giant\u2014QuantumCorp\u2014Breaks Record"
        )
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert "\u2014" not in result.result.headline
        assert "Tech Giant" in result.result.headline
        assert "QuantumCorp" in result.result.headline

    @pytest.mark.asyncio
    async def test_pipeline_cleans_tldr_semicolons(self):
        """Test that semicolons in the TL;DR are replaced with commas."""
        mock_result = _make_valid_result(
            tldr=(
                "QuantumCorp achieved 1000 qubits; this could transform drug "
                "discovery; shares jumped 15% on the news immediately after"
            )
        )
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert ";" not in result.result.tldr
        assert "," in result.result.tldr

    @pytest.mark.asyncio
    async def test_pipeline_fails_on_missing_headline(self):
        """Test that validation catches a missing headline."""
        mock_result = _make_valid_result(headline="")
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is False
        assert result.errors is not None
        assert any("headline" in e.lower() for e in result.errors)

    @pytest.mark.asyncio
    async def test_pipeline_fails_on_missing_tldr(self):
        """Test that validation catches a missing TL;DR."""
        mock_result = _make_valid_result(tldr="")
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is False
        assert result.errors is not None
        assert any("tl;dr" in e.lower() for e in result.errors)

    @pytest.mark.asyncio
    async def test_pipeline_fails_on_api_returning_none(self):
        """Test that the pipeline handles a None return from summarize_article."""
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=None):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is False
        assert result.errors is not None
        assert any("no result" in e.lower() for e in result.errors)

    @pytest.mark.asyncio
    async def test_pipeline_with_custom_category_params(self):
        """Test that per-category params are correctly propagated to prompt building."""
        mock_result = _make_valid_result()
        params = SummarizationParams(
            category_name="Sports",
            tone="energetic",
            headline_guide="Focus on the action and the score",
            buzzy_take_style="passionate sports fan",
            emojis_allowed=True,
        )

        mock_summarize = AsyncMock(return_value=mock_result)

        with patch("src.pipeline.summarize_article", mock_summarize):
            result = await run_summarization(
                article_title="Team Wins Championship",
                article_content="The team won the championship game today.",
                source_publisher="ESPN",
                publication_date="2026-02-28",
                category_name="Sports",
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        # Verify the prompt passed to summarize_article has the right category params
        call_args = mock_summarize.call_args
        prompt = call_args.kwargs["prompt"]
        assert "energetic" in prompt.system_prompt
        assert "Sports" in prompt.system_prompt
        assert "passionate sports fan" in prompt.system_prompt

    @pytest.mark.asyncio
    async def test_pipeline_with_custom_model(self):
        """Test that a custom model is passed through to the prompt."""
        mock_result = _make_valid_result(model_used="gpt-4o")
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        mock_summarize = AsyncMock(return_value=mock_result)

        with patch("src.pipeline.summarize_article", mock_summarize):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
                model="gpt-4o",
            )

        assert result.success is True
        call_args = mock_summarize.call_args
        prompt = call_args.kwargs["prompt"]
        assert prompt.model == "gpt-4o"

    @pytest.mark.asyncio
    async def test_pipeline_handles_empty_api_key(self):
        """Test that an empty API key is handled at the summarizer level."""
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        # With empty key, summarize_article returns None
        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=None):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key="",
            )

        assert result.success is False

    @pytest.mark.asyncio
    async def test_pipeline_preserves_topic_tags(self):
        """Test that topic tags from AI output are preserved in final result."""
        mock_result = _make_valid_result(
            topic_tags=["Quantum Computing", "Semiconductor"]
        )
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert "Quantum Computing" in result.result.topic_tags
        assert "Semiconductor" in result.result.topic_tags

    @pytest.mark.asyncio
    async def test_pipeline_preserves_seo_keywords(self):
        """Test that SEO keywords are properly passed through."""
        keywords = ["quantum computing", "QuantumCorp", "Aurora", "qubits", "tech", "stocks", "breakthrough"]
        mock_result = _make_valid_result(seo_keywords=keywords)
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert len(result.result.seo_keywords) == 7
        assert "quantum computing" in result.result.seo_keywords

    @pytest.mark.asyncio
    async def test_pipeline_with_long_content_truncation(self):
        """Test that very long content is truncated in the prompt."""
        long_content = "word " * 5000  # 25,000 chars
        mock_result = _make_valid_result()
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        mock_summarize = AsyncMock(return_value=mock_result)

        with patch("src.pipeline.summarize_article", mock_summarize):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=long_content,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        # Verify the user prompt has truncation marker
        call_args = mock_summarize.call_args
        prompt = call_args.kwargs["prompt"]
        assert "[Content truncated]" in prompt.user_prompt

    @pytest.mark.asyncio
    async def test_pipeline_warnings_for_short_tldr(self):
        """Test that pipeline returns warnings for short TL;DR but still succeeds."""
        mock_result = _make_valid_result(tldr="Too short for limits")
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert result.warnings is not None
        assert any("too short" in w for w in result.warnings)

    @pytest.mark.asyncio
    async def test_pipeline_warnings_for_few_takeaways(self):
        """Test that fewer than 3 takeaways produces a warning."""
        mock_result = _make_valid_result(
            key_takeaways=["Just one takeaway here for testing purposes"]
        )
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert result.warnings is not None
        assert any("takeaways" in w for w in result.warnings)

    @pytest.mark.asyncio
    async def test_pipeline_location_preserved(self):
        """Test that location field is preserved from AI output."""
        mock_result = _make_valid_result(location="NEW YORK")
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert result.result.location == "NEW YORK"

    @pytest.mark.asyncio
    async def test_pipeline_buzzy_take_preserved(self):
        """Test that buzzy take is preserved in final output."""
        buzzy = "Quantum just went from science fair to reality."
        mock_result = _make_valid_result(buzzy_take=buzzy)
        params = SummarizationParams(category_name=SAMPLE_CATEGORY)

        with patch("src.pipeline.summarize_article", new_callable=AsyncMock, return_value=mock_result):
            result = await run_summarization(
                article_title=SAMPLE_ARTICLE_TITLE,
                article_content=SAMPLE_ARTICLE_CONTENT,
                source_publisher=SAMPLE_SOURCE,
                publication_date=SAMPLE_DATE,
                category_name=SAMPLE_CATEGORY,
                params=params,
                openai_api_key=SAMPLE_API_KEY,
            )

        assert result.success is True
        assert result.result.buzzy_take == buzzy


class TestPromptBuildingIntegration:
    """Tests that prompt building correctly integrates with pipeline parameters."""

    def test_prompt_includes_word_limits(self):
        """Test that word limits appear in the assembled system prompt."""
        params = SummarizationParams(
            category_name="Tech",
            tldr_words_min=15,
            tldr_words_max=30,
        )
        prompt = build_prompt(
            article_title=SAMPLE_ARTICLE_TITLE,
            article_content=SAMPLE_ARTICLE_CONTENT,
            source=SAMPLE_SOURCE,
            publication_date=SAMPLE_DATE,
            params=params,
        )
        assert "15" in prompt.system_prompt
        assert "30" in prompt.system_prompt

    def test_prompt_includes_source_and_date(self):
        """Test that source and publication date appear in user prompt."""
        params = SummarizationParams(category_name="Tech")
        prompt = build_prompt(
            article_title=SAMPLE_ARTICLE_TITLE,
            article_content=SAMPLE_ARTICLE_CONTENT,
            source="Reuters",
            publication_date="2026-03-01",
            params=params,
        )
        assert "Reuters" in prompt.user_prompt
        assert "2026-03-01" in prompt.user_prompt

    def test_prompt_category_name_in_user_prompt(self):
        """Test that the category name appears in the user prompt."""
        params = SummarizationParams(category_name="Science")
        prompt = build_prompt(
            article_title=SAMPLE_ARTICLE_TITLE,
            article_content=SAMPLE_ARTICLE_CONTENT,
            source=SAMPLE_SOURCE,
            publication_date=SAMPLE_DATE,
            params=params,
        )
        assert "Science" in prompt.user_prompt
