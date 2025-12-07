export const xpLevelThresholds = {
  1: 100,
  2: 200,
  3: 400,
  4: 800,
};

export const initialPatients = [
  {
    id: "p1",
    name: "Jess",
    age: 32,
    primaryCondition: "CrossFit knee pain",
    sport: "CrossFit",
    phase: "Subacute",
    xp: 60,
    level: 1,
    plan: {
      summary: "Strength block + mobility + load management",
    },
    logs: ["Initial consult completed"],
    caseHistory: {},
  },
  {
    id: "p2",
    name: "Mark",
    age: 28,
    primaryCondition: "Mid-portion Achilles tendinopathy",
    sport: "Runner",
    phase: "Chronic",
    xp: 20,
    level: 1,
    plan: {
      summary: "Isometrics + tempo calf raises + weekly progression",
    },
    logs: [],
    caseHistory: {},
  },
];
