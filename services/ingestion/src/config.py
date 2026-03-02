"""
Configuration loader for the ingestion service.
Reads environment variables and provides structured config objects.

Dependencies: python-dotenv, structlog
"""

import os
from dataclasses import dataclass
from dotenv import load_dotenv
import structlog

load_dotenv()

logger = structlog.get_logger(__name__)


@dataclass(frozen=True)
class FirebaseConfig:
    """Firebase project configuration."""
    project_id: str
    service_account_key: str


@dataclass(frozen=True)
class OpenAIConfig:
    """OpenAI API configuration."""
    api_key: str
    model: str = "gpt-5-nano"


@dataclass(frozen=True)
class PixabayConfig:
    """Pixabay image search configuration."""
    api_key: str


@dataclass(frozen=True)
class IngestionConfig:
    """Top-level configuration for the ingestion pipeline."""
    firebase: FirebaseConfig
    openai: OpenAIConfig
    pixabay: PixabayConfig
    min_word_count: int = 70
    require_image: bool = True
    image_min_width: int = 400
    image_min_height: int = 300


def load_config() -> IngestionConfig:
    """
    Load configuration from environment variables.

    :returns: Validated IngestionConfig
    :raises ValueError: If required environment variables are missing
    """
    firebase_project_id = os.getenv("FIREBASE_PROJECT_ID", "")
    firebase_key = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")
    pixabay_key = os.getenv("PIXABAY_API_KEY", "")

    if not firebase_project_id:
        logger.warning("FIREBASE_PROJECT_ID not set — using empty string")
    if not openai_key:
        logger.warning("OPENAI_API_KEY not set — AI features will be unavailable")

    return IngestionConfig(
        firebase=FirebaseConfig(
            project_id=firebase_project_id,
            service_account_key=firebase_key,
        ),
        openai=OpenAIConfig(
            api_key=openai_key,
        ),
        pixabay=PixabayConfig(
            api_key=pixabay_key,
        ),
    )
