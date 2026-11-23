# MotoMind – Two-Wheeler Fault Diagnosis Expert System

MotoMind is a lightweight, modern, web-based Artificial Intelligence expert system designed to diagnose common mechanical, electrical, fuel, and engine issues in motorcycles and scooters.

Built with **pure HTML5, CSS3, and JavaScript**, MotoMind demonstrates how a **Rule-Based Expert System** uses forward chaining and symptom-to-rule pattern matching to deduce likely faults, rank them by match confidence, explain the reasoning behind every diagnosis, and provide actionable troubleshooting steps.

---

## 🚀 Live Demo & How to Run

Because MotoMind is completely self-contained with zero external dependencies, you can run it immediately without installing any server, Node package, or database:

1. Clone or download this project folder.
2. Double-click or open [`index.html`](file:///c:/Users/mohit/OneDrive/Desktop/ai-project/index.html) in any web browser (Chrome, Edge, Firefox, Safari).
3. Click **"Start Diagnosis"** or select one of the **Live Demo Presets** to see the inference engine in action.

---

## 🧠 AI Architecture: Rule-Based Expert System

An **Expert System** is a branch of Artificial Intelligence that models the knowledge and reasoning process of human domain specialists (in this case, motorcycle mechanics).

```
   +--------------------------------------------------------+
   |                     USER INTERFACE                     |
   |   (Symptom Selection, Presets, Diagnostic Dashboard)   |
   +---------------------------+----------------------------+
                               |
                               v
   +--------------------------------------------------------+
   |                    WORKING MEMORY                      |
   |      (Current session symptoms reported by user)       |
   +---------------------------+----------------------------+
                               |
                               v
   +--------------------------------------------------------+
   |                   INFERENCE ENGINE                     |
   |  - Forward Chaining pattern matching                   |
   |  - Condition threshold verification                    |
   |  - Deterministic Confidence / Match % calculation      |
   |  - Priority ranking (Match % -> Count -> Severity)     |
   +---------------------------+----------------------------+
                               ^
                               |
   +---------------------------+----------------------------+
   |                     KNOWLEDGE BASE                     |
   |   12+ Production Rules (IF <symptoms> THEN <fault>)    |
   |   Severity levels, Explanations & Troubleshooting     |
   +--------------------------------------------------------+
```

### 1. Knowledge Base (`rules.js`)
Stores production rules structured as:
$$\text{IF } (\text{Symptom}_1 \text{ AND } \text{Symptom}_2 \dots) \implies \text{Fault } + \text{Explanation } + \text{Troubleshooting}$$

### 2. Working Memory
Holds the dynamic set of symptoms selected by the user during the diagnostic session.

### 3. Inference Engine (`app.js`)
Uses **Forward Chaining** (data-driven reasoning):
1. **Rule Evaluation:** Iterates through every rule in the knowledge base and checks which conditions are satisfied by working memory.
2. **Confidence / Match Percentage Calculation:**
   $$\text{Match Percentage} = \left( \frac{\text{Number of Matched Rule Symptoms}}{\text{Total Symptoms in Rule}} \right) \times 100\%$$
3. **Transparent Reasoning:** Identifies which specific rule triggered each diagnosis and presents the underlying mechanical explanation.
4. **Ranking & Prioritization:**
   - Primary Sort: Highest match percentage
   - Secondary Sort: Total symptoms matched
   - Tertiary Sort: Severity level (High > Medium > Low)

---

## 📋 Symptom Categories & Master List

The system supports 12 symptoms distributed across 4 key vehicle subsystems:

| Category | Symptoms |
| :--- | :--- |
| **Starting Problems** | • Bike won't start<br>• Self-start not working<br>• Clicking sound when starting |
| **Engine Problems** | • Engine overheating<br>• Engine making unusual noises<br>• Engine stopping frequently |
| **Performance Problems** | • Low mileage<br>• Poor acceleration<br>• Excessive vibration |
| **Electrical Problems** | • Headlight not working<br>• Battery draining quickly<br>• Horn not working |

---

## ⚙️ Core Knowledge Base Rules

Here are key examples of IF-THEN rules encoded into MotoMind:

- **RULE 01 (Dead/Discharged Battery):**  
  `IF ('Bike won't start' OR 'Clicking sound when starting') AND ('Headlight not working' OR 'Battery draining') THEN Discharged or Dead Battery`
- **RULE 02 (Starter Relay / Solenoid Failure):**  
  `IF 'Self-start not working' AND 'Clicking sound when starting' THEN Defective Starter Relay or Motor`
- **RULE 03 (Fouled Spark Plug / Ignition Fault):**  
  `IF 'Bike won't start' AND ('Engine stopping frequently' OR 'Poor acceleration') THEN Fouled Spark Plug or Ignition System Fault`
- **RULE 04 (Engine Overheating & Low Oil):**  
  `IF 'Engine overheating' AND ('Engine unusual noises' OR 'Poor acceleration') THEN Engine Overheating & Insufficient Lubrication`
- **RULE 05 (Clogged Carburetor / Air Filter):**  
  `IF 'Poor acceleration' AND ('Low mileage' OR 'Engine stopping frequently') THEN Clogged Air Filter or Carburetor / Injector Clog`
- **RULE 06 (Faulty Charging System / RR Unit):**  
  `IF 'Battery draining quickly' AND 'Headlight not working' THEN Faulty Charging System (Stator / RR Unit)`
- **RULE 07 (Blown Main Fuse / Ground Short):**  
  `IF ('Headlight not working' AND 'Horn not working') OR ('Self-start not working' AND 'Horn not working') THEN Blown Main Fuse or Ground Short`
- **RULE 08 (Drive Chain Slack / Motor Mounts):**  
  `IF 'Excessive vibration' AND 'Poor acceleration' THEN Loose Drive Chain, Worn Sprocket, or Bad Engine Mounts`
- **RULE 09 (Engine Mechanical Wear / Tappets):**  
  `IF 'Engine unusual noises' AND ('Excessive vibration' OR 'Engine overheating') THEN Internal Engine Mechanical Wear`
- **RULE 10 (Fuel Line Contamination):**  
  `IF 'Bike won't start' AND 'Engine stopping frequently' THEN Fuel Line Contamination or Clogged Fuel Filter`

---

## 🎨 UI & Design Highlights

- **Automotive Dashboard Theme:** Dark charcoal background (`#0a0d14`, `#151b29`) with motorcycle orange (`#ff6b00`) and amber (`#f59e0b`) accents.
- **Interactive Live Counters:** Shows real-time count of selected symptoms and dynamic button enablement.
- **Live Search Filter:** Quickly search symptoms by typing keywords (e.g. `noise`, `battery`, `starting`).
- **One-Click Demo Presets:** Pre-loads classic scenarios (*Dead Battery*, *Engine Overheating*, *Carburetor Clog*, *Electrical Short*) for instant demonstration.
- **Diagnostic Result Cards:**
  - Diagnosed fault title with component subsystem badge.
  - Severity level indicator: **High** (Crimson), **Medium** (Amber), **Low** (Green).
  - Match percentage progress meter.
  - Transparent rule trigger code banner.
  - Detailed mechanical explanation.
  - Numbered step-by-step troubleshooting checklist.
  - Professional mechanic caution advisory.
- **Print / Save Report:** Generates a clean, printer-friendly diagnostic report.
- **About Project Modal:** Interactive technical breakdown designed for viva questions and project evaluation.

---

## 📁 File Structure

```text
ai-project/
├── index.html        # Clean, semantic HTML5 structure and dialogs
├── style.css         # Modern automotive dark theme and responsive layout
├── rules.js          # Knowledge base (symptom catalog & IF-THEN rules)
├── app.js            # UI controller, inference engine & result renderer
└── README.md         # Comprehensive project documentation
```

---

## 🎓 College Viva / Project Presentation Q&A

**Q: Why use a Rule-Based Expert System instead of Deep Learning / Neural Networks?**  
**A:** Diagnostics require **100% explainability, auditability, and safety**. Neural networks are black boxes where it is difficult to explain why a conclusion was drawn. An expert system provides clear IF-THEN proof for each diagnosis, which is crucial for mechanical troubleshooting and safety.

**Q: What is Forward Chaining?**  
**A:** Forward chaining starts with known facts (the symptoms selected by the user) and asserts rules forward to deduce conclusions (the diagnosed faults).

**Q: Can new rules be added?**  
**A:** Yes. Because knowledge is separated from code logic in [`rules.js`](file:///c:/Users/mohit/OneDrive/Desktop/ai-project/rules.js), adding new faults only requires defining a new rule object with its symptoms and troubleshooting steps without modifying the inference engine.
