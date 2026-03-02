"""
Demand Filter for the Buzzy Today ingestion pipeline.

Phase 1: Only articles with ≥1 approved tag enter the candidate pool.
Full version (Milestone 5): Three-tier priority system.

Dependencies: structlog
"""

import structlog

logger = structlog.get_logger(__name__)


def passes_demand_filter_phase1(matched_tag_ids: list[str]) -> bool:
    """
    Phase 1 demand filter: require at least 1 approved tag match.

    :param matched_tag_ids: List of matched topic tag IDs from categorization
    :returns: True if the article has at least 1 matching tag
    """
    passed = len(matched_tag_ids) >= 1

    if not passed:
        logger.info("Demand filter: rejected — no matching tags")

    return passed
