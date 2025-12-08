// src/planGenerator.js

export const TEST_MODE = true;

// --- Outcome measure mapping (TAC-style, simplified) ---

const outcomeMeasureLibrary = {
  upperLimb: [
    { id: "quickdash", name: "QuickDASH – Upper Limb Disability" },
    { id: "spadi", name: "SPADI – Shoulder Pain and Disability Index" },
  ],
  lowerLimb: [
    { id: "lefs", name: "LEFS – Lower Extremity Functional Scale" },
  ],
  lumbarSpine: [
    { id: "qbpds", name: "Québec Back Pain Disability Scale (QBPDS)" },
  ],
  cervicalSpine: [
    { id: "ndi", name: "Neck Disability Index (NDI)" },
  ],
  generalMSK: [
    { id: "psfs", name: "PSFS – Patient-Specific Functional Scale" },
  ],
};

// Infer a region from condition text
function inferBodyRegion(primaryCondition) {
  const text = (primaryCondition || "").toLowerCase();

  if (text.match(/shoulder|elbow|wrist|hand|arm|upper limb/)) return "upperLimb";
  if (text.match(/hip|knee|ankle|foot|leg|lower limb/)) return "lowerLimb";
  if (text.match(/low back|lumbar|thoracic|back/)) return "lumbarSpine";
  if (text.match(/neck|cervical|whiplash|headache/)) return "cervicalSpine";

  return "generalMSK";
}

export function getOutcomeMeasuresForCondition(primaryCondition) {
  const region = inferBodyRegion(primaryCondition);
  return outcomeMeasureLibrary[region] || outcomeMeasureLibrary.generalMSK;
}

// Helper for a simple review timeline based on phase
function getReviewTimeline(phase) {
  switch (phase) {
    case "acute":
      return "Review in 3–5 days";
    case "subacute":
      return "Review in 7–10 days";
    case "chronic":
      return "Review in 10–14 days";
    case "return-to-sport":
      return "Review in 14–21 days or around key load tests";
    default:
      return "Review in 10–14 days";
  }
}

