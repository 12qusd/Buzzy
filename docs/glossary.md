# Buzzy Today — Platform Glossary

Terms used consistently across all documentation, code, and communications.

## A

**Admin Panel** — Internal web interface for managing RSS sources, Topic Tags, Buzzwords, AI prompts, publishing quotas, and reports.

**AI Confidence Score** — Numeric value stored with AI-suggested Topic Tags indicating relevance confidence. Used in editorial review.

**AP Style Dateline** — Location + timestamp above TL;DR. Format: `(NEW YORK) — Jan. 20, 2026, 11:12 a.m. ET`

**Article** — Unit of content ingested from RSS. Lifecycle: raw → potential_candidate → candidate → permanent.

**Article Page** — SEO-optimized permalink page for Permanent Articles.

## B

**Bookmark** — User action saving an article for later. A personalization signal.

**Buzzy Browser** — Primary swipe-based content consumption interface.

**Buzzy Image Bank** — Internal image library by category. Second-priority image source.

**Buzzy Take** — AI-generated editorial perspective. Optional per article.

**Buzzword** — Internal scoring signal boosting article ranking. Not user-facing.

## C

**Candidate Article** — Article that passed all filters and is shown to users. Accumulates engagement points toward Permanent status.

**Candidate Score** — Ranking score based on topic tag frequency and follower counts.

**Category Tag** — Top-level content section (Tech, Sports, etc.) with config, colors, quotas.

**Content Clump** — Homepage module powered by a tag, category, or signal. Max 1 per tag visible at a time.

## D

**Daily Digest** — Static daily summary page. Generated once per day at scheduled time.

**Demand Filter** — Controls which articles enter the system based on followed tags, buzzwords, and category quotas.

## F

**F&E Algorithm** — Freshness & Engagement score. Formula: `(views + likes + comments + shares + buzzword) / (days + 1)`. Calculated once at ingestion.

## I

**Interest Graph** — Weighted network connecting a user to Category Tags and Topic Tags. Updated by engagement signals, decays over time.

## K

**Knockout Filter** — Ingestion gate rejecting articles with <70 words or missing images.

## P

**Permanent Article** — Candidate Article crossing engagement threshold (default 10 points). Gets full SEO page.

**Promotion Points** — Click: 1, Comment: 5, Share: 10. Threshold configurable per Category Tag.

## S

**Signal** — User engagement event (impression, click, like, comment, share, follow, etc.) feeding the Interest Graph.

**Signal Weights** — Impression: 0, Click: 1, Tap: 2, Scroll: 3, Like: 5, Comment: 8, Share: 10, Follow Topic: 20, Follow Category: 15.

**Slug** — Lowercase, hyphen-separated, URL-safe identifier. Unique per tag/article at DB level.

## T

**Tag Ticker** — Scrolling topic/category ticker at top of Homepage based on user interests and trends.

**Topic Tag** — Fine-grained metadata label (e.g., #AI, #Tesla). Canonical form with synonyms. Followable, used for personalization and categorization.

**Topic Tag Type** — Classification bucket (Person, Company, Technology, etc.). Full list in code.
