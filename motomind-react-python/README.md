# MotoMind – Two-Wheeler Fault Diagnosis Expert System (React + Python)

MotoMind is a full-stack, rule-based **Artificial Intelligence Expert System** designed to identify and troubleshoot mechanical, electrical, fuel, and engine issues in motorcycles and scooters.

This version features a **React.js** frontend and a **Python** backend running a forward-chaining inference engine.

---

## 🏛️ System Architecture

```text
+-------------------------------------------------------------+
|                      REACT.JS FRONTEND                      |
|  - Symptom Selection Wizard (4 Categories, 12 Symptoms)     |
|  - Live Search Filter & Demo Presets                        |
|  - Real-Time Diagnostic Dashboard & Print-Ready Report      |
+------------------------------+------------------------------+
                               |
                   HTTP POST /api/diagnose
                   Payload: {"symptoms": [...]}
                               |
                               v
+-------------------------------------------------------------+
|                     PYTHON REST API SERVER                  |
|                   (Flask / Built-in Server)                 |
|  - app.py: Routes (/api/symptoms, /api/rules, /api/diagnose)|
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 RULE-BASED INFERENCE ENGINE                 |
|                        (engine.py)                          |
|  - Forward-Chaining Pattern Matching                        |
|  - Condition Threshold Verification                         |
|  - Deterministic Confidence / Match % Calculation           |
|  - Priority Ranking (Confidence -> Count -> Severity)       |
+------------------------------+------------------------------+
                               ^
                               |
+------------------------------+------------------------------+
|                    PYTHON KNOWLEDGE BASE                    |
|                         (rules.py)                          |
|  - 12 Production Rules (IF <conditions> THEN <fault>)       |
|  - Explanations, Severity Ratings & Troubleshooting Steps   |
+-------------------------------------------------------------+
```

---

## 🚀 How to Run the Project Locally

### Step 1: Start the Python Backend

1. Open a terminal or PowerShell prompt.
2. Navigate to the backend directory:
   ```bash
   cd motomind-react-python/backend
   ```
3. (Optional) Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Python server:
   ```bash
   python app.py
   ```
   *The Python API will start at **`http://127.0.0.1:5000`**.*

---

### Step 2: Start the React Frontend

You have two easy options to run the React interface:

#### Option A: Using Vite & NPM (Standard Development Mode)
1. Open a second terminal window.
2. Navigate to the frontend directory:
   ```bash
   cd motomind-react-python/frontend
   ```
3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```
4. Open the displayed URL (usually `http://localhost:3000` or `http://localhost:5173`) in your browser.

#### Option B: Standalone Zero-Install Browser View (Quick College Demo)
If you are presenting on a lab computer without Node.js or active internet packages:
1. Ensure the Python backend is running (`python app.py`).
2. Simply double-click or open **`motomind-react-python/frontend/standalone.html`** in Chrome, Edge, or Firefox.
3. The React app connects directly to `http://127.0.0.1:5000`!

---

## 🧠 AI Rule-Based Logic & Inference

### Forward Chaining
Unlike statistical machine learning models or black-box neural networks, an **Expert System** provides transparent, audit-ready deductions. MotoMind uses **forward chaining**:
1. It begins with **known facts** (the symptoms reported by the rider).
2. It tests these facts against production rules stored in `rules.py`.
3. When rule prerequisites are met, the rule **fires**, deducing a specific fault.

### Confidence Score / Match Percentage Formula
$$\text{Match Percentage} = \left( \frac{\text{Number of Matched Symptoms in Rule}}{\text{Total Symptoms in Rule}} \right) \times 100\%$$

Diagnoses are prioritized in the following order:
1. **Highest Match Percentage**
2. **Total Symptoms Matched**
3. **Severity Weight** ($\text{High} > \text{Medium} > \text{Low}$)

---

## 📋 Master Symptom Catalog

| Category | Symptoms |
| :--- | :--- |
| **Starting Problems** | • Bike won't start<br>• Self-start not working<br>• Clicking sound when starting |
| **Engine Problems** | • Engine overheating<br>• Engine making unusual noises<br>• Engine stopping frequently |
| **Performance Problems** | • Low mileage<br>• Poor acceleration<br>• Excessive vibration |
| **Electrical Problems** | • Headlight not working<br>• Battery draining quickly<br>• Horn not working |

---

## 📁 Project Directory Structure

```text
motomind-react-python/
├── backend/
│   ├── app.py              # Python REST API server (Flask / Built-in server)
│   ├── rules.py            # Knowledge Base (4 categories, 12 symptoms, 12 rules)
│   ├── engine.py           # Forward-chaining inference engine & scoring
│   ├── test_api.py         # Automated logic & diagnosis unit tests
│   └── requirements.txt    # Python dependencies (flask, flask-cors)
├── frontend/
│   ├── index.html          # HTML entrypoint
│   ├── standalone.html     # Zero-install single-file React interface
│   ├── package.json        # Frontend dependencies (React, Vite)
│   ├── vite.config.js      # Vite dev server configuration & backend proxy
│   └── src/
│       ├── App.jsx         # Complete MotoMind React UI component
│       ├── App.css         # Automotive dark dashboard styling & print styles
│       ├── api.js          # REST client communicating with Python backend
│       └── main.jsx        # React DOM entrypoint
└── README.md               # Complete documentation & viva reference
```

---

## 🔒 Original Project Safety Notice
This project is isolated inside `motomind-react-python/`. The original website files (`index.html`, `style.css`, `rules.js`, `app.js`, `README.md`) in the root directory remain completely untouched.
