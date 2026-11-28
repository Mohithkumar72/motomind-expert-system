import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchSymptoms, diagnoseSymptoms, FALLBACK_SYMPTOMS } from './api';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState('home'); // 'home' | 'diagnosis' | 'results'
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Data & Symptoms State
  const [categories, setCategories] = useState(FALLBACK_SYMPTOMS);
  const [selectedSymptoms, setSelectedSymptoms] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [backendOnline, setBackendOnline] = useState(false);

  // Diagnosis Results State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState([]);
  const [apiError, setApiError] = useState(null);

  // Load symptom categories from Python backend on mount
  useEffect(() => {
    async function loadData() {
      const { data, backendOnline: isOnline } = await fetchSymptoms();
      setCategories(data);
      setBackendOnline(isOnline);
    }
    loadData();
  }, []);

  // Toggle individual symptom selection
  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) => {
      const updated = new Set(prev);
      if (updated.has(symptomId)) {
        updated.delete(symptomId);
      } else {
        updated.add(symptomId);
      }
      return updated;
    });
  };

  // Select all visible symptoms
  const handleSelectAll = () => {
    const allIds = new Set();
    categories.forEach((cat) => {
      cat.symptoms.forEach((s) => allIds.add(s.id));
    });
    setSelectedSymptoms(allIds);
  };

  // Clear all symptoms
  const handleClearAll = () => {
    setSelectedSymptoms(new Set());
  };

  // Demo Preset loader
  const handleLoadPreset = (presetKey) => {
    let presetIds = [];
    if (presetKey === 'battery') {
      presetIds = ['bike_wont_start', 'clicking_sound_starting', 'headlight_not_working'];
    } else if (presetKey === 'overheating') {
      presetIds = ['engine_overheating', 'engine_unusual_noises', 'poor_acceleration'];
    } else if (presetKey === 'fuel_carb') {
      presetIds = ['low_mileage', 'poor_acceleration', 'engine_stopping_frequently'];
    } else if (presetKey === 'electrical') {
      presetIds = ['headlight_not_working', 'horn_not_working', 'self_start_not_working'];
    }
    setSelectedSymptoms(new Set(presetIds));
  };

  // Submit diagnosis to Python backend
  const handleRunDiagnosis = async () => {
    if (selectedSymptoms.size === 0) {
      alert('Please select at least one symptom before running the diagnosis.');
      return;
    }

    setIsDiagnosing(true);
    setApiError(null);

    try {
      const response = await diagnoseSymptoms(Array.from(selectedSymptoms));
      setDiagnosticResults(response.results || []);
      setBackendOnline(true);
      setActiveView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Diagnosis error:', err);
      setApiError('Unable to connect to Python backend. Please ensure the backend is running at http://127.0.0.1:5000');
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Print report handler
  const handlePrint = () => {
    window.print();
  };

  // Category Icon SVG Renderer
  const renderCategoryIcon = (iconType) => {
    switch (iconType) {
      case 'zap':
      case 'starting':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
      case 'engine':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        );
      case 'gauge':
      case 'performance':
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M16.2 7.8l-4.2 4.2" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'battery':
      case 'electrical':
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
    }
  };

  return (
    <div className="motomind-app">
      {/* =================================================================== */}
      {/* App Header                                                          */}
      {/* =================================================================== */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand-logo" onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6h-3a1 1 0 0 0-1 1v4l-3 3h5.5l1.5-3.5L18 12" />
                <path d="M9 17h6" />
                <circle cx="12" cy="7" r="1" fill="currentColor" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">
                Moto<span className="brand-highlight">Mind</span>
              </span>
              <span className="brand-tagline">React + Python AI Expert System</span>
            </div>
          </div>

          <nav className="nav-links">
            <span className={`status-pill ${backendOnline ? 'online' : 'offline'}`} title="Python REST API status">
              <span className="status-dot"></span>
              {backendOnline ? 'Python API Online' : 'Python API Offline'}
            </span>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => {
                setActiveView('diagnosis');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              Diagnose
            </button>
            <button type="button" className="nav-link-btn" onClick={() => setAboutModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              About AI System
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {/* =================================================================== */}
        {/* 1. HOME VIEW                                                        */}
        {/* =================================================================== */}
        {activeView === 'home' && (
          <section className="view-section active-section">
            <div className="hero-container">
              <div className="hero-badge">
                <span className="pulse-dot"></span>
                <span>Python Rule-Based AI Inference Engine</span>
              </div>

              <h1 className="hero-title">
                Smart Diagnostics for <br />
                <span className="text-gradient">Two-Wheeler Faults</span>
              </h1>

              <p className="hero-description">
                MotoMind combines a modern <strong>React.js</strong> frontend with a powerful <strong>Python</strong> rule-based expert system. Select observed symptoms to analyze mechanical, electrical, and fuel anomalies with transparent IF-THEN reasoning.
              </p>

              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    setActiveView('diagnosis');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start Diagnosis
                </button>
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => setAboutModalOpen(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  How MotoMind Works
                </button>
              </div>

              {/* Highlights */}
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon orange">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">Python Knowledge Base</h3>
                  <p className="feature-desc">Curated domain knowledge in <code>rules.py</code> covering starting, engine clatter, overheating, electrical draw, and fuel starvation.</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon amber">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                  </div>
                  <h3 className="feature-title">Forward-Chaining Engine</h3>
                  <p className="feature-desc">Python inference engine in <code>engine.py</code> evaluates IF-THEN rules and calculates deterministic confidence scores.</p>
                </div>

                <div className="feature-card">
                  <div className="feature-icon emerald">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">React.js Dashboard</h3>
                  <p className="feature-desc">Interactive, real-time UI with responsive layout, custom checkboxes, live search, and print report generation.</p>
                </div>
              </div>

              {/* Stats Ribbon */}
              <div className="stats-ribbon">
                <div className="stat-item">
                  <span className="stat-number">4</span>
                  <span className="stat-label">Symptom Categories</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">12+</span>
                  <span className="stat-label">Production Rules</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Explainable AI</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* 2. SYMPTOM SELECTION WIZARD                                         */}
        {/* =================================================================== */}
        {activeView === 'diagnosis' && (
          <section className="view-section active-section">
            <div className="diagnosis-wrapper">
              <div className="section-nav-bar">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveView('home')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Back to Home
                </button>
                <div className="wizard-step-indicator">
                  <span className="step-badge">Step 1 of 2</span>
                  <span className="step-title">Select Reported Symptoms</span>
                </div>
              </div>

              <div className="wizard-header">
                <h2 className="section-title">What issues are you experiencing?</h2>
                <p className="section-subtitle">
                  Choose all symptoms observed on your motorcycle or scooter. The Python expert system will cross-reference combinations against its knowledge base.
                </p>
              </div>

              {/* Error banner if backend was offline */}
              {apiError && (
                <div className="api-error-banner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              {/* Demo Presets */}
              <div className="preset-box">
                <div className="preset-label">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  <span>Live Demo Presets:</span>
                </div>
                <div className="preset-buttons-group">
                  <button type="button" className="btn-preset" onClick={() => handleLoadPreset('battery')}>
                    Dead Battery
                  </button>
                  <button type="button" className="btn-preset" onClick={() => handleLoadPreset('overheating')}>
                    Engine Overheating
                  </button>
                  <button type="button" className="btn-preset" onClick={() => handleLoadPreset('fuel_carb')}>
                    Carb / Air Clog
                  </button>
                  <button type="button" className="btn-preset" onClick={() => handleLoadPreset('electrical')}>
                    Electrical Short
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="symptom-toolbar">
                <div className="search-box-wrapper">
                  <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Quick search symptoms (e.g., clicking, noise, headlight...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="toolbar-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleSelectAll}>
                    Select All
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleClearAll}>
                    Clear All
                  </button>
                  <span className={`count-badge ${selectedSymptoms.size > 0 ? 'has-selection' : ''}`}>
                    {selectedSymptoms.size} Selected
                  </span>
                </div>
              </div>

              {/* Symptom Categories */}
              <div className="categories-container">
                {categories.map((category) => {
                  const filtered = category.symptoms.filter((s) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
                  });

                  if (filtered.length === 0) return null;

                  return (
                    <div key={category.id} className="category-group-card">
                      <div className="category-header">
                        <div className="category-icon-wrapper">{renderCategoryIcon(category.icon || category.id)}</div>
                        <div className="category-info">
                          <h3 className="category-title">{category.name}</h3>
                          <span className="category-meta">
                            {filtered.length} symptom{filtered.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      <div className="symptoms-grid">
                        {filtered.map((symptom) => {
                          const isChecked = selectedSymptoms.has(symptom.id);
                          return (
                            <label
                              key={symptom.id}
                              className={`symptom-checkbox-label ${isChecked ? 'active' : ''}`}
                              onClick={() => toggleSymptom(symptom.id)}
                            >
                              <div className="checkbox-custom-wrapper">
                                <input
                                  type="checkbox"
                                  className="symptom-checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                />
                                <span className="custom-checkbox-indicator">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </span>
                              </div>
                              <div className="symptom-text-block">
                                <div className="symptom-name">{symptom.label}</div>
                                <div className="symptom-desc">{symptom.desc}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky Footer Trigger */}
              <div className="diagnosis-footer-bar">
                <div className="footer-info">
                  <span className="footer-tip">Select one or more symptoms to trigger rule evaluations</span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleRunDiagnosis}
                  disabled={selectedSymptoms.size === 0 || isDiagnosing}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {isDiagnosing ? 'Running Python Inference...' : 'Diagnose Faults'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* 3. RESULTS VIEW                                                     */}
        {/* =================================================================== */}
        {activeView === 'results' && (
          <section className="view-section active-section">
            <div className="results-wrapper">
              <div className="results-action-bar">
                <div className="results-title-group">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setActiveView('diagnosis')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Modify Symptoms
                  </button>
                  <h2 className="section-title">Diagnostic Results</h2>
                </div>

                <div className="results-controls">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    Print / Save Report
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      handleClearAll();
                      setActiveView('diagnosis');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 2v6h6" />
                      <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
                      <path d="M21 22v-6h-6" />
                      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
                    </svg>
                    Reset Diagnosis
                  </button>
                </div>
              </div>

              {/* Overview Banner */}
              <div className="diagnosis-overview-card">
                <div className="overview-item">
                  <span className="overview-label">User Input</span>
                  <span className="overview-value">
                    {selectedSymptoms.size} symptom{selectedSymptoms.size !== 1 ? 's' : ''} analyzed
                  </span>
                </div>
                <div className="overview-divider"></div>
                <div className="overview-item">
                  <span className="overview-label">Inference Status</span>
                  <span className="overview-value text-accent">
                    {diagnosticResults.length} possible fault{diagnosticResults.length !== 1 ? 's' : ''} detected
                  </span>
                </div>
                <div className="overview-divider"></div>
                <div className="overview-item">
                  <span className="overview-label">AI Engine</span>
                  <span className="overview-value">Python Forward Chaining</span>
                </div>
              </div>

              {/* Results Cards List */}
              {diagnosticResults.length > 0 ? (
                <div className="results-cards-grid">
                  {diagnosticResults.map((item, index) => {
                    const severityClass = `badge-severity-${item.severity.toLowerCase()}`;
                    let matchClass = 'match-moderate';
                    if (item.match_percentage >= 75) matchClass = 'match-high';
                    else if (item.match_percentage < 50) matchClass = 'match-low';

                    return (
                      <article key={item.rule_id} className={`diagnosis-result-card severity-${item.severity.toLowerCase()}`}>
                        <div className="card-top-bar">
                          <div className="card-ranking-meta">
                            <span className="rank-badge">#{index + 1} Likely Cause</span>
                            <span className="system-category-tag">{item.category}</span>
                          </div>
                          <div className="card-top-badges">
                            <span className={`severity-badge ${severityClass}`}>
                              <span className="severity-dot"></span>
                              {item.severity} Severity
                            </span>
                            <div className={`match-score-badge ${matchClass}`}>
                              <span className="match-percent">{item.match_percentage}%</span>
                              <span className="match-label">Match</span>
                            </div>
                          </div>
                        </div>

                        <h3 className="card-fault-title">{item.fault}</h3>

                        {/* Progress Meter */}
                        <div className="match-meter-wrapper">
                          <div className="match-meter-bar">
                            <div className={`match-meter-fill ${matchClass}`} style={{ width: `${item.match_percentage}%` }}></div>
                          </div>
                          <span className="match-meter-text">
                            {item.match_count} of {item.total_symptoms} key symptoms matched
                          </span>
                        </div>

                        {/* Symptoms Detected */}
                        <div className="detected-symptoms-block">
                          <span className="sub-label">Symptoms Detected:</span>
                          <div className="symptom-tags-wrapper">
                            {item.matched_symptoms.map((s, idx) => (
                              <span key={idx} className="symptom-tag matched">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {s}
                              </span>
                            ))}
                          </div>

                          {item.missing_symptoms && item.missing_symptoms.length > 0 && (
                            <div className="missing-symptoms-section">
                              <span className="sub-label">Other associated symptoms:</span>
                              <div className="symptom-tags-wrapper">
                                {item.missing_symptoms.map((s, idx) => (
                                  <span key={idx} className="symptom-tag unconfirmed">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <circle cx="12" cy="12" r="10" />
                                      <line x1="12" y1="8" x2="12" y2="12" />
                                      <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rule Banner */}
                        <div className="rule-trigger-banner">
                          <div className="rule-tag-header">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <strong>Triggered Knowledge Base Rule ({item.rule_id})</strong>
                          </div>
                          <code className="rule-code">{item.rule_condition}</code>
                        </div>

                        {/* Explanation */}
                        <div className="card-explanation-block">
                          <h4 className="section-subheading">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="16" x2="12" y2="12" />
                              <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Why MotoMind Suggested This:
                          </h4>
                          <p className="explanation-text">{item.explanation}</p>
                        </div>

                        {/* Troubleshooting Steps */}
                        <div className="card-troubleshooting-block">
                          <h4 className="section-subheading">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                            Basic Troubleshooting Steps:
                          </h4>
                          <ul className="steps-list">
                            {item.troubleshooting.map((step, sIdx) => (
                              <li key={sIdx} className="step-item">
                                <span className="step-num">{sIdx + 1}</span>
                                <span className="step-text">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Professional Guidance */}
                        <div className="mechanic-advice-box">
                          <div className="advice-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                              <line x1="12" y1="9" x2="12" y2="13" />
                              <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                          </div>
                          <div className="advice-content">
                            <strong>Professional Guidance:</strong> {item.mechanic_advice}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="no-results-card">
                  <div className="empty-icon-wrap">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <h3>No Direct Rule Match Found</h3>
                  <p>The combination of symptoms selected did not satisfy the minimum condition thresholds of any predefined rule in the Python knowledge base.</p>
                  <button type="button" className="btn btn-primary" onClick={() => setActiveView('diagnosis')}>
                    Adjust Selected Symptoms
                  </button>
                </div>
              )}

              {/* Safety Disclaimer */}
              <div className="safety-disclaimer-card">
                <div className="disclaimer-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="disclaimer-text">
                  <h4>Important Safety & Diagnostic Disclaimer</h4>
                  <p>
                    MotoMind is an educational rule-based expert system designed as a preliminary troubleshooting guide. Always prioritize safety: high-voltage ignition parts, hot engine components, and fuel leaks pose safety hazards. If problems persist, have a certified two-wheeler mechanic inspect the vehicle before riding.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* =================================================================== */}
      {/* ABOUT MODAL                                                         */}
      {/* =================================================================== */}
      {aboutModalOpen && (
        <>
          <div className="modal-wrapper active" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <div className="modal-title-wrap">
                  <span className="modal-tag">Artificial Intelligence Architecture</span>
                  <h2>About MotoMind Expert System</h2>
                </div>
                <button type="button" className="modal-close" onClick={() => setAboutModalOpen(false)}>
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <section className="modal-section">
                  <h3>What is a Rule-Based Expert System?</h3>
                  <p>
                    An <strong>Expert System</strong> is a branch of Artificial Intelligence (AI) that emulates the decision-making ability of a human specialist in a specific domain. Rather than using opaque black-box neural networks, an expert system applies explicit domain rules to deduce conclusions.
                  </p>
                </section>

                <section className="modal-section">
                  <h3>Core System Components</h3>
                  <div className="architecture-grid">
                    <div className="arch-card">
                      <span className="arch-badge">1</span>
                      <h4>Knowledge Base (Python)</h4>
                      <p>Encodes human mechanical expertise as structured IF-THEN production rules in <code>rules.py</code> with fault categories, severity ratings, and troubleshooting procedures.</p>
                    </div>
                    <div className="arch-card">
                      <span className="arch-badge">2</span>
                      <h4>Working Memory</h4>
                      <p>Stores the active state of symptoms reported by the user for the current two-wheeler inspection session.</p>
                    </div>
                    <div className="arch-card">
                      <span className="arch-badge">3</span>
                      <h4>Inference Engine (Python)</h4>
                      <p>Applies forward-chaining pattern matching in <code>engine.py</code>, computes symptom match percentages, and orders faults by likelihood.</p>
                    </div>
                    <div className="arch-card">
                      <span className="arch-badge">4</span>
                      <h4>User Interface (React.js)</h4>
                      <p>Provides an intuitive automotive dashboard enabling symptom selection, search filtering, and transparent diagnosis results.</p>
                    </div>
                  </div>
                </section>

                <section className="modal-section">
                  <h3>Confidence & Match Percentage Formula</h3>
                  <p>Confidence score is deterministically calculated by comparing observed symptoms against a rule's requirement vector:</p>
                  <pre className="code-snippet">Match Percentage = (Matched Observed Symptoms / Total Symptoms in Rule) &times; 100%</pre>
                </section>

                <section className="modal-section">
                  <h3>Technical Stack</h3>
                  <div className="tech-pill-group">
                    <span className="tech-pill">React.js (Frontend)</span>
                    <span className="tech-pill">Python 3.x (Backend)</span>
                    <span className="tech-pill">Flask REST API</span>
                    <span className="tech-pill">Forward-Chaining Inference</span>
                    <span className="tech-pill">Zero External AI APIs</span>
                  </div>
                </section>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAboutModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop active" onClick={() => setAboutModalOpen(false)}></div>
        </>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-copy">
            <strong>MotoMind</strong> &ndash; Two-Wheeler Fault Diagnosis Expert System (React + Python)
          </div>
          <div className="footer-credit">
            AI &amp; Expert Systems Mini-Project &bull; Rule-Based Reasoning Engine
          </div>
        </div>
      </footer>
    </div>
  );
}
