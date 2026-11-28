/**
 * MotoMind API Client
 * Connects React frontend to the Python Flask / HTTP backend.
 */

const API_BASE = "http://127.0.0.1:5000";

// Fallback symptoms in case frontend is loaded before backend starts
export const FALLBACK_SYMPTOMS = [
  {
    id: "starting",
    name: "Starting Problems",
    icon: "zap",
    symptoms: [
      { id: "bike_wont_start", label: "Bike won't start", desc: "Engine does not crank or refuses to fire up at all." },
      { id: "self_start_not_working", label: "Self-start not working", desc: "Pressing electric starter button produces no starter motor rotation." },
      { id: "clicking_sound_starting", label: "Clicking sound when starting", desc: "A rapid clicking noise is heard from under the seat when pressing start." }
    ]
  },
  {
    id: "engine",
    name: "Engine Problems",
    icon: "engine",
    symptoms: [
      { id: "engine_overheating", label: "Engine overheating", desc: "Engine block becomes abnormally hot, emits burning odor or high temp warning." },
      { id: "engine_unusual_noises", label: "Engine making unusual noises", desc: "Metallic knocking, tapping, rattling, or grinding sounds while running." },
      { id: "engine_stopping_frequently", label: "Engine stopping frequently", desc: "Engine stalls suddenly at idling, traffic signals, or when slowing down." }
    ]
  },
  {
    id: "performance",
    name: "Performance Problems",
    icon: "gauge",
    symptoms: [
      { id: "low_mileage", label: "Low mileage", desc: "Fuel tank drains much faster than normal; unexpected drop in fuel economy." },
      { id: "poor_acceleration", label: "Poor acceleration", desc: "Bike feels sluggish, struggles to pick up speed despite twisting throttle." },
      { id: "excessive_vibration", label: "Excessive vibration", desc: "Intense vibrations felt on handlebars, footpegs, or seat at specific speeds." }
    ]
  },
  {
    id: "electrical",
    name: "Electrical Problems",
    icon: "battery",
    symptoms: [
      { id: "headlight_not_working", label: "Headlight not working", desc: "Headlamp does not turn on, flickers heavily, or glows extremely dim." },
      { id: "battery_draining_quickly", label: "Battery draining quickly", desc: "Battery loses charge within hours or overnight without use." },
      { id: "horn_not_working", label: "Horn not working", desc: "Horn produces no sound, a weak squeak, or only works when revving." }
    ]
  }
];

/**
 * Fetch symptom catalog from Python backend
 */
export async function fetchSymptoms() {
  try {
    const res = await fetch(`${API_BASE}/api/symptoms`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { data: data.categories, backendOnline: true };
  } catch (err) {
    console.warn("Could not connect to Python backend at", API_BASE, err);
    return { data: FALLBACK_SYMPTOMS, backendOnline: false };
  }
}

/**
 * Submit selected symptoms to Python Inference Engine
 */
export async function diagnoseSymptoms(symptomIds) {
  const res = await fetch(`${API_BASE}/api/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms: symptomIds })
  });

  if (!res.ok) {
    throw new Error(`Inference API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data;
}

/**
 * Check backend health
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
