/**
 * MotoMind - Knowledge Base for Two-Wheeler Fault Diagnosis
 * 
 * In an AI Expert System:
 * 1. Knowledge Base: Contains domain knowledge represented as rules (IF-THEN).
 * 2. Working Memory: The symptoms input by the user.
 * 3. Inference Engine: Matches working memory against the rules to deduce faults.
 */

// Master list of all symptoms organized by category
const SYMPTOM_CATEGORIES = [
  {
    id: "starting",
    name: "Starting Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    symptoms: [
      { id: "bike_wont_start", label: "Bike won't start", desc: "Engine does not crank or refuses to fire up at all." },
      { id: "self_start_not_working", label: "Self-start not working", desc: "Pressing the electric starter button produces no starter motor rotation." },
      { id: "clicking_sound_starting", label: "Clicking sound when starting", desc: "A rapid clicking or ticking noise is heard from under the seat when pressing start." }
    ]
  },
  {
    id: "engine",
    name: "Engine Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    symptoms: [
      { id: "engine_overheating", label: "Engine overheating", desc: "Engine block becomes abnormally hot, emits burning odor or shows high temp warning." },
      { id: "engine_unusual_noises", label: "Engine making unusual noises", desc: "Metallic knocking, tapping, rattling, or grinding sounds while running." },
      { id: "engine_stopping_frequently", label: "Engine stopping frequently", desc: "Engine stalls suddenly at idling, traffic signals, or when slowing down." }
    ]
  },
  {
    id: "performance",
    name: "Performance Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-4.2 4.2"/><circle cx="12" cy="12" r="2"/></svg>`,
    symptoms: [
      { id: "low_mileage", label: "Low mileage", desc: "Fuel tank drains much faster than normal; unexpected drop in fuel economy." },
      { id: "poor_acceleration", label: "Poor acceleration", desc: "Bike feels sluggish, struggles to pick up speed despite twisting throttle." },
      { id: "excessive_vibration", label: "Excessive vibration", desc: "Intense vibrations felt on handlebars, footpegs, or seat at specific speeds." }
    ]
  },
  {
    id: "electrical",
    name: "Electrical Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    symptoms: [
      { id: "headlight_not_working", label: "Headlight not working", desc: "Headlamp does not turn on, flickers heavily, or glows extremely dim." },
      { id: "battery_draining_quickly", label: "Battery draining quickly", desc: "Battery loses charge within hours or overnight without use." },
      { id: "horn_not_working", label: "Horn not working", desc: "Horn produces no sound, a weak squeak, or only works when engine revs." }
    ]
  }
];

/**
 * Predefined Expert System Rules
 * 
 * Each rule structure:
 * - id: Unique rule identifier
 * - fault: Name of the diagnosed fault
 * - category: Related component subsystem
 * - severity: "High" | "Medium" | "Low"
 * - symptoms: List of symptom IDs associated with this fault
 * - minRequired: Minimum number of symptom matches to trigger this rule
 * - ruleConditionText: Human-readable IF-THEN logic statement
 * - explanation: Expert explanation of the underlying mechanical/electrical cause
 * - troubleshooting: Concrete actionable steps for inspection and correction
 * - mechanicAdvice: Safety guidance when professional tools are needed
 */
const EXPERT_RULES = [
  {
    id: "RULE_01",
    fault: "Discharged or Dead Battery",
    category: "Electrical & Starting",
    severity: "Medium",
    symptoms: ["bike_wont_start", "clicking_sound_starting", "headlight_not_working"],
    minRequired: 1,
    ruleConditionText: "IF ('Bike won't start' OR 'Clicking sound when starting') AND ('Headlight not working' OR 'Battery draining')",
    explanation: "The starter relay clicks when energized, but the battery does not possess sufficient cold-cranking amps (CCA) to turn the engine starter motor. Weak or absent headlights confirm a low state of electrical charge.",
    troubleshooting: [
      "Check terminal terminals for white/green corrosion; clean with a wire brush and tighten connections.",
      "Measure battery voltage with a multimeter (healthy battery should read 12.6V+ resting).",
      "Attempt to kick-start the bike (if equipped) or jump-start using a 12V automotive battery.",
      "Recharge the battery with an external smart trickle charger for 6–8 hours."
    ],
    mechanicAdvice: "If the battery is older than 2–3 years and won't hold charge above 12.4V after a full charging cycle, replace the battery unit."
  },
  {
    id: "RULE_02",
    fault: "Defective Starter Relay / Starter Motor",
    category: "Starting System",
    severity: "Medium",
    symptoms: ["self_start_not_working", "clicking_sound_starting", "bike_wont_start"],
    minRequired: 2,
    ruleConditionText: "IF 'Self-start not working' AND 'Clicking sound when starting'",
    explanation: "The starter solenoid relay is successfully receiving signal from the handlebar switch (causing the audible click), but the high-current contactor is worn or the carbon brushes inside the starter motor have worn down.",
    troubleshooting: [
      "Check the starter relay fuse located in the main fuse box.",
      "Gently tap the starter motor casing with a plastic mallet while pressing the start button (temporary test for stuck brushes).",
      "Inspect the heavy gauge wire running from the starter relay to the starter motor for loose nuts or corrosion."
    ],
    mechanicAdvice: "Visit a workshop to inspect the starter motor carbon brushes, commutator, or replace the starter solenoid relay."
  },
  {
    id: "RULE_03",
    fault: "Fouled Spark Plug or Ignition System Fault",
    category: "Ignition System",
    severity: "High",
    symptoms: ["bike_wont_start", "engine_stopping_frequently", "poor_acceleration"],
    minRequired: 2,
    ruleConditionText: "IF 'Bike won't start' AND ('Engine stopping frequently' OR 'Poor acceleration')",
    explanation: "A spark plug coated in carbon deposits, fuel, or with an incorrect electrode gap prevents reliable combustion sparks. This causes random misfires under acceleration, sudden stalling at idle, and failure to start.",
    troubleshooting: [
      "Remove the spark plug cap and check for water ingress, moisture, or loose fit.",
      "Unscrew the spark plug using a plug wrench and inspect the electrode color (ideal is light tan/gray; black indicates carbon fouling; wet indicates flooding).",
      "Clean electrode with fine sandpaper or replace with a fresh NGK/Bosch plug matching manufacturer heat rating.",
      "Check spark strength by grounding plug threads against cylinder head while briefly cranking (look for crisp blue spark)."
    ],
    mechanicAdvice: "If spark is weak (yellow/orange) or absent despite a new plug, have the ignition coil, CDI/TCI module, and stator coil tested."
  },
  {
    id: "RULE_04",
    fault: "Engine Overheating & Insufficient Lubrication",
    category: "Engine & Cooling",
    severity: "High",
    symptoms: ["engine_overheating", "engine_unusual_noises", "poor_acceleration"],
    minRequired: 2,
    ruleConditionText: "IF 'Engine overheating' AND ('Engine unusual noises' OR 'Poor acceleration')",
    explanation: "Extreme thermal buildup is occurring, most commonly caused by critically low or degraded engine oil, blocked cylinder cooling fins (or radiator coolant loss in liquid-cooled bikes). Metal expansion leads to friction knock and rapid power loss.",
    troubleshooting: [
      "Immediately turn off the engine and allow it to cool down completely for at least 30 minutes.",
      "Check engine oil dipstick / sight glass on level ground. Top up with recommended 4T oil grade if below MIN line.",
      "Inspect engine exterior for oil leaks around head gaskets, drain bolt, or oil filter.",
      "On liquid-cooled two-wheelers, check coolant level in the expansion reservoir and inspect radiator fan operation."
    ],
    mechanicAdvice: "Do NOT continue riding with an overheating engine; continuing to operate will cause severe piston seizure, cylinder scoring, and expensive rebuilds."
  },
  {
    id: "RULE_05",
    fault: "Clogged Air Filter or Carburetor / Injector Clog",
    category: "Fuel & Induction",
    severity: "Medium",
    symptoms: ["low_mileage", "poor_acceleration", "engine_stopping_frequently"],
    minRequired: 2,
    ruleConditionText: "IF 'Poor acceleration' AND ('Low mileage' OR 'Engine stopping frequently')",
    explanation: "Choked airflow or restricted fuel delivery disrupts the stoichiometric air-fuel ratio. A starved or overly rich mixture causes bogging down when rolling on the throttle, excessive fuel consumption, and stalling at idle.",
    troubleshooting: [
      "Open the air box and inspect the air filter element. Clean foam filters or replace paper cartridge if black/dusty.",
      "Ensure the choke lever is fully disengaged and not stuck partially closed.",
      "Inspect the rubber intake manifold boot for air leak cracks between carburetor/throttle body and cylinder head.",
      "Add a bottle of motorcycle fuel injector/carburetor cleaner to the fuel tank."
    ],
    mechanicAdvice: "If symptoms persist, have the carburetor jets ultrasonically cleaned and tuned, or clean the fuel injector nozzle."
  },
  {
    id: "RULE_06",
    fault: "Faulty Charging System (Stator / RR Unit)",
    category: "Electrical System",
    severity: "High",
    symptoms: ["battery_draining_quickly", "headlight_not_working"],
    minRequired: 1,
    ruleConditionText: "IF 'Battery draining quickly' AND 'Headlight not working'",
    explanation: "The AC generator (stator) or the Regulator-Rectifier (RR unit) is failing to generate and regulate 14.0V–14.5V DC needed to charge the battery while the engine runs, running the electrical system dry on battery power until dead.",
    troubleshooting: [
      "Check AC voltage output from stator coil leads using a digital multimeter while engine is idling.",
      "Inspect the Regulator/Rectifier (RR unit) wiring connector for burnt pins, melted plastic, or loose terminals.",
      "Measure battery voltage while revving to ~4000 RPM (voltage should rise to between 13.8V and 14.8V; if under 12.8V, charging system is dead)."
    ],
    mechanicAdvice: "A burnt stator coil or fried rectifier regulator requires immediate component replacement by an auto electrician."
  },
  {
    id: "RULE_07",
    fault: "Blown Main Fuse or Severed Wiring Harness Ground",
    category: "Electrical System",
    severity: "Medium",
    symptoms: ["headlight_not_working", "horn_not_working", "self_start_not_working"],
    minRequired: 2,
    ruleConditionText: "IF ('Headlight not working' AND 'Horn not working') OR ('Self-start not working' AND 'Horn not working')",
    explanation: "Total failure of multiple independent electrical consumers (lights, horn, starter relay) points directly to a blown primary blade fuse or an open chassis ground connection.",
    troubleshooting: [
      "Locate the main fuse box (usually near the battery or side panel).",
      "Pull out the 10A / 15A / 20A fuses and visually inspect the internal metal link for a break or burn mark.",
      "Replace any blown fuse with a spare fuse of identical amperage rating (never bridge with bare wire).",
      "Check negative (-) battery lead terminal grounding firmly to the metal chassis frame."
    ],
    mechanicAdvice: "If a newly installed fuse blows immediately again, a direct short circuit exists in the handlebar wiring loom requiring circuit tracing."
  },
  {
    id: "RULE_08",
    fault: "Loose Drive Chain, Worn Sprocket, or Bad Engine Mounts",
    category: "Chassis & Transmission",
    severity: "Low",
    symptoms: ["excessive_vibration", "poor_acceleration"],
    minRequired: 2,
    ruleConditionText: "IF 'Excessive vibration' AND 'Poor acceleration'",
    explanation: "Excess slack in the drive chain creates whipping vibrations and delays mechanical power transfer to the rear wheel. Alternatively, deteriorated rubber engine mounting bolts transfer raw piston harmonics directly to the chassis.",
    troubleshooting: [
      "Measure drive chain slack on the lower run midway between sprockets (normal free play is 25mm to 35mm).",
      "Inspect chain lubrication; clean with chain cleaner and apply high-viscosity motorcycle chain lube.",
      "Inspect rear sprocket teeth for hooking, sharp needle-like edges, or broken teeth.",
      "Verify engine mount bolts and swingarm pivot nut are torqued to manufacturer specification."
    ],
    mechanicAdvice: "If the chain has reached the maximum adjustment marks or has tight spots (uneven stretch), replace both sprockets and the chain as a set."
  },
  {
    id: "RULE_09",
    fault: "Internal Engine Mechanical Wear (Valves / Piston Rings)",
    category: "Engine Mechanical",
    severity: "High",
    symptoms: ["engine_unusual_noises", "excessive_vibration", "engine_overheating"],
    minRequired: 2,
    ruleConditionText: "IF 'Engine unusual noises' AND ('Excessive vibration' OR 'Engine overheating')",
    explanation: "Audible metallic ticking or rhythmic rattling often stems from loose valve clearance (tappets), worn cam timing chain tensioner, or excessive clearance between piston skirt and cylinder wall.",
    troubleshooting: [
      "Determine noise location with a mechanical stethoscope (top cylinder head = valve train / tappets; bottom end = crank bearing / clutch).",
      "Inspect automatic cam chain tensioner for proper spring tension and adjustment.",
      "Ensure engine oil level is full; thin or low oil amplifies valve train clatter.",
      "Perform a cylinder compression test (healthy 4-stroke engine should read 130–170 PSI)."
    ],
    mechanicAdvice: "Have a technician check and adjust tappet valve clearances using feeler gauges, or service the timing chain tensioner assembly."
  },
  {
    id: "RULE_10",
    fault: "Fuel Line Contamination or Clogged Fuel Petcock/Filter",
    category: "Fuel System",
    severity: "Medium",
    symptoms: ["bike_wont_start", "engine_stopping_frequently"],
    minRequired: 2,
    ruleConditionText: "IF 'Bike won't start' AND 'Engine stopping frequently'",
    explanation: "Water contamination, rust sediment from the fuel tank, or a clogged in-line fuel filter chokes fuel gravity flow to the float chamber, causing intermittent starvation and eventual failure to start.",
    troubleshooting: [
      "Check fuel tank level; switch fuel petcock valve to 'RESERVE' or 'ON' position (verify valve isn't set to 'OFF').",
      "Inspect fuel line hose for kinking, hardening, or pinch points under the fuel tank.",
      "Drain the carburetor float bowl into a clean glass container using the drain screw to inspect for water droplets or rust flakes.",
      "Inspect the fuel cap breather hole to ensure vacuum lock is not preventing fuel from flowing down."
    ],
    mechanicAdvice: "If sediment or water is found, the fuel tank must be drained, flushed, and the internal petcock strainer cleaned or replaced."
  },
  {
    id: "RULE_11",
    fault: "Faulty Handlebar Switchgear or Neutral / Clutch Safety Switch",
    category: "Electrical & Starting",
    severity: "Low",
    symptoms: ["self_start_not_working", "bike_wont_start"],
    minRequired: 2,
    ruleConditionText: "IF 'Self-start not working' AND 'Bike won't start' (with no starter click)",
    explanation: "Modern two-wheelers feature safety interlocks (engine kill switch, clutch lever switch, side-stand sensor, and neutral switch). A stuck switch prevents the starter relay circuit from completing.",
    troubleshooting: [
      "Confirm the red handlebar Engine Kill Switch is in the 'RUN' position.",
      "Ensure the bike is in true Neutral (green 'N' light lit) or pull in the clutch lever completely while pressing start.",
      "Check if the side stand is fully retracted (bikes equipped with side-stand kill sensors disable ignition).",
      "Spray contact cleaner into the starter push-button assembly and exercise the button several times."
    ],
    mechanicAdvice: "If safety switches have failed internally, replace the clutch perch sensor or side-stand kill switch."
  },
  {
    id: "RULE_12",
    fault: "Horn Assembly or Horn Contact Switch Malfunction",
    category: "Electrical System",
    severity: "Low",
    symptoms: ["horn_not_working"],
    minRequired: 1,
    ruleConditionText: "IF 'Horn not working'",
    explanation: "The electromagnetic horn diaphragm is seized, the handlebar horn contact switch is corroded with road dust/rainwater, or the horn tuning screw is misadjusted.",
    troubleshooting: [
      "Turn the ignition key on and press the horn button; listen for a faint click from the horn unit.",
      "Check the 2 wire spade connectors on the back of the horn under the front cowl; clean off corrosion.",
      "Turn the tuning screw on the back of the horn unit 1/4 turn clockwise or counterclockwise with a screwdriver while pressing the button.",
      "Test horn directly with two jumper wires connected straight to 12V battery terminals."
    ],
    mechanicAdvice: "If the horn does not sound when wired directly to 12V, the electromagnetic coil has burnt and the horn unit must be replaced."
  }
];

// Export for usage in browser scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYMPTOM_CATEGORIES, EXPERT_RULES };
}
