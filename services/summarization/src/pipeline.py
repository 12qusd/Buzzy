"""
Full summarization pipeline orchestrator for Buzzy Today.

Takes normalized articles from the ingestion pipeline and produces
AI-generated summaries ready for Firestore storage.

Dependencies: structlog
"""

from dataclasses import dataclass
from typing import Optional

import structlog

from .prompt_builder import SummarizationParams, build_prompt
from .summarizer import SummarizationResult, summarize_article
from .post_processor import validate_result, clean_headline, clean_tldr

logger = structlog.get_logger(__name__)


@dataclass
class SummarizationPipelineResult:
    """Result of running the summarization pipeline for one article."""
    success: bool
    result: Optional[SummarizationResult] = None
    errors: list[str] | None = None
    warnings: list[str] | None = None


async def run_summarization(
    article_title: str,
    article_content: str,
    source_publisher: str,
    publication_date: str,
    category_name: str,
    params: SummarizationParams,
    openai_api_key: str,
    model: str = "gpt-5-nano",
    system_prompt_template: Optional[str] = None,
) -> SummarizationPipelineResult:
    """
    Run the full summarization pipeline for a single article.

    Steps:
    1. Build prompt with per-category parameters
    2. Call AI API for structured summary
    3. Post-process and validate output
    4. Clean headline and TL;DR formatting

    :param article_title: The article headline
    :param article_content: The full article text
    :param source_publisher: Publisher name
    :param publication_date: ISO date string
    :param category_name: Category for style parameters
    :param params: Per-category summarization config
    :param openai_api_key: OpenAI API key
    :param model: AI model to use
    :param system_prompt_template: Custom system prompt template
    :returns: SummarizationPipelineResult
    """
    log = logger.bind(
        title=article_title[:60],
        category=category_name,
    )

    # Step 1: Build prompt
    prompt = build_prompt(
        article_title=article_title,
        article_content=article_content,
        source=source_publisher,
        publication_date=publication_date,
        params=params,
        model=model,
        system_prompt_template=system_prompt_template,
    )

    # Step 2: Call AI API
    result = await summarize_article(
        prompt=prompt,
        openai_api_key=openai_api_key,
    )

    if not result:
        log.error("Summarization returned no result")
        return SummarizationPipelineResult(
            success=False,
            errors=["AI summarization returned no result"],
        )

    # Step 3: Validate
    validation = validate_result(
        result,
        tldr_min=params.tldr_words_min,
        tldr_max=params.tldr_words_max,
        takeaway_min=params.takeaways_words_min,
        takeaway_max=params.takeaways_words_max,
    )

    if not validation.is_valid:
        log.warning("Summarization validation failed", errors=validation.errors)
        return SummarizationPipelineResult(
            success=False,
            result=result,
            errors=validation.errors,
            warnings=validation.warnings,
        )

    # Step 4: Clean formatting
    result = SummarizationResult(
        headline=clean_headline(result.headline),
        tldr=clean_tldr(result.tldr),
        key_takeaways=result.key_takeaways,
        buzzy_take=result.buzzy_take,
        seo_keywords=result.seo_keywords,
        meta_description=result.meta_description,
        topic_tags=result.topic_tags,
        snappy_sentence=result.snappy_sentence,
        location=result.location,
        model_used=result.model_used,
        prompt_tokens=result.prompt_tokens,
        completion_tokens=result.completion_tokens,
    )

    log.info("Summarization pipeline complete", headline=result.headline[:60])

    return SummarizationPipelineResult(
        success=True,
        result=result,
        warnings=validation.warnings if validation.warnings else None,
    )
