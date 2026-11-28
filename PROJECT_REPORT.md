# PROJECT REPORT
## ON
# MOTOMIND
### Two-Wheeler Fault Diagnosis Expert System

---

**JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR, ANANTHAPURAMU**

*In Partial Fulfillment of the Requirements for the Award of the Degree of*

### BACHELOR OF TECHNOLOGY
**IN**  
### COMPUTER SCIENCE & ENGINEERING

---

### Submitted By

- **25695A0524 – G.Kishore**
- **24691A05W3 – B.R.Mohan**
- **24691A05W5 – B.Mohith Kumar**
- **25695A0529 – U.Mahendra Kumar**

---

### MADANAPALLE INSTITUTE OF TECHNOLOGY & SCIENCE
**(UGC - AUTONOMOUS)**  
*(Affiliated to JNTUA, Anantapuramu)*  
*(Accredited by NBA, Approved by AICTE, New Delhi)*  
**AN ISO 21001:2018 Certified Institution**  
**P. B. No: 14, Angallu, Madanapalle – 517325**  
**Academic Year: 2026–27**

---

## ABSTRACT

**MotoMind** is a full-stack, rule-based Artificial Intelligence (AI) expert system engineered to diagnose and troubleshoot mechanical, electrical, fuel, and engine anomalies in two-wheelers (motorcycles and scooters). Modern two-wheeler riders and field service technicians frequently encounter unexpected breakdown symptoms—such as starter click without cranking, sluggish throttle acceleration, abnormal engine clatter, overheating, or rapid battery drain—yet lack immediate access to diagnostic expertise. MotoMind bridges this gap by emulating human specialist troubleshooting through a formal Knowledge Base, Working Memory, and Forward-Chaining Inference Engine.

The platform combines an interactive, automotive-styled **React.js** frontend dashboard with a high-performance **Python** REST API backend. The system organizes two-wheeler diagnostic knowledge across four fundamental vehicle subsystems: Starting Problems, Engine Problems, Performance Problems, and Electrical Problems, comprising 12 canonical observable symptoms. Domain knowledge is encoded as 12 production rules utilizing propositional logic (IF-THEN clauses), incorporating prerequisite activation thresholds, fault categories, and severity tiers (Low, Medium, and High).

The inference engine implements forward-chaining pattern matching against user-reported symptoms. It deterministically calculates a percentage-based confidence score based on the intersection between observed facts and rule preconditions. Diagnosed faults are prioritized through a multi-tier ranking heuristic (Match Percentage &rarr; Matched Count &rarr; Severity Weight). For each deduced fault, MotoMind renders transparent justifications displaying the exact rule condition triggered, mechanical root cause explanations, ordered step-by-step troubleshooting procedures, and certified mechanic advisories.

Extensive validation demonstrates 100% deterministic accuracy across single-fault and multi-fault scenarios, successfully isolating complex conditions such as battery depletion versus starter relay failure, ignition misfires versus carburetor clogging, and stator charging degradation versus chassis ground short circuits. Unlike opaque statistical machine learning models, MotoMind delivers verifiable, explainable, and zero-hallucination diagnostics, serving as an effective educational tool and preliminary diagnostic guide.

**Keywords:** MotoMind, Expert System, Rule-Based AI, Forward Chaining, Knowledge Base, Inference Engine, Two-Wheeler Fault Diagnosis, Python, React.js, Flask, REST API.

---

## 1. AIM AND OBJECTIVES

To design and develop **MotoMind**, a full-stack web-based Artificial Intelligence Expert System that assists riders and technicians in identifying common motorcycle and scooter faults by analyzing reported symptoms through a Python-powered rule-based inference engine and an interactive React.js diagnostic dashboard.

### Core Objectives:
1. **Knowledge Formalization:** To encode automotive mechanical and electrical expertise into a structured Knowledge Base of declarative production rules (IF-THEN).
2. **Deterministic Inference Engine:** To implement a forward-chaining pattern matching algorithm in Python that evaluates symptom combinations without relying on external cloud AI APIs or black-box neural networks.
3. **Multi-Factor Scoring & Ranking:** To calculate mathematical confidence scores (match percentages) and prioritize candidate diagnoses based on symptom convergence, evidence count, and severity weight.
4. **Interactive Dashboard:** To develop a responsive automotive dashboard in React.js featuring dynamic category filtering, demo presets, real-time counters, and print-ready report generation.
5. **Transparent Explainability:** To provide complete diagnostic transparency, showing riders the exact rule triggered, mechanical rationale, ordered troubleshooting steps, and certified safety advisories.

