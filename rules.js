/**
 * MotoMind – Knowledge Base & Expert Rules
 * ============================================================
 * This file contains TWO things the inference engine needs:
 *
 *  1. SYMPTOM_CATEGORIES  – the master list of all observable
 *     symptoms a user can report, grouped by category.
 *
 *  2. EXPERT_RULES – the predefined fault rules.
 *     Each rule encodes the expert's IF-THEN knowledge:
 *       IF certain symptoms are present THEN this fault is likely.
 *
 *  3. CONSULTATION_QUESTIONS – follow-up questions the system
 *     asks to narrow down ambiguous diagnoses (consultation mode).
 *
 * HOW THE RULE ENGINE WORKS (Forward Chaining):
 *  - User selects symptoms → becomes the "Working Memory".
 *  - Each rule is evaluated: how many of its symptom list match
 *    the working memory?
 *  - Rules meeting minRequired threshold are fired.
 *  - Confidence % = matched / total symptoms in rule × 100.
 *  - Results are ranked highest confidence first.
 * ============================================================
 */

/* ──────────────────────────────────────────────────────────
   SECTION 1 · SYMPTOM CATEGORIES (12 symptoms, 4 categories)
   ────────────────────────────────────────────────────────── */
const SYMPTOM_CATEGORIES = [
  {
    id: "starting",
    name: "Starting Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    symptoms: [
      {
        id: "bike_wont_start",
        label: "Bike won't start",
        desc: "Engine does not crank or refuses to fire up at all, even after multiple attempts."
      },
      {
        id: "self_start_not_working",
        label: "Self-start not working",
        desc: "Pressing the electric starter button produces no rotation or response from the starter motor."
      },
      {
        id: "clicking_sound_starting",
        label: "Clicking sound when starting",
        desc: "A rapid clicking or relay-ticking noise is heard from under the seat or near the battery when pressing start."
      }
    ]
  },
  {
    id: "engine",
    name: "Engine Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
    symptoms: [
      {
        id: "engine_overheating",
        label: "Engine overheating",
        desc: "Engine block becomes abnormally hot, emits burning smell, or the temperature warning indicator is active."
      },
      {
        id: "engine_unusual_noises",
        label: "Engine making unusual noises",
        desc: "Metallic knocking, rhythmic tapping, rattling, or grinding sounds while the engine is running."
      },
      {
        id: "engine_stopping_frequently",
        label: "Engine stopping frequently",
        desc: "Engine stalls suddenly and repeatedly at idle, traffic signals, or when decelerating."
      }
    ]
  },
  {
    id: "performance",
    name: "Performance Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-4.2 4.2"/><circle cx="12" cy="12" r="2"/></svg>`,
    symptoms: [
      {
        id: "low_mileage",
        label: "Low mileage / poor fuel economy",
        desc: "Fuel tank drains much faster than normal; unexpected drop in km-per-litre figures."
      },
      {
        id: "poor_acceleration",
        label: "Poor acceleration",
        desc: "Bike feels sluggish, hesitates, or struggles to pick up speed despite full throttle input."
      },
      {
        id: "excessive_vibration",
        label: "Excessive vibration",
        desc: "Intense shaking or buzzing felt on handlebars, footpegs, or the seat at riding or idle speeds."
      }
    ]
  },
  {
    id: "electrical",
    name: "Electrical Problems",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    symptoms: [
      {
        id: "headlight_not_working",
        label: "Headlight not working",
        desc: "Headlamp does not turn on, flickers heavily, or glows extremely dim even at high RPM."
      },
      {
        id: "battery_draining_quickly",
        label: "Battery draining quickly",
        desc: "Battery loses charge within hours or overnight without use, or dies during a short ride."
      },
      {
        id: "horn_not_working",
        label: "Horn not working",
        desc: "Horn produces no sound, only a faint squeak, or is completely silent when the button is pressed."
      }
    ]
  }
];

/* ──────────────────────────────────────────────────────────
   SECTION 2 · EXPERT FAULT RULES (Knowledge Base)
   ──────────────────────────────────────────────────────────
   Rule fields:
   · id              – unique rule code (e.g. RULE_01)
   · fault           – name of the diagnosed fault
   · category        – mechanical subsystem
   · severity        – "High" | "Medium" | "Low"
   · symptoms        – ALL symptom IDs relevant to this fault
   · primarySymptoms – subset that are strong indicators
   · minRequired     – minimum matches needed to fire the rule
   · ruleConditionText – human-readable IF-THEN formula
   · causes          – list of possible root causes
   · explanation     – expert explanation of why this fault occurs
   · troubleshooting – ordered steps to inspect & fix
   · mechanicAdvice  – when to seek professional help
   ────────────────────────────────────────────────────────── */
const EXPERT_RULES = [
  /* ── RULE 01: Dead / Weak Battery ── */
  {
    id: "RULE_01",
    fault: "Discharged or Dead Battery",
    category: "Electrical & Starting",
    severity: "Medium",
    symptoms: [
      "bike_wont_start",
      "clicking_sound_starting",
      "headlight_not_working",
      "battery_draining_quickly",
      "self_start_not_working"
    ],
    primarySymptoms: ["clicking_sound_starting", "battery_draining_quickly"],
    minRequired: 2,
    ruleConditionText:
      "IF ('Clicking sound when starting' OR 'Battery draining quickly') AND ('Bike won't start' OR 'Self-start not working' OR 'Headlight not working')",
    causes: [
      "Battery fully discharged due to lights or accessories left on",
      "Old battery past its service life (3–4 years) with low CCA",
      "Faulty rectifier/regulator not recharging the battery while riding",
      "Parasitic electrical drain from a short circuit or accessories"
    ],
    explanation:
      "The starter relay energises and clicks, but the battery terminal voltage is too low to deliver the Cold Cranking Amperes (CCA) needed to rotate the starter motor. Dim headlights and rapid relay clicking are classic signs of an undercharged or failed battery.",
    troubleshooting: [
      "Measure battery voltage with a multimeter: a healthy 12V battery reads 12.6 V+ at rest. Below 12.0 V indicates deep discharge.",
      "Inspect battery terminals for white or green sulfate corrosion; clean with a wire brush and tighten the bolts.",
      "Try kick-starting the bike (if equipped) to bypass the electrical starter system.",
      "Connect a smart trickle charger and charge for 6–8 hours, then retest the voltage.",
      "While the engine is running at ~3,500 RPM, re-measure battery voltage. It should read 13.8–14.5 V. Lower values indicate a faulty rectifier/regulator."
    ],
    mechanicAdvice:
      "If the battery will not hold charge above 12.4 V after a full charge cycle, or is older than 3 years, replace it. If the charging voltage is abnormal, have the rectifier/regulator tested."
  },

  /* ── RULE 02: Starter Relay / Motor Fault ── */
  {
    id: "RULE_02",
    fault: "Defective Starter Relay or Starter Motor",
    category: "Starting System",
    severity: "Medium",
    symptoms: [
      "self_start_not_working",
      "clicking_sound_starting",
      "bike_wont_start"
    ],
    primarySymptoms: ["self_start_not_working", "clicking_sound_starting"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Self-start not working' AND 'Clicking sound when starting' (with other electrics working normally)",
    causes: [
      "Starter solenoid contacts pitted or burnt from repeated arcing",
      "Starter motor carbon brushes worn down below minimum thickness",
      "Corroded heavy-gauge wiring between relay and starter motor",
      "Faulty starter relay coil not closing the high-current contacts"
    ],
    explanation:
      "When other electrical accessories (lights, horn) work normally but the self-start is dead and you hear a click, the solenoid is energising but cannot pass high current to the motor. Carbon brushes or solenoid contacts are the usual culprits.",
    troubleshooting: [
      "Check the starter motor fuse in the main fuse box; replace if blown.",
      "While pressing the start button, tap the starter motor casing gently with a rubber mallet — worn brushes sometimes un-stick temporarily.",
      "Use a jumper wire to briefly bridge the two large terminals of the starter relay; if the motor spins, the relay is faulty.",
      "Inspect the heavy-gauge cable from the relay to the starter motor for loose bolts or corrosion."
    ],
    mechanicAdvice:
      "Have the starter motor dismantled to inspect and replace carbon brushes, or replace the entire starter relay unit if the coil resistance is out of spec."
  },

  /* ── RULE 03: Fouled Spark Plug / Weak Ignition ── */
  {
    id: "RULE_03",
    fault: "Fouled Spark Plug or Weak Ignition",
    category: "Ignition System",
    severity: "Medium",
    symptoms: [
      "bike_wont_start",
      "engine_stopping_frequently",
      "poor_acceleration",
      "low_mileage"
    ],
    primarySymptoms: ["bike_wont_start", "engine_stopping_frequently"],
    minRequired: 2,
    ruleConditionText:
      "IF ('Bike won't start' OR 'Engine stopping frequently') AND ('Poor acceleration' OR 'Low mileage')",
    causes: [
      "Spark plug electrode coated with black carbon or oil deposits",
      "Electrode gap too wide or too narrow from wear",
      "Faulty ignition coil producing a weak or intermittent spark",
      "Worn or cracked spark plug cap (HT lead) causing spark loss"
    ],
    explanation:
      "A contaminated or worn spark plug cannot produce a consistent, hot spark needed for reliable combustion. This leads to misfires at idle, poor throttle response, and eventual failure to start.",
    troubleshooting: [
      "Remove the spark plug cap and unscrew the plug using a plug socket wrench.",
      "Inspect the electrode: light tan/gray = healthy; dry black = carbon fouling; wet black = oil contamination; white/melted = overheating.",
      "Measure the electrode gap with a feeler gauge (standard 0.6–0.8 mm; check your owner's manual).",
      "Ground the plug's threaded body against the engine case and crank — look for a crisp, bright blue spark. Yellow or absent = replace immediately.",
      "Replace with the correct heat-range plug (NGK / Bosch as specified in the owner's manual)."
    ],
    mechanicAdvice:
      "If a new plug doesn't fix the issue, have the ignition coil primary/secondary resistance checked, and inspect the CDI or TCI ignition module."
  },

  /* ── RULE 04: Carburettor / Fuel Delivery Fault ── */
  {
    id: "RULE_04",
    fault: "Clogged Carburettor or Fuel Delivery Problem",
    category: "Fuel System",
    severity: "Medium",
    symptoms: [
      "engine_stopping_frequently",
      "poor_acceleration",
      "low_mileage",
      "bike_wont_start"
    ],
    primarySymptoms: ["poor_acceleration", "engine_stopping_frequently"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Poor acceleration' AND ('Engine stopping frequently' OR 'Low mileage' OR 'Bike won't start')",
    causes: [
      "Pilot jet or main jet clogged with varnish from stale fuel",
      "Clogged inline fuel filter blocking adequate fuel flow",
      "Stuck or worn carburettor float causing incorrect fuel level",
      "Blocked air filter creating an overly rich mixture",
      "Kinked or hardened fuel hose restricting flow"
    ],
    explanation:
      "A restricted fuel or air supply creates an incorrect air-fuel mixture for the combustion cycle. A clogged pilot jet causes idle/low-speed issues; a clogged main jet affects mid-to-high throttle. Rich running burns fuel faster and produces black smoke.",
    troubleshooting: [
      "Check the fuel petcock/valve: ensure it is set to 'ON' or 'RESERVE', not 'OFF' or 'PRI'.",
      "Inspect the in-line fuel filter between the tank and carb; replace if visibly dirty or clogged.",
      "Remove the carburettor float bowl and spray compressed carb cleaner through each jet hole. Light should be visible through the orifice.",
      "Remove and clean the air filter: foam filters can be washed and re-oiled; paper filters should be blown out or replaced.",
      "Check the vacuum slide diaphragm inside CV carburettors for tears or pinholes that prevent throttle slide lift."
    ],
    mechanicAdvice:
      "A full carburettor rebuild kit (jets, needle, gaskets, O-rings) costs very little and is worthwhile if the bike has sat unused for several months."
  },

  /* ── RULE 05: Engine Overheating ── */
  {
    id: "RULE_05",
    fault: "Engine Overheating",
    category: "Cooling & Lubrication",
    severity: "High",
    symptoms: [
      "engine_overheating",
      "poor_acceleration",
      "engine_stopping_frequently",
      "engine_unusual_noises"
    ],
    primarySymptoms: ["engine_overheating"],
    minRequired: 1,
    ruleConditionText:
      "IF 'Engine overheating' AND ('Poor acceleration' OR 'Engine stopping frequently' OR 'Engine unusual noises')",
    causes: [
      "Engine oil level critically low, causing boundary friction",
      "Degraded or wrong-grade engine oil losing viscosity",
      "Blocked cooling fins caked with mud on air-cooled engines",
      "Radiator coolant low or fan failure on liquid-cooled engines",
      "Excessive high-RPM riding in traffic without adequate airflow"
    ],
    explanation:
      "Thermal runaway occurs when heat generated by combustion and friction cannot be dissipated fast enough. Without adequate lubrication or cooling, metal parts expand, clearances reduce, and the engine can seize. This is a HIGH-severity issue — stop riding immediately.",
    troubleshooting: [
      "STOP THE ENGINE IMMEDIATELY and let it cool for at least 20–30 minutes before touching any components.",
      "Check engine oil level on the dipstick or sight glass; refill with the correct grade (commonly 10W-30 or 20W-50 4T) if below the minimum mark.",
      "Inspect the oil condition: milky white colour = coolant contamination; jet black sludge = severely degraded oil.",
      "For air-cooled engines: clean the cylinder head cooling fins of mud, plastic bags, or debris blocking airflow.",
      "For liquid-cooled engines: check coolant reservoir level and inspect the radiator fan for operation."
    ],
    mechanicAdvice:
      "Do not ride until the root cause of overheating is resolved. Continued riding risks piston seizure, warped cylinder head, or blown head gasket — all requiring expensive engine rebuilds."
  },

  /* ── RULE 06: Regulator/Rectifier or Charging Fault ── */
  {
    id: "RULE_06",
    fault: "Faulty Regulator/Rectifier or Charging Circuit",
    category: "Electrical Charging System",
    severity: "Medium",
    symptoms: [
      "battery_draining_quickly",
      "headlight_not_working",
      "horn_not_working",
      "bike_wont_start"
    ],
    primarySymptoms: ["battery_draining_quickly", "headlight_not_working"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Battery draining quickly' AND ('Headlight not working' OR 'Horn not working' OR 'Bike won't start')",
    causes: [
      "Regulator/rectifier (RR unit) failed — not converting AC stator output to DC",
      "Stator coil windings shorted or open, producing no AC charge",
      "Main charging fuse blown, breaking the charge circuit",
      "Corroded or loose charging wire connections at the stator or battery"
    ],
    explanation:
      "The alternator (stator) generates AC current which the rectifier converts to DC to charge the battery. If the RR unit fails, the battery slowly drains while riding. Multiple electrical accessories failing simultaneously points to a system-wide power supply fault rather than individual component failures.",
    troubleshooting: [
      "With engine running at 3,500 RPM, measure voltage across battery terminals: 13.8–14.5 V is correct. Below = charging failure. Above 15 V = regulator failure (overcharging).",
      "Check all fuses in the fuse box — especially the main fuse (15–30 A) and the charging circuit fuse.",
      "Locate the RR unit (usually mounted near the battery with a multi-pin connector) and check for burnt discolouration or melted plastic.",
      "Measure the stator coil AC output with a multimeter in AC mode across the yellow wires at the RR connector (should be ~12–16 V AC at idle, rising with RPM)."
    ],
    mechanicAdvice:
      "An overcharging RR unit will boil and destroy the battery. Replace the RR unit as a priority if output exceeds 15.5 V."
  },

  /* ── RULE 07: Air Filter Choked / Rich Mixture ── */
  {
    id: "RULE_07",
    fault: "Choked Air Filter Causing Rich Fuel Mixture",
    category: "Air Intake System",
    severity: "Low",
    symptoms: [
      "low_mileage",
      "poor_acceleration",
      "engine_stopping_frequently"
    ],
    primarySymptoms: ["low_mileage", "poor_acceleration"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Low mileage' AND 'Poor acceleration' (without overheating or unusual noises)",
    causes: [
      "Air filter element saturated with dust, oil, or road grime",
      "Air filter box housing cracked, allowing unmetered dirty air bypass",
      "Choke valve stuck in partially-closed position"
    ],
    explanation:
      "A heavily clogged air filter restricts airflow into the combustion chamber. The carburettor continues injecting the same amount of fuel, creating a rich mixture (too much fuel, too little air). Rich running causes black exhaust smoke, poor throttle response, elevated fuel consumption, and gradual fouling of the spark plug.",
    troubleshooting: [
      "Open the air filter box by removing the cover (usually secured with clips or screws under the seat or side panel).",
      "Remove the filter element and hold it up to light — if no light passes through, it needs immediate replacement.",
      "Foam filters: wash in warm soapy water, rinse, dry fully, lightly re-oil with air filter oil before reinstalling.",
      "Paper/pleated filters: tap gently to dislodge loose dust, then blow compressed air from inside-out. Replace if heavily soiled.",
      "Inspect the manual choke lever or cable: the choke plate should return to fully-open position when released."
    ],
    mechanicAdvice:
      "Replace the air filter element every 10,000–15,000 km or annually, whichever comes first. Use only OEM-grade or equivalent quality filters."
  },

  /* ── RULE 08: Worn Clutch Plates ── */
  {
    id: "RULE_08",
    fault: "Slipping Clutch (Worn Friction Plates)",
    category: "Transmission & Clutch",
    severity: "Medium",
    symptoms: [
      "poor_acceleration",
      "low_mileage",
      "engine_overheating"
    ],
    primarySymptoms: ["poor_acceleration"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Poor acceleration' AND ('Low mileage' OR 'Engine overheating') — engine revs rise but speed does not follow",
    causes: [
      "Clutch friction plate linings worn beyond service limit",
      "Clutch plates glazed or oil-contaminated, reducing grip",
      "Clutch spring pressure springs weakened with fatigue",
      "Incorrect clutch lever cable adjustment (too little free play)"
    ],
    explanation:
      "When clutch friction plates are worn or glazed, the clutch cannot transmit full engine torque to the transmission. Engine RPM rises when you open the throttle, but actual wheel speed does not follow proportionally — a classic 'slipping clutch'. The slipping generates heat, contributing to overheating and increased fuel use.",
    troubleshooting: [
      "Clutch slip test: start in 2nd gear, hold front brake firmly, gradually release clutch — engine should stall immediately. If it stays running and wheels don't move, the clutch is slipping.",
      "Check clutch lever free play at the handlebar: should be 2–3 mm of slack before resistance begins. Adjust the cable adjuster at the lever perch.",
      "Drain the engine oil and inspect for a metallic burnt smell or visible friction material particles indicating plate wear.",
      "Remove the clutch cover and measure friction plate thickness with a vernier caliper; compare to the service limit in the manual."
    ],
    mechanicAdvice:
      "Replace the full clutch kit: friction discs, steel plates, and clutch springs together as a matched set. Reusing old springs with new discs leads to premature re-wear."
  },

  /* ── RULE 09: Drive Chain / Sprocket Wear ── */
  {
    id: "RULE_09",
    fault: "Worn or Loose Drive Chain and Sprockets",
    category: "Drivetrain",
    severity: "Medium",
    symptoms: [
      "excessive_vibration",
      "poor_acceleration",
      "engine_unusual_noises"
    ],
    primarySymptoms: ["excessive_vibration"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Excessive vibration' AND ('Poor acceleration' OR 'Engine unusual noises')",
    causes: [
      "Chain stretched beyond the adjustment range (maximum wear)",
      "Chain under-lubricated causing accelerated wear and noise",
      "Front or rear sprocket teeth hooked or worn to a sharp profile",
      "Chain with tight spots (uneven stretch) causing snatch and vibration"
    ],
    explanation:
      "A stretched chain transmits power unevenly, causing snatch, surging, and vibration during acceleration. Hooked sprocket teeth prevent smooth chain engagement and can cause dangerous chain derailment. Vibration worsens at specific speed ranges corresponding to chain frequency resonance.",
    troubleshooting: [
      "With the bike on its centre stand, check chain slack at the midpoint between sprockets: typically 20–30 mm vertical play (refer to owner's manual for exact spec).",
      "Inspect the chain for tight spots: slowly rotate the rear wheel while watching the chain run — any stiff link will appear as a kink.",
      "Inspect rear sprocket teeth profile from the side: healthy teeth are symmetrical and blunt; worn teeth resemble curved shark fins.",
      "Lubricate the chain with dedicated chain lubricant if it appears dry, rusty, or stiff.",
      "Adjust chain tension using the rear axle adjustment blocks, ensuring equal measurement on both sides."
    ],
    mechanicAdvice:
      "Chain, front sprocket, and rear sprocket wear together. Replace all three as a set for best results. Never fit a new chain on worn sprockets."
  },

  /* ── RULE 10: Valve Train / Internal Engine Noise ── */
  {
    id: "RULE_10",
    fault: "Valve Train Noise or Internal Engine Wear",
    category: "Engine Mechanical",
    severity: "High",
    symptoms: [
      "engine_unusual_noises",
      "excessive_vibration",
      "engine_overheating",
      "poor_acceleration"
    ],
    primarySymptoms: ["engine_unusual_noises", "excessive_vibration"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Engine unusual noises' AND ('Excessive vibration' OR 'Engine overheating' OR 'Poor acceleration')",
    causes: [
      "Valve tappet clearance too wide — causes rhythmic metallic ticking",
      "Cam chain (timing chain) tensioner worn or stuck, allowing chain slap",
      "Low engine oil allowing metal-to-metal contact",
      "Piston pin or small-end bearing worn excessively",
      "Main bearing or big-end bearing failure (deep rhythmic knocking)"
    ],
    explanation:
      "Top-end ticking that rises with RPM typically points to loose valve clearances (tappets) or cam chain slack. A deeper, rhythmic knock from the bottom of the engine suggests crank or con-rod bearing failure — a critical issue that must be addressed immediately to prevent engine seizure.",
    troubleshooting: [
      "Use a mechanic's stethoscope to locate noise precisely: top of cylinder head = valve train; side crankcase = cam chain; bottom = crank bearings.",
      "Check engine oil level immediately — noise is amplified when oil is low.",
      "Remove the cam chain tensioner inspection plug and manually check if it has adequate spring tension.",
      "Perform a compression test: each cylinder should read 130–170 PSI (± 10% between cylinders). Low compression indicates internal wear.",
      "Check tappet clearance at TDC using feeler gauges (typically 0.05–0.10 mm intake, 0.10–0.15 mm exhaust — verify in your manual)."
    ],
    mechanicAdvice:
      "Deep knocking from the lower engine is a critical failure indicator. Stop riding immediately — continued operation risks catastrophic engine seizure requiring a full engine rebuild."
  },

  /* ── RULE 11: Fuel Contamination / Petcock Blockage ── */
  {
    id: "RULE_11",
    fault: "Fuel Line Contamination or Blocked Petcock",
    category: "Fuel System",
    severity: "Medium",
    symptoms: [
      "bike_wont_start",
      "engine_stopping_frequently"
    ],
    primarySymptoms: ["bike_wont_start", "engine_stopping_frequently"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Bike won't start' AND 'Engine stopping frequently' (with spark and battery confirmed good)",
    causes: [
      "Water or rust sediment in the fuel tank blocking the petcock strainer",
      "Clogged in-line fuel filter starving the carburettor",
      "Fuel cap breather hole blocked, creating a vacuum lock in the tank",
      "Fuel hose kinked, collapsed, or hardened with age"
    ],
    explanation:
      "When the engine runs for a few minutes then dies and won't restart until it cools down or fuel is added, it usually indicates intermittent fuel starvation. Water contamination causes the engine to run rough and stall unpredictably. Opening the fuel cap and hearing a hiss of vacuum confirms a blocked breather.",
    troubleshooting: [
      "With the engine warm and stalled, open the fuel cap — if you hear a vacuum hiss, the cap breather is blocked. Clean the breather hole with a pin.",
      "Switch the fuel petcock to the RESERVE position and retry starting.",
      "Remove the fuel hose from the carburettor inlet and check if fuel flows freely when the tap is in the ON position.",
      "Drain the carburettor float bowl via the drain screw into a glass jar: check for water (droplets sinking to the bottom) or rust sediment.",
      "Inspect the in-line fuel filter between the tank and carburettor; replace if clogged or more than 2 years old."
    ],
    mechanicAdvice:
      "If sediment or water contamination is confirmed, the entire fuel tank must be drained, flushed with clean fuel, and the petcock strainer cleaned before refilling."
  },

  /* ── RULE 12: Safety Interlock Switch Fault ── */
  {
    id: "RULE_12",
    fault: "Safety Interlock Switch Fault (Kill / Clutch / Side-Stand)",
    category: "Electrical & Starting",
    severity: "Low",
    symptoms: [
      "self_start_not_working",
      "bike_wont_start"
    ],
    primarySymptoms: ["self_start_not_working", "bike_wont_start"],
    minRequired: 2,
    ruleConditionText:
      "IF 'Self-start not working' AND 'Bike won't start' (no click from relay, other electrics OK)",
    causes: [
      "Engine kill switch (handlebar) in OFF/RUN position confusion",
      "Clutch lever interlock switch not detecting lever pull",
      "Side-stand sensor stuck in deployed position, disabling ignition",
      "Neutral switch contacts corroded, incorrectly blocking start circuit"
    ],
    explanation:
      "Modern bikes have multiple safety interlocks that prevent starting unless: the kill switch is in RUN, the clutch is pulled in (or bike is in neutral), and the side stand is retracted. A single faulty switch in this chain prevents the starter relay from receiving a signal — so there is no click and no motor movement.",
    troubleshooting: [
      "Verify the red engine kill switch on the right handlebar is set to RUN (not OFF).",
      "Confirm the gear indicator shows 'N' (neutral) and the green neutral light is on, OR pull in the clutch lever fully while pressing start.",
      "Check the side stand is fully retracted — the safety sensor cuts ignition if the stand is deployed while in gear.",
      "Spray electrical contact cleaner (WD-40 or CRC) into the starter button, kill switch, and clutch switch, then work them several times.",
      "Temporarily bypass the clutch switch (short the two wires) to see if that is the blockage point."
    ],
    mechanicAdvice:
      "If bypassing a switch fixes the problem, replace that specific switch rather than leaving the bypass permanent, as these switches are important safety features."
  },

  /* ── RULE 13: Horn/Electrical Accessory Fault ── */
  {
    id: "RULE_13",
    fault: "Horn or Electrical Accessory Failure",
    category: "Electrical System",
    severity: "Low",
    symptoms: [
      "horn_not_working",
      "headlight_not_working"
    ],
    primarySymptoms: ["horn_not_working"],
    minRequired: 1,
    ruleConditionText:
      "IF 'Horn not working' (possibly with 'Headlight not working')",
    causes: [
      "Horn diaphragm coil burnt out from sustained pressing",
      "Horn contact switch corroded or water damaged",
      "Horn fuse blown (usually a 10 A accessory fuse)",
      "Loose or corroded spade connector terminals at the horn unit"
    ],
    explanation:
      "The horn uses a vibrating electromagnetic diaphragm to produce sound. The handlebar switch sends 12 V to the horn coil. Failure can occur at the switch, the fuse, the wiring, or the horn unit itself. Pressing the horn button and feeling no vibration through the horn body indicates an open circuit.",
    troubleshooting: [
      "Press horn and check if you feel any vibration through the horn body — faint buzz = coil trying to work (tune screw or connection issue); nothing = fuse/wiring fault.",
      "Locate and inspect the horn fuse in the fuse box (accessory or horn-specific fuse); replace if blown.",
      "Directly connect the horn's two terminals to a 12 V battery using jumper wires — if it sounds, the problem is in the switchgear/wiring, not the horn itself.",
      "Clean the two spade connector terminals on the back of the horn with sandpaper or contact cleaner.",
      "If the horn works when wired directly but not when installed: trace the handlebar button circuit for a broken or corroded wire."
    ],
    mechanicAdvice:
      "If the horn is silent even when fed directly from the battery, the coil is burnt and the horn unit must be replaced. Universal replacement horns are inexpensive."
  }
];

/* ──────────────────────────────────────────────────────────
   SECTION 3 · CONSULTATION QUESTIONS
   ──────────────────────────────────────────────────────────
   These follow-up questions are asked AFTER initial symptom
   selection to narrow down between competing diagnoses.
   Each question is linked to specific symptoms and helps
   distinguish between faults that share similar symptoms.
   ────────────────────────────────────────────────────────── */
const CONSULTATION_QUESTIONS = [
  {
    id: "Q01",
    triggeredBy: ["bike_wont_start", "clicking_sound_starting"],
    question: "When you press the start button, can you hear a clicking or ticking sound?",
    yesAdds: ["clicking_sound_starting"],
    noRemoves: ["clicking_sound_starting"],
    hint: "A click = relay energising. No sound at all = possible safety switch fault."
  },
  {
    id: "Q02",
    triggeredBy: ["bike_wont_start"],
    question: "Do the headlights and horn work normally?",
    yesAdds: [],          // electrics OK – narrows away from battery
    noRemoves: [],
    noAdds: ["headlight_not_working"],
    hint: "If other electrics fail too, the battery or charging circuit is suspect."
  },
  {
    id: "Q03",
    triggeredBy: ["poor_acceleration", "engine_stopping_frequently"],
    question: "Is there visible black smoke from the exhaust when accelerating?",
    yesAdds: ["low_mileage"],
    noAdds: [],
    hint: "Black smoke indicates a rich fuel mixture — often a clogged air filter or carb jet."
  },
  {
    id: "Q04",
    triggeredBy: ["engine_overheating"],
    question: "Is the engine oil level at or above the minimum mark on the dipstick?",
    yesAdds: [],
    noAdds: [],
    noHint: "Low oil is the most common cause of overheating. Top up immediately.",
    hint: "Low oil is a critical overheating trigger. Check before riding."
  },
  {
    id: "Q05",
    triggeredBy: ["poor_acceleration"],
    question: "When you open the throttle fully, do engine RPMs rise but the bike speed doesn't increase proportionally?",
    yesAdds: [],
    noAdds: [],
    yesHint: "This is the classic sign of a slipping clutch — RPM rises but power isn't transmitted.",
    hint: "RPM rising without matching speed = slipping clutch or chain/sprocket issue."
  },
  {
    id: "Q06",
    triggeredBy: ["excessive_vibration"],
    question: "Does the vibration increase with speed (e.g., mostly above 50 km/h)?",
    yesAdds: [],
    noAdds: [],
    yesHint: "Speed-dependent vibration often points to wheel balance, tyre pressure, or chain issues.",
    hint: "Speed-linked vibration differs from engine-idle vibration in likely cause."
  },
  {
    id: "Q07",
    triggeredBy: ["engine_unusual_noises"],
    question: "Is the noise coming from the top of the engine (cylinder head area)?",
    yesAdds: [],
    noAdds: [],
    yesHint: "Top-end ticking usually means valve (tappet) clearance adjustment needed.",
    noHint: "Bottom-end knocking is a more serious crank/bearing issue.",
    hint: "Location of engine noise reveals which internal component is affected."
  },
  {
    id: "Q08",
    triggeredBy: ["battery_draining_quickly"],
    question: "Does the battery drain even when the bike is NOT in use (overnight)?",
    yesAdds: [],
    noAdds: [],
    yesHint: "Overnight drain = parasitic draw. Something is drawing current with ignition off.",
    noHint: "Drain only while riding = charging system failure (rectifier/stator).",
    hint: "Whether the drain happens at rest or while riding points to different root causes."
  }
];

/* Export for Node.js environments (testing) */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SYMPTOM_CATEGORIES, EXPERT_RULES, CONSULTATION_QUESTIONS };
}
