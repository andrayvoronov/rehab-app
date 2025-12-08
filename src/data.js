// src/data.js

// XP thresholds for behaviour levels (not clinical stages)
export const xpLevelThresholds = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
};

// Base patients – no plan/xp/quests yet. Those are generated in App.jsx
export const initialPatients = [
  {
    id: "p-1",
    name: "Alex Runner",
    age: 32,
    primaryCondition: "Right knee patellofemoral pain",
    sport: "Recreational running / CrossFit",
    phase: "subacute",
    severity: "moderate",
    clinicalStage: "foundation",
    notes:
      "Desk-based job. Pain with stairs, box jumps, and running downhill. Better with cycling.",
    createdAt: "2025-01-01T08:00:00.000Z",
    caseHistory: {
      site: "Anterior right knee, around and behind the patella.",
      quality: "Dull ache at rest, sharper with stairs and squatting.",
      intensity: "3–4/10 baseline, up to 7/10 after heavy WODs.",
      duration: "On and off for ~3 months. Worse over the last 4 weeks.",
      symptoms:
        "Occasional clicking, morning stiffness <10 minutes, no locking or giving way.",
      cause:
        "Gradual onset after increasing running volume and box jumps in training.",
      aggravating: "Box jumps, running downhill, deep squats, prolonged sitting.",
      relieving: "Cycling, gentle movement, taping, short rest breaks.",
      nature:
        "Mechanical pattern. No night pain, no red flag features reported.",
      timing:
        "Worst after WODs and long workdays. Slight warm-up effect with light cycling.",
      advice:
        "Previous advice to rest fully for 2 weeks, which reduced pain but it returned on resuming training.",
      goals:
        "Return to 5km pain-free running and full CrossFit participation including box jumps.",
    },
  },
  {
    id: "p-2",
    name: "Taylor Lifter",
    age: 27,
    primaryCondition: "Left shoulder pain with overhead lifting",
    sport: "Olympic lifting / CrossFit",
    phase: "chronic",
    severity: "mild",
    clinicalStage: "strength",
    notes:
      "Able to train with load modifications. Pain at end range flexion/abduction.",
    createdAt: "2025-01-05T10:30:00.000Z",
    caseHistory: {
      site: "Anterior and lateral left shoulder.",
      quality: "Sharp pinch at end range, low-grade ache post-session.",
      intensity: "0–1/10 at rest, 5–6/10 with overhead lifts.",
      duration: "6 months with fluctuations depending on load.",
      symptoms:
        "No true instability. Some perceived weakness and fatigue with high reps.",
      cause:
        "Likely overload from a block of high-volume snatch/jerk work after a break.",
      aggravating:
        "Snatch, jerk, kipping pull-ups, overhead pressing, heavy carries.",
      relieving: "Deload weeks, soft tissue work, band warm-ups.",
      nature:
        "No night pain, no neurological symptoms. Responds to load management.",
      timing:
        "Peaks during and immediately after heavy overhead sessions, settles by next day.",
      advice:
        "Previously told to avoid all overhead work; no structured graded plan provided.",
      goals:
        "Return to full overhead lifting tolerance with confident heavy snatch and jerk.",
    },
  },
];
