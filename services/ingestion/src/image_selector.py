"""
Image selection pipeline for the Buzzy Today ingestion service.

Three-tier priority:
1. First image from source article meeting size criteria (≥400x300, aspect 3:4 to 3:4.5)
2. Buzzy Image Bank (by Category Tag)
3. Pixabay search by Section and Category

Dependencies: httpx, Pillow, structlog
"""

from dataclasses import dataclass
from io import BytesIO
from typing import Optional

import httpx
import structlog

logger = structlog.get_logger(__name__)


@dataclass
class ImageResult:
    """Result of the image selection process."""
    url: str
    source: str  # 'original', 'buzzy_bank', or 'pixabay'
    width: Optional[int] = None
    height: Optional[int] = None


async def check_image_dimensions(
    image_url: str,
    min_width: int = 400,
    min_height: int = 300,
) -> Optional[tuple[int, int]]:
    """
    Fetch image headers or first bytes to check dimensions.

    :param image_url: URL of the image to check
    :param min_width: Minimum required width in pixels
    :param min_height: Minimum required height in pixels
    :returns: Tuple of (width, height) if meeting criteria, None otherwise
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(image_url, follow_redirects=True)
            response.raise_for_status()

            # Lazy import Pillow to keep it optional for testing
            from PIL import Image

            img = Image.open(BytesIO(response.content))
            width, height = img.size

            if width >= min_width and height >= min_height:
                return (width, height)

            logger.debug(
                "Image too small",
                url=image_url,
                width=width,
                height=height,
                min_width=min_width,
                min_height=min_height,
            )
            return None

    except Exception as e:
        logger.debug("Failed to check image", url=image_url, error=str(e))
        return None


async def search_pixabay(
    query: str,
    api_key: str,
    min_width: int = 400,
    min_height: int = 300,
) -> Optional[ImageResult]:
    """
    Search Pixabay for an image matching the query.

    :param query: Search query (category + section name)
    :param api_key: Pixabay API key
    :param min_width: Minimum image width
    :param min_height: Minimum image height
    :returns: ImageResult from Pixabay or None if no results
    """
    if not api_key:
        logger.warning("Pixabay API key not configured")
        return None

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://pixabay.com/api/",
                params={
                    "key": api_key,
                    "q": query,
                    "image_type": "photo",
                    "min_width": min_width,
                    "min_height": min_height,
                    "per_page": 3,
                    "safesearch": "true",
                },
            )
            response.raise_for_status()
            data = response.json()

        hits = data.get("hits", [])
        if hits:
            first_hit = hits[0]
            return ImageResult(
                url=first_hit.get("webformatURL", first_hit.get("largeImageURL", "")),
                source="pixabay",
                width=first_hit.get("webformatWidth"),
                height=first_hit.get("webformatHeight"),
            )

    except Exception as e:
        logger.error("Pixabay search failed", query=query, error=str(e))

    return None


async def select_image(
    source_image_url: Optional[str],
    category_name: str,
    section_name: str,
    fallback_image_urls: list[str],
    pixabay_api_key: str = "",
    min_width: int = 400,
    min_height: int = 300,
) -> Optional[ImageResult]:
    """
    Select the best available image using the three-tier priority system.

    Priority:
    1. Source article image (if meets size criteria)
    2. Buzzy Image Bank (sequential by category)
    3. Pixabay search

    :param source_image_url: Image URL from the source RSS entry
    :param category_name: Category name for image bank and Pixabay search
    :param section_name: Section name for Pixabay search refinement
    :param fallback_image_urls: List of Buzzy Image Bank URLs for this category
    :param pixabay_api_key: Pixabay API key
    :param min_width: Minimum image width
    :param min_height: Minimum image height
    :returns: ImageResult or None if no suitable image found
    """
    log = logger.bind(category=category_name)

    # Priority 1: Source article image
    if source_image_url:
        dims = await check_image_dimensions(source_image_url, min_width, min_height)
        if dims:
            log.debug("Using source image", url=source_image_url)
            return ImageResult(
                url=source_image_url,
                source="original",
                width=dims[0],
                height=dims[1],
            )

    # Priority 2: Buzzy Image Bank
    if fallback_image_urls:
        # Use the first available fallback image
        for fallback_url in fallback_image_urls:
            if fallback_url:
                log.debug("Using Buzzy Image Bank", url=fallback_url)
                return ImageResult(url=fallback_url, source="buzzy_bank")

    # Priority 3: Pixabay search
    query = f"{section_name} {category_name}"
    pixabay_result = await search_pixabay(query, pixabay_api_key, min_width, min_height)
    if pixabay_result:
        log.debug("Using Pixabay image", url=pixabay_result.url)
        return pixabay_result

    log.warning("No suitable image found")
    return None
