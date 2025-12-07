import React, { useState } from "react";
import { initialPatients, xpLevelThresholds } from "./data";
import { generatePlan } from "./planGenerator";
import "./app.css";

// Journey stages mapped to levels
const journeyStages = [
  { label: "Foundation", level: 1 },
  { label: "Strength", level: 2 },
  { label: "Power", level: 3 },
  { label: "Athlete", level: 4 },
];

export default function App() {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatients[0]?.id || null
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // XP animation state
  const [xpBurst, setXpBurst] = useState(null); // { patientId, amount, key }
  const [levelUpToast, setLevelUpToast] = useState(null); // { patientId, fromLevel, toLevel, stageLabel }

  const emptyCaseHistory = {
    site: "",
    quality: "",
    intensity: "",
    duration: "",
    sensory: "",
    chronicity: "",
    aggravating: "",
    relieving: "",
    noBenefit: "",
    treatment: "",
    associated: "",
    generalHealth: "",
    goals: "",
  };

  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    age: "",
    primaryCondition: "",
    sport: "",
    phase: "Subacute",
    caseHistory: emptyCaseHistory,
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  function handleBasicChange(e) {
    const { name, value } = e.target;
    setNewPatientForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCaseHistoryChange(e) {
    const { name, value } = e.target;
    setNewPatientForm((prev) => ({
      ...prev,
      caseHistory: { ...prev.caseHistory, [name]: value },
    }));
  }

  function handleAddPatient(e) {
    e.preventDefault();

    const id = "p" + (patients.length + 1);
    const plan = generatePlan(newPatientForm);

    const newPatient = {
      id,
      name: newPatientForm.name,
      age: newPatientForm.age,
      primaryCondition: newPatientForm.primaryCondition,
      sport: newPatientForm.sport,
      phase: newPatientForm.phase,
      caseHistory: newPatientForm.caseHistory,
      plan,
      xp: 0,
      level: 1,
      logs: ["Patient created. Test plan generated."],
    };

    setPatients((prev) => [...prev, newPatient]);
    setSelectedPatientId(id);
    setIsAddModalOpen(false);

    setNewPatientForm({
      name: "",
      age: "",
      primaryCondition: "",
      sport: "",
      phase: "Subacute",
      caseHistory: emptyCaseHistory,
    });
  }

  // XP + level-up logic with animations
  function awardXP(patientId, amount) {
    if (!amount) return;

    const burstKey = Date.now();
    let levelUpInfo = null;

    setPatients((prev) => {
      const maxLevel = Math.max(
        ...Object.keys(xpLevelThresholds).map((n) => Number(n))
      );

      const updated = prev.map((p) => {
        if (p.id !== patientId) return p;

        const prevLevel = p.level || 1;
        const prevXP = p.xp || 0;
        const newXP = prevXP + amount;

        let newLevel = prevLevel;
        while (
          newLevel < maxLevel &&
          newXP >= xpLevelThresholds[newLevel]
        ) {
          newLevel += 1;
        }

        if (newLevel > prevLevel) {
          const stage = journeyStages.find((s) => s.level === newLevel);
          levelUpInfo = {
            patientId,
            fromLevel: prevLevel,
            toLevel: newLevel,
            stageLabel: stage?.label || `Level ${newLevel}`,
          };
        }

        const logLine = `+${amount} XP awarded${
          newLevel > prevLevel ? ` (Level up to ${newLevel})` : ""
        }.`;

        return {
          ...p,
          xp: newXP,
          level: newLevel,
          logs: [logLine, ...(p.logs || [])],
        };
      });

      return updated;
    });

    // XP burst animation
    setXpBurst({
      patientId,
      amount,
      key: burstKey,
    });

    // keep the chip visible a bit longer
    setTimeout(() => {
      setXpBurst((current) =>
        current && current.key === burstKey ? null : current
      );
    }, 1800);

    // Level-up toast
    if (levelUpInfo) {
      setLevelUpToast(levelUpInfo);
      setTimeout(() => {
        setLevelUpToast((current) =>
          current &&
          current.patientId === levelUpInfo.patientId &&
          current.toLevel === levelUpInfo.toLevel
            ? null
            : current
        );
      }, 4000);
    }
  }

  // Current journey stage index from level
  const currentStageIndex =
    selectedPatient && selectedPatient.level
      ? Math.min(
          Math.max(selectedPatient.level, 1),
          journeyStages.length
        ) - 1
      : 0;

  const isBurstingXP =
    selectedPatient &&
    xpBurst &&
    xpBurst.patientId === selectedPatient.id;

  const isLevelingUp =
    selectedPatient &&
    levelUpToast &&
    levelUpToast.patientId === selectedPatient.id;

  return (
    <div className={`app-container ${isDarkMode ? "dark" : ""}`}>
      <header className="app-header">
        <h1>Rehab Practitioner Dashboard</h1>
        <div className="toggle-wrapper">
          <span>Front-end only – Test mode ON</span>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="toggle-theme"
          >
            {isDarkMode ? "☀ Light mode" : "🌙 Dark mode"}
          </button>
        </div>
      </header>

      <main>
        {/* PATIENT LIST */}
        <section className="patient-list">
          <h2>Patients</h2>

          <button
            className="add-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add patient
          </button>

          <ul>
            {patients.map((p) => (
              <li
                key={p.id}
                className={p.id === selectedPatientId ? "active-patient" : ""}
                onClick={() => setSelectedPatientId(p.id)}
              >
                <span>{p.name}</span>
                <span>{p.primaryCondition}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* PATIENT OVERVIEW */}
        {selectedPatient && (
          <section className="patient-overview">
            <h2>Patient overview</h2>

            <p>
              <strong>Name:</strong> {selectedPatient.name}
            </p>
            <p>
              <strong>Age:</strong> {selectedPatient.age}
            </p>
            <p>
              <strong>Condition:</strong> {selectedPatient.primaryCondition}
            </p>
            <p>
              <strong>Sport:</strong> {selectedPatient.sport}
            </p>
            <p>
              <strong>Phase:</strong> {selectedPatient.phase}
            </p>

            {/* XP BAR + dev test button */}
            <div
              className={`xp-container ${
                isBurstingXP ? "xp-container--burst" : ""
              } ${isLevelingUp ? "xp-container--levelup" : ""}`}
            >
              <p>
                Level {selectedPatient.level} — {selectedPatient.xp} XP /{" "}
                {xpLevelThresholds[selectedPatient.level]} XP
              </p>

              <div className="xp-bar">
                <div
                  className="xp-fill"
                  style={{
                    width: `${
                      (selectedPatient.xp /
                        xpLevelThresholds[selectedPatient.level]) *
                      100
                    }%`,
                  }}
                ></div>
              </div>

              {isBurstingXP && xpBurst && (
                <div className="xp-burst-chip">
                  +{xpBurst.amount} XP
                </div>
              )}

              <div className="xp-dev-controls">
                <button
                  type="button"
                  className="dev-xp-button"
                  // 150 XP so it *definitely* pushes levels for testing
                  onClick={() => awardXP(selectedPatient.id, 150)}
                >
                  +150 XP test (simulate quests)
                </button>
              </div>
            </div>

            {/* JOURNEY STAGE BAR */}
            <section className="journey">
              <h3>Rehab journey</h3>
              <div className="journey-track">
                {journeyStages.map((stage) => {
                  const stageLevel = stage.level;
                  const isReached =
                    (selectedPatient.level || 1) >= stageLevel;
                  const isCurrent =
                    (selectedPatient.level || 1) === stageLevel;

                  return (
                    <div
                      key={stage.level}
                      className={`journey-step ${
                        isReached ? "journey-step--reached" : ""
                      } ${isCurrent ? "journey-step--current" : ""}`}
                    >
                      <div className="journey-dot" />
                      <div className="journey-label">{stage.label}</div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PLAN */}
            <h3>Plan overview</h3>
            <pre className="plan-box">{selectedPatient.plan.summary}</pre>

            {/* LOGS */}
            <h3>Logs</h3>
            <ul className="log-list">
              {selectedPatient.logs.length === 0 && <li>No logs yet</li>}
              {selectedPatient.logs.map((log, i) => (
                <li key={i}>{log}</li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {/* LEVEL UP TOAST */}
      {levelUpToast && (
        <div className="toast-levelup">
          <div className="toast-title">LEVEL UP!</div>
          <div className="toast-body">
            {`Now at Level ${levelUpToast.toLevel} — ${levelUpToast.stageLabel} stage.`}
          </div>
        </div>
      )}

      {/* ADD PATIENT MODAL */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add new patient</h2>
            <form onSubmit={handleAddPatient}>
              <label>Name</label>
              <input
                name="name"
                value={newPatientForm.name}
                onChange={handleBasicChange}
                required
              />

              <label>Age</label>
              <input
                name="age"
                value={newPatientForm.age}
                onChange={handleBasicChange}
                required
              />

              <label>Primary condition</label>
              <input
                name="primaryCondition"
                value={newPatientForm.primaryCondition}
                onChange={handleBasicChange}
                required
              />

              <label>Sport</label>
              <input
                name="sport"
                value={newPatientForm.sport}
                onChange={handleBasicChange}
              />

              <label>Rehab phase</label>
              <select
                name="phase"
                value={newPatientForm.phase}
                onChange={handleBasicChange}
              >
                <option>Acute</option>
                <option>Subacute</option>
                <option>Chronic</option>
              </select>

              <h3>SQIDSCARNTAG</h3>

              {Object.keys(emptyCaseHistory).map((key) => (
                <div key={key}>
                  <label>{key}</label>
                  <textarea
                    name={key}
                    value={newPatientForm.caseHistory[key]}
                    onChange={handleCaseHistoryChange}
                  />
                </div>
              ))}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  Save patient + generate plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <span>Front-end only — No API yet.</span>
      </footer>
    </div>
  );
}
