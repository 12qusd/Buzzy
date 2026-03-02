"""
Prompt builder for the Buzzy Today summarization pipeline.

Assembles system and user prompts from admin-configured parameters,
resolving per-category overrides for tone, headline guide, reading level, etc.

Prompts are config — loaded from Firestore at runtime, never hardcoded.
The defaults here are fallbacks for development only.

Dependencies: structlog
"""

from dataclasses import dataclass
from typing import Optional

import structlog

logger = structlog.get_logger(__name__)


@dataclass(frozen=True)
class SummarizationParams:
    """Per-category summarization configuration."""
    category_name: str
    tone: str = "neutral"
    headline_guide: str = "Frame the story, don't explain it"
    reading_level: str = "general audience"
    hedge_level: str = "low"
    buzzy_take_style: str = "witty, punchy"
    emojis_allowed: bool = False
    tldr_words_min: int = 12
    tldr_words_max: int = 26
    takeaways_words_min: int = 21
    takeaways_words_max: int = 30
    num_seo_keywords: int = 7
    num_topic_tags: int = 2


@dataclass(frozen=True)
class AssembledPrompt:
    """System + user prompt pair ready for API call."""
    system_prompt: str
    user_prompt: str
    model: str


# Default system prompt — loaded from Firestore in production
DEFAULT_SYSTEM_PROMPT = """You are the news summarization engine for Buzzy Today, a fast, social, human-first digital newspaper with a slightly rebellious streak.

You will be given a full article. Your task is to produce a concise, engaging, SEO-friendly summary that is easy to scan, easy to understand, and written for real people.

Buzzy Today uses progressive disclosure:
- The headline frames the story
- The TL;DR explains what happened and why it matters
- The key takeaways lock in understanding

Return your response as valid JSON with the following fields:
- headline: string (8-10 words, active voice)
- tldr: string ({tldr_min}-{tldr_max} words)
- key_takeaways: array of 3 strings ({takeaway_min}-{takeaway_max} words each)
- buzzy_take: string (1-2 sentences, optional perspective/humor)
- seo_keywords: array of {num_keywords} strings
- meta_description: string (150-160 characters)
- topic_tags: array of {num_tags} strings
- snappy_sentence: string (one punchy sentence for thumbnail view)
- location: string or null (AP-style dateline city/state if identifiable)"""


def build_prompt(
    article_title: str,
    article_content: str,
    source: str,
    publication_date: str,
    params: SummarizationParams,
    system_prompt_template: Optional[str] = None,
    model: str = "gpt-5-nano",
) -> AssembledPrompt:
    """
    Assemble the full prompt pair for AI summarization.

    :param article_title: The article headline
    :param article_content: The full article text
    :param source: Publisher/source name
    :param publication_date: ISO date string of publication
    :param params: Per-category summarization parameters
    :param system_prompt_template: Custom system prompt (uses default if None)
    :param model: OpenAI model to use
    :returns: AssembledPrompt with system and user prompts
    """
    # Build system prompt with parameter substitution
    template = system_prompt_template or DEFAULT_SYSTEM_PROMPT
    system_prompt = template.format(
        tldr_min=params.tldr_words_min,
        tldr_max=params.tldr_words_max,
        takeaway_min=params.takeaways_words_min,
        takeaway_max=params.takeaways_words_max,
        num_keywords=params.num_seo_keywords,
        num_tags=params.num_topic_tags,
    )

    # Add per-category style instructions
    style_instructions = (
        f"\n\nCategory: {params.category_name}\n"
        f"Tone: {params.tone}\n"
        f"Headline Guide: {params.headline_guide}\n"
        f"Reading Level: {params.reading_level}\n"
        f"Hedge Level: {params.hedge_level}\n"
        f"Buzzy Take Style: {params.buzzy_take_style}\n"
        f"Emojis Allowed: {'yes' if params.emojis_allowed else 'no'}"
    )
    system_prompt += style_instructions

    # Build user prompt
    # Truncate content to stay within token limits
    max_content_chars = 6000
    truncated_content = article_content[:max_content_chars]
    if len(article_content) > max_content_chars:
        truncated_content += "\n[Content truncated]"

    user_prompt = (
        f"Summarize the following article for the '{params.category_name}' category.\n\n"
        f"Title: {article_title}\n"
        f"Source: {source}\n"
        f"Published: {publication_date}\n\n"
        f"Article Content:\n{truncated_content}"
    )

    logger.debug(
        "Prompt assembled",
        category=params.category_name,
        model=model,
        content_chars=len(truncated_content),
    )

    return AssembledPrompt(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        model=model,
    )
