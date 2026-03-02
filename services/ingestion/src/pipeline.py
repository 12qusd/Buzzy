"""
Full ingestion pipeline orchestrator for Buzzy Today.

Orchestrates the complete flow: RSS Read → Knockout → Dedup →
Image Selection → Categorization → Tag Suggestion → Demand Filter →
Normalization → Queue for Summarization.

Dependencies: structlog
"""

from dataclasses import dataclass
from typing import Optional

import structlog

from .rss_reader import RawArticle, read_feed
from .knockout import apply_knockout, strip_html_tags
from .dedup import DeduplicationService
from .image_selector import select_image, ImageResult
from .categorizer import (
    categorize_article,
    CategorizationResult,
    TopicTagConfig,
)
from .demand_filter import passes_demand_filter_phase1
from .normalizer import normalize_article, NormalizedArticle

logger = structlog.get_logger(__name__)


@dataclass
class PipelineStats:
    """Statistics from a single pipeline run."""
    articles_fetched: int = 0
    knocked_out: int = 0
    duplicates: int = 0
    no_image: int = 0
    uncategorized: int = 0
    demand_filtered: int = 0
    normalized: int = 0


@dataclass
class PipelineConfig:
    """Configuration for the ingestion pipeline."""
    min_word_count: int = 70
    require_image: bool = True
    image_min_width: int = 400
    image_min_height: int = 300
    pixabay_api_key: str = ""
    openai_api_key: str = ""


async def run_pipeline_for_feed(
    feed_url: str,
    publisher_name: str,
    tags: list[TopicTagConfig],
    dedup_service: DeduplicationService,
    config: PipelineConfig,
    assigned_category_id: Optional[str] = None,
    assigned_category_name: Optional[str] = None,
    assigned_category_color: Optional[str] = None,
    fallback_image_urls: Optional[list[str]] = None,
) -> tuple[list[NormalizedArticle], PipelineStats]:
    """
    Run the full ingestion pipeline for a single RSS feed.

    Pipeline steps:
    1. Fetch and parse RSS feed
    2. For each article: knockout filter → dedup → image → categorize → demand filter → normalize

    :param feed_url: RSS feed URL to process
    :param publisher_name: Publisher name for attribution
    :param tags: All available topic tags for categorization
    :param dedup_service: Shared deduplication service
    :param config: Pipeline configuration
    :param assigned_category_id: Pre-assigned category from RSS source (optional)
    :param assigned_category_name: Pre-assigned category name (optional)
    :param assigned_category_color: Pre-assigned category color (optional)
    :param fallback_image_urls: Buzzy Image Bank URLs for this category (optional)
    :returns: Tuple of (list of normalized articles, pipeline statistics)
    """
    log = logger.bind(feed_url=feed_url, publisher=publisher_name)
    stats = PipelineStats()

    # Step 1: Fetch RSS feed
    try:
        raw_articles = await read_feed(feed_url, publisher_name)
    except Exception as e:
        log.error("Feed fetch failed", error=str(e))
        return [], stats

    stats.articles_fetched = len(raw_articles)
    log.info("Pipeline started", articles=stats.articles_fetched)

    results: list[NormalizedArticle] = []

    for article in raw_articles:
        article_log = log.bind(title=article.title[:60])

        # Step 2: Knockout filter
        knockout_result = apply_knockout(
            article,
            min_word_count=config.min_word_count,
            require_image=config.require_image,
        )
        if not knockout_result.passed:
            stats.knocked_out += 1
            continue

        # Step 3: Deduplication
        if dedup_service.is_duplicate(article):
            stats.duplicates += 1
            continue

        url_hash, content_hash = dedup_service.mark_seen(article)

        # Step 4: Image selection
        section_name = assigned_category_name or ""
        image_result = await select_image(
            source_image_url=article.image_url,
            category_name=assigned_category_name or "General",
            section_name=section_name,
            fallback_image_urls=fallback_image_urls or [],
            pixabay_api_key=config.pixabay_api_key,
            min_width=config.image_min_width,
            min_height=config.image_min_height,
        )

        if not image_result:
            stats.no_image += 1
            article_log.debug("No suitable image found — skipping")
            continue

        # Step 5: Categorization
        cat_result = categorize_article(
            title=article.title,
            description=article.description,
            content=article.content,
            tags=tags,
            assigned_category_id=assigned_category_id,
            assigned_category_name=assigned_category_name,
            assigned_category_color=assigned_category_color,
        )

        if not cat_result:
            stats.uncategorized += 1
            continue

        # Step 6: Demand Filter (Phase 1)
        if not passes_demand_filter_phase1(cat_result.matched_tag_ids):
            stats.demand_filtered += 1
            continue

        # Step 7: Normalize
        normalized = normalize_article(
            title=article.title,
            description=article.description,
            content=article.content,
            source_url=article.source_url,
            source_publisher=publisher_name,
            published_at=article.published_at,
            image_url=image_result.url,
            image_source=image_result.source,
            feed_url=feed_url,
            category_tag_id=cat_result.primary_category_id,
            category_tag_name=cat_result.primary_category_name,
            category_color=cat_result.primary_category_color,
            topic_tag_ids=cat_result.matched_tag_ids,
            topic_tag_names=cat_result.matched_tag_names,
            categorization_score=cat_result.total_score,
            content_hash=content_hash,
            url_hash=url_hash,
            section_name=section_name,
            secondary_category_id=cat_result.secondary_category_id,
        )

        results.append(normalized)
        stats.normalized += 1

    log.info(
        "Pipeline completed",
        fetched=stats.articles_fetched,
        knocked_out=stats.knocked_out,
        duplicates=stats.duplicates,
        no_image=stats.no_image,
        uncategorized=stats.uncategorized,
        demand_filtered=stats.demand_filtered,
        normalized=stats.normalized,
    )

    return results, stats
