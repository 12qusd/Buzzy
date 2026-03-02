"""Tests for the prompt builder."""

from src.prompt_builder import SummarizationParams, build_prompt


class TestBuildPrompt:
    def test_builds_prompt_with_defaults(self):
        params = SummarizationParams(category_name="Tech")
        result = build_prompt(
            article_title="AI Changes Everything",
            article_content="Full article content here " * 50,
            source="TechCrunch",
            publication_date="2026-03-01",
            params=params,
        )
        assert "Tech" in result.system_prompt
        assert "AI Changes Everything" in result.user_prompt
        assert "TechCrunch" in result.user_prompt
        assert result.model == "gpt-5-nano"

    def test_includes_category_style(self):
        params = SummarizationParams(
            category_name="Sports",
            tone="energetic",
            headline_guide="Focus on the action",
            buzzy_take_style="passionate sports fan",
        )
        result = build_prompt(
            article_title="Title",
            article_content="Content",
            source="ESPN",
            publication_date="2026-01-01",
            params=params,
        )
        assert "energetic" in result.system_prompt
        assert "passionate sports fan" in result.system_prompt

    def test_truncates_long_content(self):
        long_content = "word " * 5000  # 25,000 chars
        params = SummarizationParams(category_name="Tech")
        result = build_prompt(
            article_title="Title",
            article_content=long_content,
            source="Source",
            publication_date="2026-01-01",
            params=params,
        )
        assert "[Content truncated]" in result.user_prompt

    def test_custom_model(self):
        params = SummarizationParams(category_name="News")
        result = build_prompt(
            article_title="Title",
            article_content="Content",
            source="Source",
            publication_date="2026-01-01",
            params=params,
            model="gpt-4o",
        )
        assert result.model == "gpt-4o"

    def test_word_limits_in_system_prompt(self):
        params = SummarizationParams(
            category_name="Tech",
            tldr_words_min=15,
            tldr_words_max=30,
        )
        result = build_prompt(
            article_title="Title",
            article_content="Content",
            source="Source",
            publication_date="2026-01-01",
            params=params,
        )
        assert "15" in result.system_prompt
        assert "30" in result.system_prompt
