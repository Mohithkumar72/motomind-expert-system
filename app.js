/**
 * MotoMind - Two-Wheeler Fault Diagnosis Expert System
 * Main Application Logic & Rule-Based Inference Engine
 */

(function () {
  "use strict";

  // Application State
  const state = {
    selectedSymptoms: new Set(),
    activeSection: "home", // "home" | "diagnosis" | "results"
    lastResults: []
  };

  // DOM Elements
  const elements = {
    // Views
    sectionHome: document.getElementById("section-home"),
    sectionDiagnosis: document.getElementById("section-diagnosis"),
    sectionResults: document.getElementById("section-results"),

    // Navigation buttons
    btnStartDiagnosis: document.getElementById("btn-start-diagnosis"),
    btnHomeAbout: document.getElementById("btn-home-about"),
    btnNavHome: document.getElementById("btn-nav-home"),
    btnNavDiagnose: document.getElementById("btn-nav-diagnose"),
    btnNavAbout: document.getElementById("btn-nav-about"),

    // Diagnosis controls
    symptomCategoriesContainer: document.getElementById("symptom-categories-container"),
    symptomSearchInput: document.getElementById("symptom-search"),
    selectedCountBadge: document.getElementById("selected-count-badge"),
    btnRunDiagnosis: document.getElementById("btn-run-diagnosis"),
    btnClearSymptoms: document.getElementById("btn-clear-symptoms"),
    btnSelectAll: document.getElementById("btn-select-all"),
    btnBackHome: document.getElementById("btn-back-home"),
    presetButtons: document.querySelectorAll(".btn-preset"),

    // Results elements
    btnBackToSymptoms: document.getElementById("btn-back-to-symptoms"),
    btnResetDiagnosis: document.getElementById("btn-reset-diagnosis"),
    btnPrintReport: document.getElementById("btn-print-report"),
    resultsSummaryCount: document.getElementById("results-summary-count"),
    resultsSummarySymptoms: document.getElementById("results-summary-symptoms"),
    resultsContainer: document.getElementById("results-container"),
    noResultsMessage: document.getElementById("no-results-message"),

    // Modal elements
    aboutModal: document.getElementById("about-modal"),
    modalCloseBtn: document.getElementById("modal-close-btn"),
    modalBackdrop: document.getElementById("modal-backdrop")
  };

  // Helper map: Symptom ID -> Symptom Object
  const symptomLookup = new Map();
  SYMPTOM_CATEGORIES.forEach(cat => {
    cat.symptoms.forEach(sym => {
      symptomLookup.set(sym.id, { ...sym, categoryName: cat.name });
    });
  });

  /**
   * Initialize Application
   */
  function init() {
    renderSymptomCategories();
    attachEventListeners();
    updateSelectedCountUI();
    showSection("home");
  }

  /**
   * Render Symptom Selection Checkboxes organized by Categories
   */
  function renderSymptomCategories(filterQuery = "") {
    elements.symptomCategoriesContainer.innerHTML = "";
    const query = filterQuery.trim().toLowerCase();

    let totalVisible = 0;

    SYMPTOM_CATEGORIES.forEach(category => {
      // Filter symptoms based on search query
      const matchingSymptoms = category.symptoms.filter(s => {
        if (!query) return true;
        return s.label.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query);
      });

      if (matchingSymptoms.length === 0) return;
      totalVisible += matchingSymptoms.length;

      const categoryCard = document.createElement("div");
      categoryCard.className = "category-group-card";

      // Category Header
      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `
        <div class="category-icon-wrapper">${category.icon}</div>
        <div class="category-info">
          <h3 class="category-title">${category.name}</h3>
          <span class="category-meta">${matchingSymptoms.length} symptom${matchingSymptoms.length > 1 ? "s" : ""}</span>
        </div>
      `;
      categoryCard.appendChild(header);

      // Symptoms Grid
      const symptomsGrid = document.createElement("div");
      symptomsGrid.className = "symptoms-grid";

      matchingSymptoms.forEach(symptom => {
        const isChecked = state.selectedSymptoms.has(symptom.id);
        const itemLabel = document.createElement("label");
        itemLabel.className = `symptom-checkbox-label ${isChecked ? "active" : ""}`;
        itemLabel.setAttribute("for", `chk-${symptom.id}`);

        itemLabel.innerHTML = `
          <div class="checkbox-custom-wrapper">
            <input 
              type="checkbox" 
              id="chk-${symptom.id}" 
              data-symptom-id="${symptom.id}" 
              class="symptom-checkbox" 
              ${isChecked ? "checked" : ""}
            />
            <span class="custom-checkbox-indicator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </div>
          <div class="symptom-text-block">
            <div class="symptom-name">${symptom.label}</div>
            <div class="symptom-desc">${symptom.desc}</div>
          </div>
        `;

        symptomsGrid.appendChild(itemLabel);
      });

      categoryCard.appendChild(symptomsGrid);
      elements.symptomCategoriesContainer.appendChild(categoryCard);
    });

    if (totalVisible === 0) {
      elements.symptomCategoriesContainer.innerHTML = `
        <div class="empty-filter-state">
          <p>No symptoms matching "<strong>${escapeHtml(filterQuery)}</strong>".</p>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-search">Clear Search</button>
        </div>
      `;
      const clearBtn = document.getElementById("btn-clear-search");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          elements.symptomSearchInput.value = "";
          renderSymptomCategories("");
        });
      }
    }
  }

  /**
   * Attach All Event Listeners
   */
  function attachEventListeners() {
    // Navigation
    elements.btnStartDiagnosis.addEventListener("click", () => {
      showSection("diagnosis");
    });

    if (elements.btnNavHome) {
      elements.btnNavHome.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("home");
      });
    }

    if (elements.btnNavDiagnose) {
      elements.btnNavDiagnose.addEventListener("click", (e) => {
        e.preventDefault();
        showSection("diagnosis");
      });
    }

    if (elements.btnNavAbout) {
      elements.btnNavAbout.addEventListener("click", (e) => {
        e.preventDefault();
        openAboutModal();
      });
    }

    if (elements.btnHomeAbout) {
      elements.btnHomeAbout.addEventListener("click", openAboutModal);
    }

    elements.btnBackHome.addEventListener("click", () => {
      showSection("home");
    });

    // Checkbox toggles via delegation
    elements.symptomCategoriesContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("symptom-checkbox")) {
        const symptomId = e.target.getAttribute("data-symptom-id");
        toggleSymptom(symptomId, e.target.checked);
        const parentLabel = e.target.closest(".symptom-checkbox-label");
        if (parentLabel) {
          parentLabel.classList.toggle("active", e.target.checked);
        }
      }
    });

    // Search filter input
    elements.symptomSearchInput.addEventListener("input", (e) => {
      renderSymptomCategories(e.target.value);
    });

    // Clear and Select All buttons
    elements.btnClearSymptoms.addEventListener("click", () => {
      clearAllSymptoms();
    });

    elements.btnSelectAll.addEventListener("click", () => {
      selectAllVisibleSymptoms();
    });

    // Preset scenarios for live demo
    elements.presetButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const presetType = btn.getAttribute("data-preset");
        loadPresetScenario(presetType);
      });
    });

    // Execute Inference Diagnosis
    elements.btnRunDiagnosis.addEventListener("click", () => {
      if (state.selectedSymptoms.size === 0) {
        shakeElement(elements.btnRunDiagnosis);
        alert("Please select at least one symptom before running the diagnosis.");
        return;
      }
      runDiagnosis();
    });

    // Results Actions
    elements.btnBackToSymptoms.addEventListener("click", () => {
      showSection("diagnosis");
    });

    elements.btnResetDiagnosis.addEventListener("click", () => {
      clearAllSymptoms();
      showSection("diagnosis");
    });

    elements.btnPrintReport.addEventListener("click", () => {
      window.print();
    });

    // About Modal handlers
    elements.modalCloseBtn.addEventListener("click", closeAboutModal);
    elements.modalBackdrop.addEventListener("click", closeAboutModal);

    // Escape key closes modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && elements.aboutModal.classList.contains("active")) {
        closeAboutModal();
      }
    });
  }

  /**
   * Switch between main application sections
   */
  function showSection(sectionId) {
    state.activeSection = sectionId;

    elements.sectionHome.classList.remove("active-section");
    elements.sectionDiagnosis.classList.remove("active-section");
    elements.sectionResults.classList.remove("active-section");

    if (sectionId === "home") {
      elements.sectionHome.classList.add("active-section");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (sectionId === "diagnosis") {
      elements.sectionDiagnosis.classList.add("active-section");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (sectionId === "results") {
      elements.sectionResults.classList.add("active-section");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /**
   * Toggle individual symptom selection
   */
  function toggleSymptom(symptomId, isSelected) {
    if (isSelected) {
      state.selectedSymptoms.add(symptomId);
    } else {
      state.selectedSymptoms.delete(symptomId);
    }
    updateSelectedCountUI();
  }

  /**
   * Clear all selected symptoms
   */
  function clearAllSymptoms() {
    state.selectedSymptoms.clear();
    const checkboxes = elements.symptomCategoriesContainer.querySelectorAll(".symptom-checkbox");
    checkboxes.forEach(chk => {
      chk.checked = false;
      const parentLabel = chk.closest(".symptom-checkbox-label");
      if (parentLabel) parentLabel.classList.remove("active");
    });
    updateSelectedCountUI();
  }

  /**
   * Select all visible symptoms in the active view
   */
  function selectAllVisibleSymptoms() {
    const checkboxes = elements.symptomCategoriesContainer.querySelectorAll(".symptom-checkbox");
    checkboxes.forEach(chk => {
      const symId = chk.getAttribute("data-symptom-id");
      if (symId) {
        state.selectedSymptoms.add(symId);
        chk.checked = true;
        const parentLabel = chk.closest(".symptom-checkbox-label");
        if (parentLabel) parentLabel.classList.add("active");
      }
    });
    updateSelectedCountUI();
  }

  /**
   * Load standard demonstration presets
   */
  function loadPresetScenario(presetKey) {
    clearAllSymptoms();

    let presetIds = [];
    if (presetKey === "battery") {
      presetIds = ["bike_wont_start", "clicking_sound_starting", "headlight_not_working"];
    } else if (presetKey === "overheating") {
      presetIds = ["engine_overheating", "engine_unusual_noises", "poor_acceleration"];
    } else if (presetKey === "fuel_carb") {
      presetIds = ["low_mileage", "poor_acceleration", "engine_stopping_frequently"];
    } else if (presetKey === "electrical") {
      presetIds = ["headlight_not_working", "horn_not_working", "self_start_not_working"];
    }

    presetIds.forEach(id => {
      state.selectedSymptoms.add(id);
      const chk = document.getElementById(`chk-${id}`);
      if (chk) {
        chk.checked = true;
        const parent = chk.closest(".symptom-checkbox-label");
        if (parent) parent.classList.add("active");
      }
    });

    updateSelectedCountUI();
  }

  /**
   * Update the badge showing count of selected symptoms & button state
   */
  function updateSelectedCountUI() {
    const count = state.selectedSymptoms.size;
    elements.selectedCountBadge.textContent = `${count} Selected`;

    if (count > 0) {
      elements.btnRunDiagnosis.removeAttribute("disabled");
      elements.selectedCountBadge.classList.add("has-selection");
    } else {
      elements.btnRunDiagnosis.setAttribute("disabled", "true");
      elements.selectedCountBadge.classList.remove("has-selection");
    }
  }

  /**
   * ==========================================
   * AI RULE-BASED INFERENCE ENGINE
   * ==========================================
   * 
   * Forward Chaining Pattern Matching:
   * 1. Evaluates user symptoms against EXPERT_RULES
   * 2. Checks if minimum threshold condition is met
   * 3. Computes Match Percentage:
   *      Match % = (Number of matched symptoms in rule / Total symptoms in rule) * 100
   * 4. Ranks candidate faults by:
   *      - Match Percentage (Descending)
   *      - Matched count (Descending)
   *      - Severity priority (High > Medium > Low)
   */
  function runInference(selectedIds) {
    const diagnosedFaults = [];
    const selectedArray = Array.from(selectedIds);

    EXPERT_RULES.forEach(rule => {
      // Find all symptoms of this rule that user has selected
      const matchedSymptoms = rule.symptoms.filter(symId => selectedIds.has(symId));
      const matchCount = matchedSymptoms.length;

      // Rule triggers if at least minRequired symptoms match
      if (matchCount >= rule.minRequired) {
        const totalRuleSymptoms = rule.symptoms.length;
        const matchPercentage = Math.round((matchCount / totalRuleSymptoms) * 100);

        // Map IDs to readable labels
        const matchedLabels = matchedSymptoms.map(id => {
          const item = symptomLookup.get(id);
          return item ? item.label : id;
        });

        // Unmatched symptoms in this rule (for transparent explanation)
        const missingSymptoms = rule.symptoms
          .filter(id => !selectedIds.has(id))
          .map(id => {
            const item = symptomLookup.get(id);
            return item ? item.label : id;
          });

        diagnosedFaults.push({
          ruleId: rule.id,
          fault: rule.fault,
          category: rule.category,
          severity: rule.severity,
          matchPercentage: matchPercentage,
          matchCount: matchCount,
          totalSymptoms: totalRuleSymptoms,
          matchedSymptoms: matchedLabels,
          missingSymptoms: missingSymptoms,
          ruleConditionText: rule.ruleConditionText,
          explanation: rule.explanation,
          troubleshooting: rule.troubleshooting,
          mechanicAdvice: rule.mechanicAdvice
        });
      }
    });

    // Sort order:
    // 1. Highest match percentage first
    // 2. Highest absolute matched count
    // 3. Severity weighting: High > Medium > Low
    const severityWeight = { "High": 3, "Medium": 2, "Low": 1 };

    diagnosedFaults.sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount;
      }
      return severityWeight[b.severity] - severityWeight[a.severity];
    });

    return diagnosedFaults;
  }

  /**
   * Run the diagnosis and display results
   */
  function runDiagnosis() {
    const results = runInference(state.selectedSymptoms);
    state.lastResults = results;
    renderResults(results);
    showSection("results");
  }

  /**
   * Render Diagnosis Results in Cards
   */
  function renderResults(results) {
    elements.resultsContainer.innerHTML = "";

    const selectedCount = state.selectedSymptoms.size;
    elements.resultsSummarySymptoms.textContent = `${selectedCount} symptom${selectedCount > 1 ? "s" : ""} selected`;
    elements.resultsSummaryCount.textContent = `${results.length} possible fault${results.length !== 1 ? "s" : ""} detected`;

    if (results.length === 0) {
      elements.noResultsMessage.style.display = "block";
      elements.resultsContainer.style.display = "none";
      return;
    }

    elements.noResultsMessage.style.display = "none";
    elements.resultsContainer.style.display = "grid";

    results.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = `diagnosis-result-card severity-${item.severity.toLowerCase()}`;

      // Severity Color and Icon
      let severityBadgeClass = "badge-severity-low";
      if (item.severity === "High") severityBadgeClass = "badge-severity-high";
      if (item.severity === "Medium") severityBadgeClass = "badge-severity-medium";

      // Match confidence badge color
      let matchBadgeClass = "match-moderate";
      if (item.matchPercentage >= 75) matchBadgeClass = "match-high";
      else if (item.matchPercentage < 50) matchBadgeClass = "match-low";

      // Matched Symptoms Pills
      const matchedPills = item.matchedSymptoms
        .map(s => `<span class="symptom-tag matched"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg> ${escapeHtml(s)}</span>`)
        .join("");

      // Missing Symptoms (if any)
      const missingPills = item.missingSymptoms.length > 0
        ? `<div class="missing-symptoms-section">
            <span class="sub-label">Other associated symptoms:</span>
            <div class="symptom-tags-wrapper">
              ${item.missingSymptoms.map(s => `<span class="symptom-tag unconfirmed"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${escapeHtml(s)}</span>`).join("")}
            </div>
           </div>`
        : "";

      // Troubleshooting list items
      const stepsList = item.troubleshooting
        .map((step, sIdx) => `
          <li class="step-item">
            <span class="step-num">${sIdx + 1}</span>
            <span class="step-text">${escapeHtml(step)}</span>
          </li>
        `)
        .join("");

      card.innerHTML = `
        <div class="card-top-bar">
          <div class="card-ranking-meta">
            <span class="rank-badge">#${index + 1} Likely Cause</span>
            <span class="system-category-tag">${escapeHtml(item.category)}</span>
          </div>
          <div class="card-top-badges">
            <span class="severity-badge ${severityBadgeClass}">
              <span class="severity-dot"></span>
              ${item.severity} Severity
            </span>
            <div class="match-score-badge ${matchBadgeClass}">
              <span class="match-percent">${item.matchPercentage}%</span>
              <span class="match-label">Match</span>
            </div>
          </div>
        </div>

        <h3 class="card-fault-title">${escapeHtml(item.fault)}</h3>

        <!-- Match progress meter -->
        <div class="match-meter-wrapper">
          <div class="match-meter-bar">
            <div class="match-meter-fill ${matchBadgeClass}" style="width: ${item.matchPercentage}%;"></div>
          </div>
          <span class="match-meter-text">${item.matchCount} of ${item.totalSymptoms} key symptoms matched</span>
        </div>

        <!-- Symptoms Detected -->
        <div class="detected-symptoms-block">
          <span class="sub-label">Symptoms Detected:</span>
          <div class="symptom-tags-wrapper">
            ${matchedPills}
          </div>
          ${missingPills}
        </div>

        <!-- Rule Trigger Banner (Expert System Transparency) -->
        <div class="rule-trigger-banner">
          <div class="rule-tag-header">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <strong>Triggered Knowledge Base Rule (${item.ruleId})</strong>
          </div>
          <code class="rule-code">${escapeHtml(item.ruleConditionText)}</code>
        </div>

        <!-- Explanation -->
        <div class="card-explanation-block">
          <h4 class="section-subheading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Why MotoMind Suggested This:
          </h4>
          <p class="explanation-text">${escapeHtml(item.explanation)}</p>
        </div>

        <!-- Troubleshooting Steps -->
        <div class="card-troubleshooting-block">
          <h4 class="section-subheading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            Basic Troubleshooting Steps:
          </h4>
          <ul class="steps-list">
            ${stepsList}
          </ul>
        </div>

        <!-- Mechanic Guidance / Caution -->
        <div class="mechanic-advice-box">
          <div class="advice-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <div class="advice-content">
            <strong>Professional Guidance:</strong> ${escapeHtml(item.mechanicAdvice)}
          </div>
        </div>
      `;

      elements.resultsContainer.appendChild(card);
    });
  }

  /**
   * Modal Open / Close
   */
  function openAboutModal() {
    elements.aboutModal.classList.add("active");
    elements.modalBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeAboutModal() {
    elements.aboutModal.classList.remove("active");
    elements.modalBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  /**
   * Simple UI Shake Animation helper for validation
   */
  function shakeElement(el) {
    el.classList.add("shake-anim");
    setTimeout(() => {
      el.classList.remove("shake-anim");
    }, 600);
  }

  /**
   * Helper: Escape HTML to avoid injection
   */
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Start initialization when DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
