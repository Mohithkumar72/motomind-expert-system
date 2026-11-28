"""
Automated Logic & Rule Test for MotoMind Python Backend
"""

from rules import EXPERT_RULES, SYMPTOM_CATEGORIES
from engine import run_diagnosis


def test_internal_logic():
    print("[TEST 1] Verifying Knowledge Base & Symptoms...")
    assert len(SYMPTOM_CATEGORIES) == 4, f"Expected 4 categories, got {len(SYMPTOM_CATEGORIES)}"
    assert len(EXPERT_RULES) >= 12, f"Expected 12+ rules, got {len(EXPERT_RULES)}"
    print(f" -> Passed ({len(SYMPTOM_CATEGORIES)} categories, {len(EXPERT_RULES)} rules)")

    print("[TEST 2] Verifying Dead Battery Scenario...")
    res = run_diagnosis(["bike_wont_start", "clicking_sound_starting", "headlight_not_working"])
    assert res["status"] == "success"
    assert len(res["results"]) > 0
    top = res["results"][0]
    assert top["fault"] == "Discharged or Dead Battery"
    assert top["match_percentage"] == 100
    print(f" -> Passed (Top diagnosis: {top['fault']} - {top['match_percentage']}%)")

    print("[TEST 3] Verifying Engine Overheating Scenario...")
    res = run_diagnosis(["engine_overheating", "engine_unusual_noises", "poor_acceleration"])
    top = res["results"][0]
    assert "Overheating" in top["fault"]
    assert top["match_percentage"] == 100
    print(f" -> Passed (Top diagnosis: {top['fault']} - {top['match_percentage']}%)")

    print("[TEST 4] Verifying Clogged Carb / Air Filter Scenario...")
    res = run_diagnosis(["low_mileage", "poor_acceleration", "engine_stopping_frequently"])
    top = res["results"][0]
    assert "Clogged Air Filter" in top["fault"] or "Carburetor" in top["fault"]
    assert top["match_percentage"] == 100
    print(f" -> Passed (Top diagnosis: {top['fault']} - {top['match_percentage']}%)")

    print("[TEST 5] Verifying Electrical Short / Blown Fuse Scenario...")
    res = run_diagnosis(["headlight_not_working", "horn_not_working", "self_start_not_working"])
    top = res["results"][0]
    assert "Blown Main Fuse" in top["fault"]
    assert top["match_percentage"] == 100
    print(f" -> Passed (Top diagnosis: {top['fault']} - {top['match_percentage']}%)")

    print("\nALL LOGIC TESTS PASSED SUCCESSFULLY! (100% Deterministic & Rule-Compliant)")


if __name__ == "__main__":
    test_internal_logic()
