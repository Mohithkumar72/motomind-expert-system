/**
 * MotoMind – Application Logic & Rule-Based Inference Engine
 * =============================================================
 * Architecture:
 *  1. Working Memory  – state.selectedSymptoms (Set of symptom IDs)
 *  2. Inference Engine – runInference() uses forward chaining:
 *       for each rule → count matching symptoms → score → rank
 *  3. Consultation Mode – follow-up questions narrow diagnosis
 *  4. UI Controller  – section switching, rendering, events
 * =============================================================
 */

(function () {
  "use strict";

  /* ══════════════════════════════════════════════════════════
     APPLICATION STATE  (Working Memory)
     ══════════════════════════════════════════════════════════ */
  const state = {
    selectedSymptoms: new Set(),   // symptom IDs user has checked
    activeSection: "home",         // "home" | "diagnosis" | "consultation" | "results"
    lastResults: [],               // last inference output
    consultationQueue: [],         // questions pending in consultation
    consultationIndex: 0,          // current question index
    consultationAnswers: {}        // questionId -> true/false
  };

  /* ══════════════════════════════════════════════════════════
     DOM ELEMENT REFERENCES
     ══════════════════════════════════════════════════════════ */
  const el = {
    // Sections
    sectionHome:         document.getElementById("section-home"),
    sectionDiagnosis:    document.getElementById("section-diagnosis"),
    sectionConsult:      document.getElementById("section-consultation"),
    sectionResults:      document.getElementById("section-results"),

    // Nav buttons
    btnNavHome:          document.getElementById("btn-nav-home"),
    btnNavDiagnose:      document.getElementById("btn-nav-diagnose"),
    btnNavResults:       document.getElementById("btn-nav-results"),
    btnNavAbout:         document.getElementById("btn-nav-about"),

    // Home
    btnStartDiagnosis:   document.getElementById("btn-start-diagnosis"),
    btnHomeAbout:        document.getElementById("btn-home-about"),

    // Symptom selection
    symptomContainer:    document.getElementById("symptom-categories-container"),
    symptomSearch:       document.getElementById("symptom-search"),
    selectedCountBadge:  document.getElementById("selected-count-badge"),
    btnRunDiagnosis:     document.getElementById("btn-run-diagnosis"),
    btnClearSymptoms:    document.getElementById("btn-clear-symptoms"),
    btnSelectAll:        document.getElementById("btn-select-all"),
    btnBackHome:         document.getElementById("btn-back-home"),
    presetButtons:       document.querySelectorAll(".btn-preset"),

    // Consultation
    consultProgress:     document.getElementById("consult-progress"),
    consultProgressBar:  document.getElementById("consult-progress-bar"),
    consultQuestion:     document.getElementById("consult-question"),
    consultHint:         document.getElementById("consult-hint"),
    btnConsultYes:       document.getElementById("btn-consult-yes"),
    btnConsultNo:        document.getElementById("btn-consult-no"),
    btnSkipConsult:      document.getElementById("btn-skip-consult"),
    consultQNum:         document.getElementById("consult-q-num"),
    consultQTotal:       document.getElementById("consult-q-total"),

    // Results
    btnBackToSymptoms:   document.getElementById("btn-back-to-symptoms"),
    btnResetDiagnosis:   document.getElementById("btn-reset-diagnosis"),
    btnPrintReport:      document.getElementById("btn-print-report"),
    resultsSummaryCount: document.getElementById("results-summary-count"),
    resultsSumptoms:     document.getElementById("results-summary-symptoms"),
    resultsContainer:    document.getElementById("results-container"),
    noResultsMessage:    document.getElementById("no-results-message"),

    // Modal
    aboutModal:          document.getElementById("about-modal"),
    modalCloseBtn:       document.getElementById("modal-close-btn"),
    modalBackdrop:       document.getElementById("modal-backdrop")
  };

  /* ══════════════════════════════════════════════════════════
     SYMPTOM LOOKUP MAP  (id → symptom object)
     ══════════════════════════════════════════════════════════ */
  const symptomLookup = new Map();
  SYMPTOM_CATEGORIES.forEach(cat => {
    cat.symptoms.forEach(sym => {
      symptomLookup.set(sym.id, { ...sym, categoryName: cat.name });
    });
  });

  /* ══════════════════════════════════════════════════════════
     SECTION 1: INFERENCE ENGINE
     Forward-Chaining Pattern Matching
     ══════════════════════════════════════════════════════════ */

  /**
   * runInference(symptomSet)
   * Evaluates every expert rule against the working memory.
   *
   * Scoring formula:
   *   matchCount  = number of rule symptoms present in symptomSet
   *   matchPct    = (matchCount / rule.symptoms.length) × 100
   *   primaryHit  = how many PRIMARY symptoms matched (bonus weight)
   *   score       = matchPct + (primaryHitRatio × 15)   [bonus up to +15]
   *
   * A rule fires when matchCount >= rule.minRequired.
   * Results are sorted: score DESC → matchCount DESC → severity (H>M>L).
   *
   * @param {Set<string>} symptomSet
   * @returns {Array<Object>} ranked diagnosed faults
   */
  function runInference(symptomSet) {
    if (!symptomSet || symptomSet.size === 0) return [];

    const severityWeight = { High: 3, Medium: 2, Low: 1 };
    const results = [];

    EXPERT_RULES.forEach(rule => {
      const matched   = rule.symptoms.filter(id => symptomSet.has(id));
      const matchCount = matched.length;

      if (matchCount < rule.minRequired) return; // rule does not fire

      const totalSymptoms  = rule.symptoms.length;
      const matchPct       = Math.round((matchCount / totalSymptoms) * 100);

      // Bonus for primary symptom hits
      const primaryMatched = rule.primarySymptoms
        ? rule.primarySymptoms.filter(id => symptomSet.has(id)).length
        : 0;
      const primaryTotal   = rule.primarySymptoms ? rule.primarySymptoms.length : 1;
      const primaryBonus   = Math.round((primaryMatched / primaryTotal) * 15);

      const score = Math.min(matchPct + primaryBonus, 99); // cap at 99 (100% reserved for perfect)

      // Build missing symptom list (symptoms in rule NOT selected — helpful for user)
      const missing = rule.symptoms
        .filter(id => !symptomSet.has(id))
        .map(id => symptomLookup.get(id)?.label || id);

      results.push({
        ruleId:            rule.id,
        fault:             rule.fault,
        category:          rule.category,
        severity:          rule.severity,
        matchPercentage:   matchPct,
        score:             score,
        matchCount:        matchCount,
        totalSymptoms:     totalSymptoms,
        matchedSymptoms:   matched.map(id => symptomLookup.get(id)?.label || id),
        missingSymptoms:   missing,
        ruleConditionText: rule.ruleConditionText,
        causes:            rule.causes || [],
        explanation:       rule.explanation,
        troubleshooting:   rule.troubleshooting,
        mechanicAdvice:    rule.mechanicAdvice
      });
    });

    // Sort: highest score → highest matchCount → highest severity
    results.sort((a, b) => {
      if (b.score !== a.score)           return b.score - a.score;
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return severityWeight[b.severity] - severityWeight[a.severity];
    });

    return results;
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 2: CONSULTATION ENGINE
     Asks follow-up questions to narrow down competing faults
     ══════════════════════════════════════════════════════════ */

  /**
   * Build a list of relevant follow-up questions based on
   * which symptoms the user has selected.
   */
  function buildConsultationQueue() {
    const queue = [];
    CONSULTATION_QUESTIONS.forEach(q => {
      // Only ask if at least one of q.triggeredBy symptoms is selected
      const relevant = q.triggeredBy.some(id => state.selectedSymptoms.has(id));
      if (relevant) queue.push(q);
    });
    return queue;
  }

  /** Start consultation flow */
  function startConsultation() {
    state.consultationQueue  = buildConsultationQueue();
    state.consultationIndex  = 0;
    state.consultationAnswers = {};

    if (state.consultationQueue.length === 0) {
      // No follow-up questions needed — go straight to results
      finaliseAndShowResults();
      return;
    }

    showSection("consultation");
    renderConsultQuestion();
  }

  /** Display current consultation question */
  function renderConsultQuestion() {
    const queue = state.consultationQueue;
    const idx   = state.consultationIndex;
    const q     = queue[idx];

    if (el.consultQNum)   el.consultQNum.textContent   = idx + 1;
    if (el.consultQTotal) el.consultQTotal.textContent  = queue.length;

    // Progress bar
    const pct = Math.round(((idx) / queue.length) * 100);
    if (el.consultProgress)   el.consultProgress.textContent = `Question ${idx + 1} of ${queue.length}`;
    if (el.consultProgressBar) el.consultProgressBar.style.width = pct + "%";

    if (el.consultQuestion) el.consultQuestion.textContent = q.question;
    if (el.consultHint)     el.consultHint.textContent     = q.hint || "";
  }

  /** Handle Yes answer */
  function handleConsultYes() {
    const q = state.consultationQueue[state.consultationIndex];
    state.consultationAnswers[q.id] = true;

    // Add symptoms flagged for Yes answer
    if (q.yesAdds) q.yesAdds.forEach(id => state.selectedSymptoms.add(id));

    advanceConsultation();
  }

  /** Handle No answer */
  function handleConsultNo() {
    const q = state.consultationQueue[state.consultationIndex];
    state.consultationAnswers[q.id] = false;

    // Remove symptoms that No contradicts
    if (q.noRemoves) q.noRemoves.forEach(id => state.selectedSymptoms.delete(id));
    // Add symptoms implied by No
    if (q.noAdds) q.noAdds.forEach(id => state.selectedSymptoms.add(id));

    advanceConsultation();
  }

  /** Move to next question or finish */
  function advanceConsultation() {
    state.consultationIndex++;
    if (state.consultationIndex < state.consultationQueue.length) {
      renderConsultQuestion();
    } else {
      finaliseAndShowResults();
    }
  }

  /** Run inference with updated symptoms and display results */
  function finaliseAndShowResults() {
    state.lastResults = runInference(state.selectedSymptoms);
    renderResults(state.lastResults);
    if (el.btnNavResults) el.btnNavResults.style.display = "inline-flex";
    showSection("results");
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 3: SYMPTOM SELECTION UI
     ══════════════════════════════════════════════════════════ */

  /** Render category cards with symptom checkboxes */
  function renderSymptomCategories(filterQuery = "") {
    if (!el.symptomContainer) return;
    el.symptomContainer.innerHTML = "";
    const query = filterQuery.trim().toLowerCase();
    let totalVisible = 0;

    SYMPTOM_CATEGORIES.forEach(category => {
      const visible = category.symptoms.filter(s =>
        !query ||
        s.label.toLowerCase().includes(query) ||
        s.desc.toLowerCase().includes(query)
      );

      if (visible.length === 0) return;
      totalVisible += visible.length;

      const card = document.createElement("div");
      card.className = "category-group-card";

      card.innerHTML = `
        <div class="category-header">
          <div class="category-icon-wrapper">${category.icon}</div>
          <div class="category-info">
            <h3 class="category-title">${category.name}</h3>
            <span class="category-meta">${visible.length} symptom${visible.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div class="symptoms-grid" id="sgrid-${category.id}"></div>
      `;

      el.symptomContainer.appendChild(card);
      const grid = card.querySelector(`#sgrid-${category.id}`);

      visible.forEach(symptom => {
        const isChecked = state.selectedSymptoms.has(symptom.id);
        const lbl = document.createElement("label");
        lbl.className = `symptom-checkbox-label${isChecked ? " active" : ""}`;
        lbl.setAttribute("for", `chk-${symptom.id}`);
        lbl.innerHTML = `
          <div class="checkbox-custom-wrapper">
            <input
              type="checkbox"
              id="chk-${symptom.id}"
              data-symptom-id="${symptom.id}"
              class="symptom-checkbox"
              ${isChecked ? "checked" : ""}
            />
            <span class="custom-checkbox-indicator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </div>
          <div class="symptom-text-block">
            <div class="symptom-name">${escapeHtml(symptom.label)}</div>
            <div class="symptom-desc">${escapeHtml(symptom.desc)}</div>
          </div>
        `;
        grid.appendChild(lbl);
      });
    });

    if (totalVisible === 0 && query) {
      el.symptomContainer.innerHTML = `
        <div class="empty-filter-state">
          <p>No symptoms match "<strong>${escapeHtml(filterQuery)}</strong>".</p>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-search">Clear Search</button>
        </div>
      `;
      document.getElementById("btn-clear-search")?.addEventListener("click", () => {
        if (el.symptomSearch) el.symptomSearch.value = "";
        renderSymptomCategories("");
      });
    }
  }

  /** Update selected count badge and button state */
  function updateCountUI() {
    const count = state.selectedSymptoms.size;
    if (el.selectedCountBadge) {
      el.selectedCountBadge.textContent = `${count} Selected`;
      el.selectedCountBadge.classList.toggle("has-selection", count > 0);
    }
    if (el.btnRunDiagnosis) {
      el.btnRunDiagnosis.disabled = count === 0;
    }
  }

  /** Toggle a symptom in working memory */
  function toggleSymptom(id, checked) {
    if (checked) {
      state.selectedSymptoms.add(id);
    } else {
      state.selectedSymptoms.delete(id);
    }
    updateCountUI();
  }

  /** Clear everything and reset to fresh state */
  function clearAllSymptoms() {
    state.selectedSymptoms.clear();
    state.lastResults         = [];
    state.consultationQueue   = [];
    state.consultationIndex   = 0;
    state.consultationAnswers = {};

    if (el.symptomSearch) el.symptomSearch.value = "";
    renderSymptomCategories("");
    updateCountUI();

    // Wipe rendered results so old cards never show
    if (el.resultsContainer)    el.resultsContainer.innerHTML = "";
    if (el.resultsSummaryCount) el.resultsSummaryCount.textContent = "0 possible faults detected";
    if (el.resultsSumptoms)     el.resultsSumptoms.textContent     = "0 symptoms selected";
    if (el.noResultsMessage)    el.noResultsMessage.style.display  = "none";
    if (el.btnNavResults)       el.btnNavResults.style.display      = "none";
  }

  /** Select all currently visible symptom checkboxes */
  function selectAllVisible() {
    if (!el.symptomContainer) return;
    el.symptomContainer.querySelectorAll(".symptom-checkbox").forEach(chk => {
      const id = chk.getAttribute("data-symptom-id");
      if (id) {
        state.selectedSymptoms.add(id);
        chk.checked = true;
        chk.closest(".symptom-checkbox-label")?.classList.add("active");
      }
    });
    updateCountUI();
  }

  /** Load a preset symptom scenario (for demos) */
  function loadPreset(key) {
    clearAllSymptoms();
    const presets = {
      battery:    ["bike_wont_start", "clicking_sound_starting", "headlight_not_working"],
      overheating:["engine_overheating", "engine_unusual_noises", "poor_acceleration"],
      fuel_carb:  ["low_mileage", "poor_acceleration", "engine_stopping_frequently"],
      electrical: ["headlight_not_working", "horn_not_working", "battery_draining_quickly"]
    };
    (presets[key] || []).forEach(id => state.selectedSymptoms.add(id));
    renderSymptomCategories("");
    updateCountUI();
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 4: RESULTS RENDERING
     ══════════════════════════════════════════════════════════ */

  function renderResults(results) {
    if (!el.resultsContainer) return;
    el.resultsContainer.innerHTML = "";

    const count = state.selectedSymptoms.size;
    if (el.resultsSumptoms)     el.resultsSumptoms.textContent     = `${count} symptom${count !== 1 ? "s" : ""} selected`;
    if (el.resultsSummaryCount) el.resultsSummaryCount.textContent = `${results.length} possible fault${results.length !== 1 ? "s" : ""} detected`;

    if (results.length === 0) {
      if (el.noResultsMessage) el.noResultsMessage.style.display = "block";
      el.resultsContainer.style.display = "none";
      return;
    }

    if (el.noResultsMessage) el.noResultsMessage.style.display = "none";
    el.resultsContainer.style.display = "grid";

    results.forEach((item, index) => {
      const sevClass = {
        High:   "badge-severity-high",
        Medium: "badge-severity-medium",
        Low:    "badge-severity-low"
      }[item.severity] || "badge-severity-low";

      const matchClass =
        item.matchPercentage >= 75 ? "match-high" :
        item.matchPercentage >= 50 ? "match-moderate" : "match-low";

      const rankLabel =
        index === 0 ? "#1 Most Likely Fault" :
        index === 1 ? "#2 Possible Fault" :
        `#${index + 1} Possible Fault`;

      /* Causes list */
      const causesList = item.causes && item.causes.length
        ? `<div class="card-causes-block">
            <h4 class="section-subheading">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Possible Causes:
            </h4>
            <ul class="causes-list">
              ${item.causes.map(c => `<li>${escapeHtml(c)}</li>`).join("")}
            </ul>
          </div>`
        : "";

      /* Matched symptom pills */
      const matchedPills = item.matchedSymptoms
        .map(s => `<span class="symptom-tag matched">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg> ${escapeHtml(s)}</span>`)
        .join("");

      /* Missing symptom pills (other related symptoms not reported) */
      const missingSection = item.missingSymptoms.length
        ? `<div class="missing-symptoms-section">
            <span class="sub-label">Other associated symptoms (not reported):</span>
            <div class="symptom-tags-wrapper">
              ${item.missingSymptoms.map(s =>
                `<span class="symptom-tag unconfirmed">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg> ${escapeHtml(s)}
                </span>`).join("")}
            </div>
          </div>`
        : "";

      /* Troubleshooting steps */
      const stepsList = item.troubleshooting
        .map((step, i) => `
          <li class="step-item">
            <span class="step-num">${i + 1}</span>
            <span class="step-text">${escapeHtml(step)}</span>
          </li>`)
        .join("");

      const card = document.createElement("article");
      card.className = `diagnosis-result-card severity-${item.severity.toLowerCase()}`;
      card.innerHTML = `
        <div class="card-top-bar">
          <div class="card-ranking-meta">
            <span class="rank-badge">${rankLabel}</span>
            <span class="system-category-tag">${escapeHtml(item.category)}</span>
          </div>
          <div class="card-top-badges">
            <span class="severity-badge ${sevClass}">
              <span class="severity-dot"></span>
              ${item.severity} Severity
            </span>
            <div class="match-score-badge ${matchClass}">
              <span class="match-percent">${item.matchPercentage}%</span>
              <span class="match-label">Match</span>
            </div>
          </div>
        </div>

        <h3 class="card-fault-title">${escapeHtml(item.fault)}</h3>

        <!-- Match confidence meter -->
        <div class="match-meter-wrapper">
          <div class="match-meter-bar">
            <div class="match-meter-fill ${matchClass}" style="width:${item.matchPercentage}%;"></div>
          </div>
          <span class="match-meter-text">${item.matchCount} of ${item.totalSymptoms} key symptoms matched</span>
        </div>

        <!-- Symptoms Detected -->
        <div class="detected-symptoms-block">
          <span class="sub-label">Symptoms Detected:</span>
          <div class="symptom-tags-wrapper">${matchedPills}</div>
          ${missingSection}
        </div>

        <!-- Rule Trigger Banner -->
        <div class="rule-trigger-banner">
          <div class="rule-tag-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <strong>Triggered Rule (${item.ruleId})</strong>
          </div>
          <code class="rule-code">${escapeHtml(item.ruleConditionText)}</code>
        </div>

        ${causesList}

        <!-- Expert Explanation -->
        <div class="card-explanation-block">
          <h4 class="section-subheading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Why MotoMind Suggested This:
          </h4>
          <p class="explanation-text">${escapeHtml(item.explanation)}</p>
        </div>

        <!-- Troubleshooting Steps -->
        <div class="card-troubleshooting-block">
          <h4 class="section-subheading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            Recommended Troubleshooting Steps:
          </h4>
          <ul class="steps-list">${stepsList}</ul>
        </div>

        <!-- Mechanic Advice -->
        <div class="mechanic-advice-box">
          <div class="advice-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="advice-content">
            <strong>Professional Guidance:</strong> ${escapeHtml(item.mechanicAdvice)}
          </div>
        </div>
      `;

      el.resultsContainer.appendChild(card);
    });
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 5: SECTION SWITCHING
     ══════════════════════════════════════════════════════════ */
  function showSection(id) {
    state.activeSection = id;
    [el.sectionHome, el.sectionDiagnosis, el.sectionConsult, el.sectionResults]
      .forEach(s => s && s.classList.remove("active-section"));

    // Deactivate nav highlights
    [el.btnNavDiagnose, el.btnNavResults].forEach(b => b && b.classList.remove("active"));

    switch (id) {
      case "home":
        el.sectionHome?.classList.add("active-section");
        break;
      case "diagnosis":
        el.sectionDiagnosis?.classList.add("active-section");
        el.btnNavDiagnose?.classList.add("active");
        renderSymptomCategories(el.symptomSearch?.value || "");
        break;
      case "consultation":
        el.sectionConsult?.classList.add("active-section");
        break;
      case "results":
        el.sectionResults?.classList.add("active-section");
        el.btnNavResults?.classList.add("active");
        break;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 6: EVENT LISTENERS
     ══════════════════════════════════════════════════════════ */
  function attachEvents() {
    /* ── Navigation ── */
    el.btnNavHome?.addEventListener("click", e => { e.preventDefault(); showSection("home"); });
    el.btnNavDiagnose?.addEventListener("click", e => { e.preventDefault(); showSection("diagnosis"); });
    el.btnNavResults?.addEventListener("click", e => { e.preventDefault(); showSection("results"); });
    el.btnNavAbout?.addEventListener("click", e => { e.preventDefault(); openModal(); });
    el.btnStartDiagnosis?.addEventListener("click", () => showSection("diagnosis"));
    el.btnHomeAbout?.addEventListener("click", openModal);
    el.btnBackHome?.addEventListener("click", () => showSection("home"));

    /* ── Symptom checkboxes (event delegation) ── */
    el.symptomContainer?.addEventListener("change", e => {
      const chk = e.target;
      if (!chk.classList.contains("symptom-checkbox")) return;
      const id = chk.getAttribute("data-symptom-id");
      toggleSymptom(id, chk.checked);
      chk.closest(".symptom-checkbox-label")?.classList.toggle("active", chk.checked);
    });

    /* ── Symptom search ── */
    el.symptomSearch?.addEventListener("input", e => {
      renderSymptomCategories(e.target.value);
    });

    /* ── Toolbar buttons ── */
    el.btnClearSymptoms?.addEventListener("click", clearAllSymptoms);
    el.btnSelectAll?.addEventListener("click", selectAllVisible);

    /* ── Preset scenario buttons ── */
    el.presetButtons.forEach(btn => {
      btn.addEventListener("click", () => loadPreset(btn.getAttribute("data-preset")));
    });

    /* ── Run Diagnosis → starts consultation flow ── */
    el.btnRunDiagnosis?.addEventListener("click", () => {
      if (state.selectedSymptoms.size === 0) {
        shakeEl(el.btnRunDiagnosis);
        return;
      }
      startConsultation();
    });

    /* ── Consultation buttons ── */
    el.btnConsultYes?.addEventListener("click",  handleConsultYes);
    el.btnConsultNo?.addEventListener("click",   handleConsultNo);
    el.btnSkipConsult?.addEventListener("click", () => {
      // Skip all remaining questions and go straight to results
      finaliseAndShowResults();
    });

    /* ── Results actions ── */
    el.btnBackToSymptoms?.addEventListener("click", () => {
      // Keep selected symptoms; re-enter diagnosis section
      showSection("diagnosis");
    });

    el.btnResetDiagnosis?.addEventListener("click", () => {
      clearAllSymptoms();
      showSection("diagnosis");
    });

    el.btnPrintReport?.addEventListener("click", () => window.print());

    /* ── About modal ── */
    el.modalCloseBtn?.addEventListener("click",  closeModal);
    el.modalBackdrop?.addEventListener("click",  closeModal);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && el.aboutModal?.classList.contains("active")) closeModal();
    });
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 7: MODAL
     ══════════════════════════════════════════════════════════ */
  function openModal() {
    el.aboutModal?.classList.add("active");
    el.modalBackdrop?.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    el.aboutModal?.classList.remove("active");
    el.modalBackdrop?.classList.remove("active");
    document.body.style.overflow = "";
  }

  /* ══════════════════════════════════════════════════════════
     UTILITIES
     ══════════════════════════════════════════════════════════ */
  function shakeEl(el) {
    el.classList.add("shake-anim");
    setTimeout(() => el.classList.remove("shake-anim"), 600);
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;")
      .replace(/'/g,  "&#039;");
  }

  /* ══════════════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════════════ */
  function init() {
    renderSymptomCategories();
    attachEvents();
    updateCountUI();
    showSection("home");
    // Hide Results nav tab until a diagnosis has been run
    if (el.btnNavResults) el.btnNavResults.style.display = "none";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