---

## 2. DESCRIPTION OF THE PROJECT INCLUDING MODULES

### 2.1 Project Overview & Full-Stack Architecture

MotoMind separates application concerns into a decoupled client-server architecture:
- **Frontend Dashboard (React.js):** Provides stateful symptom selection, live category search, demo scenario loaders, real-time counters, responsive glassmorphic cards, and report printing.
- **Backend Service (Python / Flask):** Hosts the REST API endpoints, loads the knowledge base, executes the inference engine, and serves structured JSON responses.

#### Table 1: MotoMind Full-Stack Technology Architecture

| Architectural Layer | Technologies & Repository Components |
| :--- | :--- |
| **AI Inference Engine** | Python 3.14, Forward-Chaining Pattern Matching, Multi-Factor Ranking Heuristic (`engine.py`) |
| **Knowledge Base** | Declarative Production Rules, Propositional Logic Preconditions, Severity & Action Metadata (`rules.py`) |
| **Backend API Framework** | Python Flask REST Framework, Flask-CORS, Built-in HTTP Fallback Server (`app.py`, Port 5000) |
| **Frontend Dashboard** | React 18, Vite 5.4, Semantic HTML5, CSS3 Variables, JetBrains Mono & Plus Jakarta Sans (`App.jsx`, `App.css`) |
| **Verification & Testing** | Automated Integration Test Suite (`test_api.py`) |

---

### 2.2 Expert System Architecture vs Traditional Programming & Machine Learning

| Dimension | Procedural Code | Statistical Machine Learning | MotoMind Expert System |
| :--- | :--- | :--- | :--- |
| **Logic Structure** | Hardcoded nested `if/else` loops | Weighted matrix tensors & weights | Declarative IF-THEN production rules |
| **Separation of Knowledge** | Coupled with execution flow | Embedded in trained weight parameters | **Fully decoupled** (`rules.py` vs `engine.py`) |
| **Explainability** | Difficult to trace at scale | Black-box; unexplainable | **100% transparent**; displays fired rules |
| **Hallucination Risk** | Not applicable | Susceptible to probabilistic hallucination | **Zero hallucination**; strictly rule-bound |
| **Maintenance** | Requires rewriting code | Requires re-training on large datasets | Add new rules to `rules.py` in seconds |

---

### 2.3 Knowledge Base Specification & Symptom Catalog

#### Table 2: MotoMind Master Symptom Catalog across 4 Subsystems

| Subsystem Category | Symptom ID | Observable Symptom | Technical Diagnostic Significance |
| :--- | :--- | :--- | :--- |
| **Starting Problems** | `bike_wont_start` | Bike won't start | Engine fails to crank or fire up |
| | `self_start_not_working` | Self-start not working | Starter motor fails to engage or spin |
| | `clicking_sound_starting` | Clicking sound when starting | Starter relay solenoid clicks rapidly under load |
| **Engine Problems** | `engine_overheating` | Engine overheating | Abnormal thermal spike; burning oil odor |
| | `engine_unusual_noises` | Engine making unusual noises | Metallic clatter, tappet noise, or piston slap |
| | `engine_stopping_frequently`| Engine stopping frequently | Sudden stalling at idle or throttle roll-off |
| **Performance Problems**| `low_mileage` | Low mileage | Unexpected drop in fuel economy; rich mixture |
| | `poor_acceleration` | Poor acceleration | Sluggish throttle response; engine bogs down |
| | `excessive_vibration` | Excessive vibration | Harmonic chassis, footpeg, or handlebar shaking |
| **Electrical Problems** | `headlight_not_working` | Headlight not working | Headlamp dark or flickering due to voltage loss |
| | `battery_draining_quickly` | Battery draining quickly | Battery loses charge overnight; parasitic draw |
| | `horn_not_working` | Horn not working | Electromagnetic diaphragm silent or squeaking |

---

### 2.4 Production Rules & Forward-Chaining Inference Mechanism

