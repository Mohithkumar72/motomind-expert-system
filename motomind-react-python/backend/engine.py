"""
MotoMind - Rule-Based Inference Engine (Python)

Forward-Chaining Inference Mechanism:
1. Receives working memory facts (user selected symptoms).
2. Evaluates candidate production rules in the Knowledge Base.
3. Tests minimum activation conditions.
4. Computes deterministic confidence score (match percentage).
5. Prioritizes candidate diagnoses by match confidence, matched count, and severity weight.
"""

from typing import List, Dict, Any, Set
from rules import EXPERT_RULES, SYMPTOM_LOOKUP


class RuleBasedInferenceEngine:
    """
    Expert System Inference Engine that applies forward chaining pattern matching
    against the Knowledge Base rules.
    """

    SEVERITY_WEIGHT = {
        "High": 3,
        "Medium": 2,
        "Low": 1
    }

    def __init__(self, rules: List[Dict[str, Any]] = None):
        self.rules = rules if rules is not None else EXPERT_RULES

    def diagnose(self, selected_symptom_ids: List[str]) -> Dict[str, Any]:
        """
        Runs the forward-chaining diagnostic process on the given symptom IDs.
        """
        selected_set: Set[str] = set(selected_symptom_ids)
        diagnosed_faults: List[Dict[str, Any]] = []

        # Iterate over each rule in the Knowledge Base
        for rule in self.rules:
            rule_symptoms = rule["symptoms"]
            
            # Find intersection between user symptoms and rule preconditions
            matched_ids = [s for s in rule_symptoms if s in selected_set]
            match_count = len(matched_ids)

            # Rule fires if minimum required threshold is met
            if match_count >= rule.get("min_required", 1):
                total_rule_symptoms = len(rule_symptoms)
                match_percentage = round((match_count / total_rule_symptoms) * 100)

                # Map IDs to human-readable labels
                matched_labels = [
                    SYMPTOM_LOOKUP.get(s_id, {}).get("label", s_id)
                    for s_id in matched_ids
                ]

                # Identify unconfirmed symptoms in this rule
                missing_labels = [
                    SYMPTOM_LOOKUP.get(s_id, {}).get("label", s_id)
                    for s_id in rule_symptoms
                    if s_id not in selected_set
                ]

                diagnosed_faults.append({
                    "rule_id": rule["id"],
                    "fault": rule["fault"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "match_percentage": match_percentage,
                    "match_count": match_count,
                    "total_symptoms": total_rule_symptoms,
                    "matched_symptoms": matched_labels,
                    "missing_symptoms": missing_labels,
                    "rule_condition": rule["rule_condition"],
                    "explanation": rule["explanation"],
                    "troubleshooting": rule["troubleshooting"],
                    "mechanic_advice": rule["mechanic_advice"]
                })

        # Rank diagnoses:
        # 1. Match percentage descending
        # 2. Match count descending
        # 3. Severity priority (High > Medium > Low)
        diagnosed_faults.sort(
            key=lambda item: (
                item["match_percentage"],
                item["match_count"],
                self.SEVERITY_WEIGHT.get(item["severity"], 0)
            ),
            reverse=True
        )

        return {
            "status": "success",
            "symptoms_analyzed_count": len(selected_symptom_ids),
            "diagnosed_faults_count": len(diagnosed_faults),
            "results": diagnosed_faults
        }


# Singleton instance for simple imports
engine = RuleBasedInferenceEngine()


def run_diagnosis(selected_symptoms: List[str]) -> Dict[str, Any]:
    """Helper functional interface for diagnosing faults."""
    return engine.diagnose(selected_symptoms)