// Test-mode rule-based plan generator
export function generatePlan(patient) {
  if (!TEST_MODE) {
    // Placeholder for future LLM / API-based generation
    return { plan: null, logs: [] };
  }

  const region = inferBodyRegion(patient.primaryCondition);
  const phase = patient.phase || "subacute";
  const severity = patient.severity || "moderate";
  const outcomeMeasures = getOutcomeMeasuresForCondition(
    patient.primaryCondition
  );

  const name = patient.name || "this patient";

  // --- Summary (rough heuristic based on region/phase) ---

  let summary = "";
  const goals = [];
  const weeklyStructure = [];
  const keyExercises = [];
  const cautions = [];

  if (region === "lowerLimb") {
    summary = `Lower limb load-progressive rehab focused on improving knee/hip tolerance, maintaining global conditioning, and gradually reintroducing impact for ${name}.`;

    goals.push(
      "Reduce irritability of the symptomatic joint while maintaining capacity in surrounding tissues.",
      "Build strength and control in hip and knee through targeted, progressive exercises.",
      "Reintroduce impact/plyometric loading in a structured, graded manner aligned with sport demands."
    );

    weeklyStructure.push(
      "3–4 strength sessions focusing on hip/knee, spaced across the week.",
      "2–3 low-impact conditioning sessions (bike/rower/elliptical) as tolerated.",
      "1–2 graded impact/landing sessions depending on symptoms and stage."
    );

    keyExercises.push(
      {
        name: "Split squat or rear-foot elevated split squat",
        frequency: "2–3 sets of 6–10 reps, 2–3× per week",
        cues: "Slow, controlled descent, knee tracking over mid-foot, maintain even weight through front foot.",
      },
      {
        name: "Hip hinge pattern (deadlift / RDL variation)",
        frequency: "2–3 sets of 6–10 reps, 2× per week",
        cues: "Neutral spine, push hips back, keep load close, distribute weight evenly.",
      },
      {
        name: "Isometric wall sit or mid-range isometrics",
        frequency: "3–5 sets of 20–45 seconds, 3–4× per week (as tolerated)",
        cues: "Use as a symptom-modifying strategy and load primer.",
      }
    );

    cautions.push(
      "Monitor 24-hour symptom response after new or heavier load.",
      "Keep pain during sessions ≤ 3–4/10 and ensure it settles to baseline by the next day.",
      "Avoid large sudden spikes in running/impact volume; adjust no more than ~10–20% per week."
    );
  } else if (region === "upperLimb") {
    summary = `Upper limb rehab plan focusing on shoulder strength, control, and graded overhead exposure for ${name}.`;

    goals.push(
      "Restore pain-limited range of motion in the shoulder/upper limb.",
      "Improve cuff and scapular strength/endurance in positions relevant to sport.",
      "Gradually reintroduce overhead/loaded positions with clear load guardrails."
    );

    weeklyStructure.push(
      "2–3 targeted shoulder strength sessions (cuff, scapular control).",
      "2 light technique-focused sessions if in overhead sport (e.g. PVC or light bar drills).",
      "Daily mobility/prep circuit to support training warm-ups."
    );

    keyExercises.push(
      {
        name: "Cuff external rotation (band or cable)",
        frequency: "2–3 sets of 10–15 reps, 3× per week",
        cues: "Elbow by side or supported, slow tempo, no shrugging.",
      },
      {
        name: "Scapular plane raise (light DB)",
        frequency: "2–3 sets of 8–12 reps, 2–3× per week",
        cues: "Thumbs up, slight forward angle, avoid shrugging into ears.",
      },
      {
        name: "Isometric holds in tolerable overhead position",
        frequency: "3–5 sets of 15–30 seconds, 2–3× per week",
        cues: "Use as bridge between pain-free ROM and loaded overhead work.",
      }
    );

    cautions.push(
      "Keep pain during rehab ≤ 3–4/10 and ensure it does not worsen overnight.",
      "Avoid repeated failure-lift sets overhead until tolerance improves.",
      "If night pain or true instability appears, reassess and consider imaging/medical review."
    );
  } else if (region === "lumbarSpine") {
    summary = `Lumbar spine rehab plan aimed at improving tolerance to daily tasks and sport-specific loading for ${name}.`;

    goals.push(
      "Reduce episode frequency and intensity of low back pain.",
      "Improve trunk endurance and hip strength to support spine loading.",
      "Gradually reintroduce sport-specific movements (e.g. deadlifts, squats) with controlled exposure."
    );

    weeklyStructure.push(
      "2–3 trunk endurance sessions (anti-flexion/extension/rotation work).",
      "2–3 hip strength sessions (hinge/squat pattern).",
      "Daily movement breaks to reduce prolonged static postures."
    );

    keyExercises.push(
      {
        name: "Hip hinge pattern (e.g. RDL with dowel/barbell)",
        frequency: "2–3 sets of 6–10 reps, 2–3× per week",
        cues: "Neutral spine, hinge from hips, gradual load progression.",
      },
      {
        name: "Side plank progression",
        frequency: "3 sets of 15–30 seconds each side, 3× per week",
        cues: "Ear–shoulder–hip in line, avoid sagging.",
      },
      {
        name: "Bird-dog or dead bug variations",
        frequency: "2–3 sets of 6–10 controlled reps, 3× per week",
        cues: "Move slowly, maintain neutral spine, controlled breathing.",
      }
    );

    cautions.push(
      "Avoid repeated loaded flexion to fatigue early in rehab if highly provocative.",
      "Monitor symptom response over 24 hours after heavier days.",
      "If progressive neurological signs develop, seek medical review."
    );
  } else {
    // General MSK fallback
    summary = `General load-progressive rehab plan prioritising strength, movement confidence, and symptom-guided progression for ${name}.`;

    goals.push(
      "Reduce pain irritability while maintaining overall conditioning.",
      "Build strength and control in key local and regional muscles.",
      "Support a graded return to meaningful activities and sport."
    );

    weeklyStructure.push(
      "2–3 targeted strength sessions based on region and goals.",
      "2–3 conditioning sessions adjusted to symptom tolerance.",
      "Daily low-level movement or mobility as tolerated."
    );

    keyExercises.push(
      {
        name: "Region-specific strength exercise (primary driver)",
        frequency: "2–3 sets of 6–10 reps, 2–3× per week",
        cues: "Prioritise good technique and symptom monitoring.",
      },
      {
        name: "Global conditioning (bike, walk, row, or similar)",
        frequency: "20–30 minutes, 2–3× per week, RPE 5–7/10",
        cues: "Keep it ‘comfortably hard’ without provoking a flare.",
      }
    );

    cautions.push(
      "Use symptoms as a guide – short-term mild pain increase may be acceptable if it settles within 24 hours.",
      "Avoid big spikes in activity volume from one week to the next.",
      "Check in with your practitioner if you notice new or worrying symptoms."
    );
  }

  // Adjust goals a bit for phase/severity (just flavour text)
  if (phase === "acute") {
    goals.unshift(
      "Calm irritability, protect from further aggravation, and keep as active as safely possible."
    );
  } else if (phase === "return-to-sport") {
    goals.unshift(
      "Rebuild sport-specific confidence and robustness with targeted load tests and return-to-play criteria."
    );
  }

  if (severity === "severe") {
    cautions.unshift(
      "Prioritise pain calming and tissue protection early; spacing sessions may be necessary."
    );
  }

  const plan = {
    summary,
    goals,
    weeklyStructure,
    keyExercises,
    cautions,
    reviewTimeline: getReviewTimeline(phase),
    outcomeMeasures,
  };

  const logs = [
    {
      id: `log-plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      type: "system",
      message:
        "Test-mode rule-based plan generated, including region-specific outcome measures.",
    },
  ];

  return { plan, logs };
}
