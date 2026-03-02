"""
Post-processor for the Buzzy Today summarization pipeline.

Validates AI output structure, enforces word count limits, cleans
formatting, and prepares the final article record fields.

Dependencies: structlog
"""

from dataclasses import dataclass
from typing import Optional

import structlog

from .summarizer import SummarizationResult

logger = structlog.get_logger(__name__)


@dataclass
class ValidationResult:
    """Result of post-processing validation."""
    is_valid: bool
    errors: list[str]
    warnings: list[str]


def count_words(text: str) -> int:
    """
    Count words in a text string.

    :param text: Text to count
    :returns: Number of words
    """
    return len(text.split())


def validate_result(
    result: SummarizationResult,
    tldr_min: int = 12,
    tldr_max: int = 26,
    takeaway_min: int = 21,
    takeaway_max: int = 30,
    num_takeaways: int = 3,
) -> ValidationResult:
    """
    Validate a summarization result against content rules.

    :param result: The AI-generated summarization result
    :param tldr_min: Minimum TL;DR word count
    :param tldr_max: Maximum TL;DR word count
    :param takeaway_min: Minimum takeaway word count per bullet
    :param takeaway_max: Maximum takeaway word count per bullet
    :param num_takeaways: Expected number of key takeaways
    :returns: ValidationResult with any errors/warnings
    """
    errors: list[str] = []
    warnings: list[str] = []

    # Required fields
    if not result.headline:
        errors.append("Missing headline")
    if not result.tldr:
        errors.append("Missing TL;DR")
    if not result.snappy_sentence:
        warnings.append("Missing snappy sentence")

    # TL;DR word count
    if result.tldr:
        tldr_words = count_words(result.tldr)
        if tldr_words < tldr_min:
            warnings.append(f"TL;DR too short: {tldr_words} words (min {tldr_min})")
        if tldr_words > tldr_max:
            warnings.append(f"TL;DR too long: {tldr_words} words (max {tldr_max})")

    # Key takeaways count
    if len(result.key_takeaways) < num_takeaways:
        warnings.append(
            f"Only {len(result.key_takeaways)} takeaways (expected {num_takeaways})"
        )

    # Meta description length (150-160 chars)
    if result.meta_description:
        desc_len = len(result.meta_description)
        if desc_len < 140:
            warnings.append(f"Meta description short: {desc_len} chars")
        if desc_len > 170:
            warnings.append(f"Meta description long: {desc_len} chars")

    # SEO keywords count
    if len(result.seo_keywords) < 3:
        warnings.append(f"Only {len(result.seo_keywords)} SEO keywords")

    is_valid = len(errors) == 0

    if errors or warnings:
        logger.info(
            "Validation issues",
            headline=result.headline[:40],
            errors=errors,
            warnings=warnings,
        )

    return ValidationResult(
        is_valid=is_valid,
        errors=errors,
        warnings=warnings,
    )


def clean_headline(headline: str) -> str:
    """
    Clean and normalize a headline per Buzzy rules.
    Removes hyphens, em dashes, en dashes.

    :param headline: Raw headline string
    :returns: Cleaned headline
    """
    # Remove em dashes and en dashes
    cleaned = headline.replace("\u2014", " ").replace("\u2013", " ")
    # Remove regular hyphens between words (keep in compound words)
    cleaned = " ".join(cleaned.split())
    return cleaned.strip()


def clean_tldr(tldr: str) -> str:
    """
    Clean TL;DR text. Remove hyphens, semicolons, em dashes.

    :param tldr: Raw TL;DR string
    :returns: Cleaned TL;DR
    """
    cleaned = tldr.replace("\u2014", ",").replace("\u2013", ",")
    cleaned = cleaned.replace(";", ",")
    return cleaned.strip()
