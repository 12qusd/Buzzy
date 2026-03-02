"""
Structured logging configuration for the ingestion service.
Uses structlog with JSON output for production, colored console for development.

Dependencies: structlog
"""

import os
import sys
import structlog


def setup_logging() -> None:
    """
    Configure structlog with JSON or console output based on environment.
    Call once at application startup.
    """
    is_production = os.getenv("NODE_ENV") == "production"

    processors: list[structlog.types.Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
    ]

    if is_production:
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(
            structlog.dev.ConsoleRenderer(colors=sys.stderr.isatty())
        )

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
