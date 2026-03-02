"""Tests for the demand filter."""

from src.demand_filter import passes_demand_filter_phase1


class TestDemandFilterPhase1:
    def test_passes_with_one_tag(self):
        assert passes_demand_filter_phase1(["tag-1"]) is True

    def test_passes_with_multiple_tags(self):
        assert passes_demand_filter_phase1(["tag-1", "tag-2", "tag-3"]) is True

    def test_rejects_with_no_tags(self):
        assert passes_demand_filter_phase1([]) is False