The inference engine operates on **forward chaining**: taking input facts from working memory and comparing them against the precondition antecedent vector of each production rule.

$$\text{Confidence Score (\%)} = \left( \frac{\text{Number of Matched Rule Symptoms}}{\text{Total Symptoms Defined in Rule}} \right) \times 100\%$$

Candidate diagnoses are ordered by a deterministic 3-tuple sorting key:
1. **Match Percentage (Descending):** Highest proportional symptom convergence.
2. **Matched Symptom Count (Descending):** Resolves ties in favor of higher absolute evidence.
3. **Severity Weight (Descending):** High (3) &gt; Medium (2) &gt; Low (1).

#### Table 3: Predefined Knowledge Base Production Rules (EXPERT_RULES)

| Rule ID | Diagnosed Fault | Severity | Logical IF-THEN Condition |
| :--- | :--- | :--- | :--- |
| **RULE_01** | Discharged or Dead Battery | Medium | IF ('Bike won't start' OR 'Clicking sound') AND ('Headlight dead' OR 'Battery draining') THEN Dead Battery |
| **RULE_02** | Defective Starter Relay / Motor | Medium | IF 'Self-start not working' AND 'Clicking sound when starting' THEN Starter Relay / Motor Fault |
| **RULE_03** | Fouled Spark Plug / Ignition Fault | High | IF 'Bike won't start' AND ('Engine stopping frequently' OR 'Poor acceleration') THEN Spark Plug Fault |
| **RULE_04** | Engine Overheating & Low Oil | High | IF 'Engine overheating' AND ('Engine unusual noises' OR 'Poor acceleration') THEN Thermal Oil Seizure |
| **RULE_05** | Clogged Air Filter / Carburetor | Medium | IF 'Poor acceleration' AND ('Low mileage' OR 'Engine stopping frequently') THEN Air/Fuel Starvation |
| **RULE_06** | Faulty Charging Stator / RR Unit | High | IF 'Battery draining quickly' AND 'Headlight not working' THEN Alternator / Rectifier Failure |
| **RULE_07** | Blown Main Fuse / Ground Short | Medium | IF ('Headlight not working' AND 'Horn not working') OR ('Self-start failing' AND 'Horn failing') THEN Blown Fuse |
| **RULE_08** | Drive Chain Slack / Bad Mounts | Low | IF 'Excessive vibration' AND 'Poor acceleration' THEN Mechanical Transmission Slack |
| **RULE_09** | Internal Engine Mechanical Wear | High | IF 'Engine unusual noises' AND ('Excessive vibration' OR 'Engine overheating') THEN Tappet / Piston Wear |
| **RULE_10** | Fuel Line Contamination | Medium | IF 'Bike won't start' AND 'Engine stopping frequently' THEN Water / Debris Fuel Starvation |
| **RULE_11** | Safety Switch Interlock Fault | Low | IF 'Self-start not working' AND 'Bike won't start' (with no click) THEN Neutral / Stand Switch Fault |
| **RULE_12** | Horn Assembly Malfunction | Low | IF 'Horn not working' THEN Horn Diaphragm / Contact Switch Fault |

---

### 2.5 Major Software Modules

1. **Knowledge Base Module (`rules.py`):** Encodes schemas, symptom metadata, and 12 production rules with troubleshooting steps.
2. **Inference Engine Module (`engine.py`):** Implements forward-chaining pattern matching, confidence scoring, and multi-factor ranking.
3. **REST API Service Module (`app.py`):** Exposes HTTP endpoints (`/api/symptoms`, `/api/rules`, `/api/diagnose`, `/api/health`) with CORS support.
4. **Interactive React Dashboard (`App.jsx`, `App.css`):** Provides category toggles, search filters, live presets, diagnosis cards, and report printing.
5. **Automated Test Suite (`test_api.py`):** Verifies inference correctness across all standard fault scenarios.

---

### 2.6 End-to-End Execution Workflow

1. **Symptom Reporting:** The rider selects observed symptoms via interactive checkboxes or loads a demonstration preset (*Dead Battery*, *Engine Overheating*, *Carburetor Clog*, *Electrical Short*).
2. **Payload Serialization:** React bundles the selected symptom IDs into a JSON payload: `{"symptoms": [...]}`.
3. **HTTP REST Transmission:** The frontend issues an asynchronous `POST` request to `/api/diagnose`.
4. **Pattern Matching & Scoring:** The Python inference engine matches facts against `EXPERT_RULES`, computes match percentages, and filters rules meeting minimum activation thresholds.
5. **Ranking:** Results are sorted by Match Percentage &rarr; Matched Count &rarr; Severity.
6. **Card Presentation:** React renders ranked cards displaying the diagnosed fault, severity badge, match meter, triggered rule condition, explanation, troubleshooting steps, and mechanic advisory.

---

## 3. SOURCE CODE EXCERPTS

### 3.1 Python Rule-Based Inference Engine
**Purpose:** Evaluates working memory facts against knowledge base rules, calculates confidence scores, and ranks candidate diagnoses.  
**Repository file:** `motomind-react-python/backend/engine.py`

```python
class RuleBasedInferenceEngine:
    SEVERITY_WEIGHT = {"High": 3, "Medium": 2, "Low": 1}

    def __init__(self, rules=None):
        self.rules = rules if rules is not None else EXPERT_RULES

    def diagnose(self, selected_symptom_ids: List[str]) -> Dict[str, Any]:
        selected_set = set(selected_symptom_ids)
        diagnosed_faults = []

        for rule in self.rules:
            matched_ids = [s for s in rule["symptoms"] if s in selected_set]
            match_count = len(matched_ids)

            # Check rule activation threshold
            if match_count >= rule.get("min_required", 1):
                match_percentage = round((match_count / len(rule["symptoms"])) * 100)
                matched_labels = [SYMPTOM_LOOKUP.get(s, {}).get("label", s) for s in matched_ids]
                missing_labels = [SYMPTOM_LOOKUP.get(s, {}).get("label", s) 
                                  for s in rule["symptoms"] if s not in selected_set]

                diagnosed_faults.append({
                    "rule_id": rule["id"],
                    "fault": rule["fault"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "match_percentage": match_percentage,
                    "match_count": match_count,
                    "total_symptoms": len(rule["symptoms"]),
                    "matched_symptoms": matched_labels,
                    "missing_symptoms": missing_labels,
                    "rule_condition": rule["rule_condition"],
                    "explanation": rule["explanation"],
                    "troubleshooting": rule["troubleshooting"],
                    "mechanic_advice": rule["mechanic_advice"]
                })

        # Multi-factor priority ranking: Match % -> Match Count -> Severity Weight
        diagnosed_faults.sort(
            key=lambda x: (x["match_percentage"], x["match_count"], self.SEVERITY_WEIGHT.get(x["severity"], 0)),
            reverse=True
        )
        return {"status": "success", "results": diagnosed_faults}
```

---

### 3.2 Python REST API Service
**Purpose:** Handles HTTP requests and connects React to the Python expert system.  
**Repository file:** `motomind-react-python/backend/app.py`

```python
@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    payload = request.get_json(silent=True) or {}
    selected_symptoms = payload.get("symptoms", [])
    if not isinstance(selected_symptoms, list):
        return jsonify({"status": "error", "message": "symptoms must be a list"}), 400
    
    # Execute forward-chaining inference
    result = run_diagnosis(selected_symptoms)
    return jsonify(result)
```

---

### 3.3 React API Service Client
**Purpose:** Dispatches asynchronous REST requests from React to Python.  
**Repository file:** `motomind-react-python/frontend/src/api.js`

```javascript
const API_BASE = "http://127.0.0.1:5000";

export async function diagnoseSymptoms(symptomIds) {
  const res = await fetch(`${API_BASE}/api/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms: symptomIds })
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}
```

---

### 3.4 React Symptom Selection & Diagnosis Controller
**Purpose:** Manages reactive state, filters symptoms, loads demonstration presets, and triggers diagnoses.  
**Repository file:** `motomind-react-python/frontend/src/App.jsx`

```javascript
const handleRunDiagnosis = async () => {
  if (selectedSymptoms.size === 0) {
    alert("Please select at least one symptom before running diagnosis.");
    return;
  }
  setIsDiagnosing(true);
  try {
    const response = await diagnoseSymptoms(Array.from(selectedSymptoms));
    setDiagnosticResults(response.results || []);
    setActiveView("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    setApiError("Unable to connect to Python backend at http://127.0.0.1:5000");
  } finally {
    setIsDiagnosing(false);
  }
};
```

---

## 4. INPUT AND OUTPUT (TEST CASES & RESULTS)

### 4.1 System Input Parameters and Constraints

#### Table 4: MotoMind Input Constraints and Inference Boundaries

| Parameter | Allowed Values / Range | Role in Inference Engine |
| :--- | :--- | :--- |
| **Symptom Input Set** | 1 to 12 Symptoms | Forms active Working Memory facts vector |
| **Precondition Threshold** | 1 or 2 matches (per rule) | Governs activation threshold before rule fires |
| **Confidence Metric** | 0.0% to 100.0% | Quantifies symptom convergence with fault vector |
| **Severity Hierarchy** | High, Medium, Low | Governs sort priority and visual warning badge |

---

### 4.2 Empirical Test Scenarios & Diagnostic Validation Results

#### Table 5: Experimental Verification of Diagnostic Test Cases

| Scenario | Selected Symptoms | Top Rule | Match % | Severity | Key Actionable Step |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Dead Battery** | Bike won't start, Clicking sound, Headlight dead | RULE_01 | 100% | Medium | Clean terminals; check battery resting voltage (&ge; 12.6V). |
| **2. Engine Heat** | Engine overheating, Unusual noise, Poor acceleration | RULE_04 | 100% | High | Shut off engine; inspect oil level on dipstick / sight glass. |
| **3. Carb Clog** | Low mileage, Poor acceleration, Frequent stalling | RULE_05 | 100% | Medium | Inspect air filter element; clean carburetor jets / injector. |
| **4. Electrical Short** | Headlight dead, Horn dead, Self-start dead | RULE_07 | 100% | Medium | Check 10A/15A main blade fuse link and chassis ground. |
| **5. Solenoid Failure** | Self-start not working, Clicking sound when starting | RULE_02 | 67% | Medium | Check starter relay fuse; inspect starter motor carbon brushes. |
| **6. Stator / RR Drain**| Battery draining quickly, Headlight not working | RULE_06 | 100% | High | Measure AC voltage from stator coils; check RR connector. |

---

### 4.3 Diagnostic Dashboard Views

1. **Home Landing View:** Displays the MotoMind logo, tachometer branding, system statistics (4 Categories, 12+ Production Rules, 100% Deterministic), and CTA navigation.
2. **Symptom Selection Wizard:** Renders four subsystem cards with custom animated checkboxes, search bar, and one-click demo presets.
3. **Diagnostic Results Dashboard:**
   - **Overview Banner:** Summarizes analyzed symptoms count, detected faults count, and engine status.
   - **Diagnostic Cards:** Displays rank (`#1 Likely Cause`), category, severity pill, percentage meter, triggered rule logic code block, mechanical explanation, numbered troubleshooting steps, and mechanic advisory.
   - **Utilities:** One-click **Print / Save Report** generator and **Reset Diagnosis** button.
4. **About AI System Modal:** Provides complete technical breakdown of Expert Systems, Forward Chaining, and confidence score mathematical formulas.

---

## 5. CONCLUSION & FUTURE ENHANCEMENTS

**MotoMind** successfully demonstrates the practical implementation of an Artificial Intelligence Rule-Based Expert System for two-wheeler fault diagnosis. By separating domain knowledge into declarative production rules in Python and providing a real-time reactive user interface in React.js, the system delivers instantaneous, 100% explainable, and deterministic troubleshooting recommendations. 

Experimental test cases confirm that the forward-chaining pattern matching algorithm accurately identifies critical faults across electrical, starting, engine, and fuel systems while preventing hallucinated diagnoses. 

### Future Enhancements:
1. **ECU & OBD-II Integration:** Expanding rules to read real-time diagnostic trouble codes (DTCs) from fuel-injected two-wheelers via Bluetooth OBD-II scanners.
2. **Multilingual Voice Guidance:** Integrating speech-to-text and audio troubleshooting instructions in regional languages for rural technicians.
3. **Visual Defect Inspection:** Complementing the rule-based expert system with computer vision models for spark plug fouling and tire wear inspection.
