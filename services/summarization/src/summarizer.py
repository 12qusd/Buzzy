"""
AI summarizer for the Buzzy Today summarization pipeline.

Calls the OpenAI API with assembled prompts to generate structured
article summaries. Handles retries, timeouts, and error logging.

Dependencies: openai, structlog
"""

import json
from dataclasses import dataclass
from typing import Optional

import structlog

from .prompt_builder import AssembledPrompt

logger = structlog.get_logger(__name__)


@dataclass
class SummarizationResult:
    """Structured output from the AI summarization."""
    headline: str
    tldr: str
    key_takeaways: list[str]
    buzzy_take: Optional[str]
    seo_keywords: list[str]
    meta_description: str
    topic_tags: list[str]
    snappy_sentence: str
    location: Optional[str]
    model_used: str
    prompt_tokens: int = 0
    completion_tokens: int = 0


async def summarize_article(
    prompt: AssembledPrompt,
    openai_api_key: str,
    max_retries: int = 2,
    timeout: float = 30.0,
) -> Optional[SummarizationResult]:
    """
    Call the OpenAI API to generate a structured article summary.

    :param prompt: Assembled system + user prompt
    :param openai_api_key: OpenAI API key
    :param max_retries: Number of retry attempts on failure
    :param timeout: API request timeout in seconds
    :returns: SummarizationResult or None on failure
    """
    if not openai_api_key:
        logger.error("OpenAI API key not configured")
        return None

    # Lazy import
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=openai_api_key, timeout=timeout)

    for attempt in range(max_retries + 1):
        try:
            response = await client.chat.completions.create(
                model=prompt.model,
                messages=[
                    {"role": "system", "content": prompt.system_prompt},
                    {"role": "user", "content": prompt.user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1000,
            )

            content = response.choices[0].message.content
            if not content:
                logger.warning("Empty response from AI", attempt=attempt)
                continue

            data = json.loads(content)

            usage = response.usage
            prompt_tokens = usage.prompt_tokens if usage else 0
            completion_tokens = usage.completion_tokens if usage else 0

            result = SummarizationResult(
                headline=data.get("headline", ""),
                tldr=data.get("tldr", ""),
                key_takeaways=data.get("key_takeaways", [])[:3],
                buzzy_take=data.get("buzzy_take"),
                seo_keywords=data.get("seo_keywords", [])[:7],
                meta_description=data.get("meta_description", ""),
                topic_tags=data.get("topic_tags", [])[:3],
                snappy_sentence=data.get("snappy_sentence", ""),
                location=data.get("location"),
                model_used=prompt.model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
            )

            logger.info(
                "Summarization complete",
                model=prompt.model,
                headline=result.headline[:60],
                tokens=prompt_tokens + completion_tokens,
            )

            return result

        except json.JSONDecodeError as e:
            logger.warning(
                "Invalid JSON from AI",
                error=str(e),
                attempt=attempt,
            )
        except Exception as e:
            logger.error(
                "Summarization API call failed",
                error=str(e),
                attempt=attempt,
            )

    logger.error("Summarization failed after all retries")
    return None
