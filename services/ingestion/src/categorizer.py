"""
Categorization engine for the Buzzy Today ingestion pipeline.

Scores articles against topic tags per category to determine category assignment.
Scoring: Title match: 5 pts, Description match: 3 pts, Content match: 1 pt.

Dependencies: structlog, beautifulsoup4
"""

from dataclasses import dataclass
from typing import Optional

from bs4 import BeautifulSoup
import structlog

logger = structlog.get_logger(__name__)


# Tag match weights
TITLE_WEIGHT = 5
DESCRIPTION_WEIGHT = 3
CONTENT_WEIGHT = 1


@dataclass
class TagMatch:
    """A topic tag match result with scoring details."""
    tag_id: str
    tag_name: str
    category_id: str
    category_name: str
    score: int
    matched_in_title: bool
    matched_in_description: bool
    matched_in_content: bool


@dataclass
class CategorizationResult:
    """Result of categorizing an article."""
    primary_category_id: str
    primary_category_name: str
    primary_category_color: str
    matched_tag_ids: list[str]
    matched_tag_names: list[str]
    total_score: int
    secondary_category_id: Optional[str] = None
    secondary_category_name: Optional[str] = None


@dataclass
class TopicTagConfig:
    """Configuration for a topic tag used in categorization."""
    tag_id: str
    tag_name: str
    canonical_name: str
    synonyms: list[str]
    category_id: str
    category_name: str
    category_color: str


def _strip_html(html: str) -> str:
    """Strip HTML tags from content."""
    if not html:
        return ""
    return BeautifulSoup(html, "lxml").get_text(separator=" ", strip=True)


def _text_contains_term(text: str, term: str) -> bool:
    """
    Check if text contains a term (case-insensitive, word-boundary aware).

    :param text: The text to search in
    :param term: The term to search for
    :returns: True if the term is found
    """
    return f" {term.lower()} " in f" {text.lower()} "


def score_article_against_tags(
    title: str,
    description: str,
    content: str,
    tags: list[TopicTagConfig],
) -> list[TagMatch]:
    """
    Score an article against a list of topic tags.

    For each tag, checks if the canonical name or any synonym appears in the
    article's title, description, and content, applying weighted scoring.

    :param title: Article title (plain text)
    :param description: Article description (may contain HTML)
    :param content: Article content (may contain HTML)
    :param tags: List of topic tag configurations to score against
    :returns: List of TagMatch results sorted by score descending
    """
    clean_description = _strip_html(description)
    clean_content = _strip_html(content)

    matches: list[TagMatch] = []

    for tag in tags:
        terms = [tag.canonical_name] + tag.synonyms

        in_title = any(_text_contains_term(title, t) for t in terms)
        in_description = any(_text_contains_term(clean_description, t) for t in terms)
        in_content = any(_text_contains_term(clean_content, t) for t in terms)

        score = 0
        if in_title:
            score += TITLE_WEIGHT
        if in_description:
            score += DESCRIPTION_WEIGHT
        if in_content:
            score += CONTENT_WEIGHT

        if score > 0:
            matches.append(
                TagMatch(
                    tag_id=tag.tag_id,
                    tag_name=tag.tag_name,
                    category_id=tag.category_id,
                    category_name=tag.category_name,
                    score=score,
                    matched_in_title=in_title,
                    matched_in_description=in_description,
                    matched_in_content=in_content,
                )
            )

    matches.sort(key=lambda m: m.score, reverse=True)
    return matches


def categorize_article(
    title: str,
    description: str,
    content: str,
    tags: list[TopicTagConfig],
    assigned_category_id: Optional[str] = None,
    assigned_category_name: Optional[str] = None,
    assigned_category_color: Optional[str] = None,
) -> Optional[CategorizationResult]:
    """
    Categorize an article by scoring against topic tags.

    If an assigned_category_id is provided (from RSS source config),
    the article is placed in that category directly.

    Otherwise, scores are aggregated per category and the highest-scoring
    category is selected as primary, with optional secondary.

    :param title: Article title
    :param description: Article description
    :param content: Article full content
    :param tags: All available topic tags to score against
    :param assigned_category_id: Pre-assigned category from RSS source (optional)
    :param assigned_category_name: Pre-assigned category name (optional)
    :param assigned_category_color: Pre-assigned category color (optional)
    :returns: CategorizationResult or None if no tags match
    """
    log = logger.bind(title=title[:80])

    # If pre-assigned by RSS source config, use that category
    if assigned_category_id and assigned_category_name and assigned_category_color:
        category_tags = [t for t in tags if t.category_id == assigned_category_id]
        matches = score_article_against_tags(title, description, content, category_tags)

        log.info(
            "Categorized by RSS source assignment",
            category=assigned_category_name,
            tag_matches=len(matches),
        )

        return CategorizationResult(
            primary_category_id=assigned_category_id,
            primary_category_name=assigned_category_name,
            primary_category_color=assigned_category_color,
            matched_tag_ids=[m.tag_id for m in matches],
            matched_tag_names=[m.tag_name for m in matches],
            total_score=sum(m.score for m in matches),
        )

    # Score against all tags across all categories
    matches = score_article_against_tags(title, description, content, tags)

    if not matches:
        log.info("No tag matches found — cannot categorize")
        return None

    # Aggregate scores per category
    category_scores: dict[str, int] = {}
    category_info: dict[str, tuple[str, str]] = {}  # id → (name, color)

    for match in matches:
        category_scores[match.category_id] = (
            category_scores.get(match.category_id, 0) + match.score
        )
        if match.category_id not in category_info:
            category_info[match.category_id] = (match.category_name, "")
            # Find the color from the tag config
            for tag in tags:
                if tag.category_id == match.category_id:
                    category_info[match.category_id] = (
                        match.category_name,
                        tag.category_color,
                    )
                    break

    # Sort categories by score
    sorted_categories = sorted(
        category_scores.items(), key=lambda x: x[1], reverse=True
    )

    primary_cat_id = sorted_categories[0][0]
    primary_name, primary_color = category_info[primary_cat_id]
    primary_tags = [m for m in matches if m.category_id == primary_cat_id]

    # Optional secondary category
    secondary_cat_id = None
    secondary_name = None
    if len(sorted_categories) > 1:
        secondary_cat_id = sorted_categories[1][0]
        secondary_name = category_info[secondary_cat_id][0]

    total_score = sum(m.score for m in primary_tags)

    log.info(
        "Categorized by tag scoring",
        primary_category=primary_name,
        primary_score=total_score,
        tag_matches=len(primary_tags),
    )

    return CategorizationResult(
        primary_category_id=primary_cat_id,
        primary_category_name=primary_name,
        primary_category_color=primary_color,
        matched_tag_ids=[m.tag_id for m in primary_tags],
        matched_tag_names=[m.tag_name for m in primary_tags],
        total_score=total_score,
        secondary_category_id=secondary_cat_id,
        secondary_category_name=secondary_name,
    )
