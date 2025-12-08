// src/App.jsx
import React, { useState } from "react";
import { initialPatients, xpLevelThresholds } from "./data";
import { TEST_MODE, generatePlan } from "./planGenerator";
import "./App.css";

// Clinical stages (separate from behaviour levels)
const clinicalStages = [
  { id: "foundation", label: "Foundation" },
  { id: "strength", label: "Strength" },
  { id: "power", label: "Power" },
  { id: "athlete", label: "Athlete" },
];

// Behaviour level titles (XP-based)
const levelNames = {
  1: "Initiation",
  2: "Stability",
  3: "Strength Builder",
  4: "Tolerance Builder",
  5: "Load Warrior",
  6: "Return-to-Sport Ready",
};

function calculateLevelAndNext(totalXP) {
  let level = 1;
  const levels = Object.keys(xpLevelThresholds)
    .map(Number)
    .sort((a, b) => xpLevelThresholds[a] - xpLevelThresholds[b]);

  levels.forEach((lvl) => {
    if (totalXP >= xpLevelThresholds[lvl]) {
      level = lvl;
    }
  });

  const nextLevelXP = xpLevelThresholds[level + 1] ?? null;
  return { level, nextLevelXP };
}

// Build full patient object from a base patient using the plan generator
function buildPatientWithPlan(basePatient) {
  const { plan, logs: generatorLogs } = generatePlan(basePatient);

  const defaultXP = {
    total: 0,
    level: 1,
    nextLevelXP: xpLevelThresholds[2] ?? null,
    history: [],
  };

  const dailyQuests = [
    {
      id: `q-daily-main-${basePatient.id}`,
      text: "Complete today's main rehab exercises",
      xp: 10,
      done: false,
      type: "daily",
    },
    {
      id: `q-daily-log-${basePatient.id}`,
      text: "Log pain or stiffness after today's activity",
      xp: 5,
      done: false,
      type: "daily",
    },
  ];

  const outcomeQuests = (plan?.outcomeMeasures || []).map((om, idx) => ({
    id: `q-om-${basePatient.id}-${om.id || idx}`,
    text: `Complete ${om.name} this week`,
    xp: 20,
    done: false,
    type: "weekly",
  }));

  const quests = [...dailyQuests, ...outcomeQuests];

  const initialLog = {
    id: `log-init-${basePatient.id}`,
    timestamp: new Date().toISOString(),
    type: "system",
    message: "Patient initialised with test-mode plan and outcome measures.",
  };

  return {
    ...basePatient,
    plan,
    xp: defaultXP,
    quests,
    logs: [initialLog, ...(generatorLogs || [])],
  };
}

export default function App() {
  const [patients, setPatients] = useState(() =>
    initialPatients.map((p) => buildPatientWithPlan(p))
  );

  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatients.length > 0 ? initialPatients[0].id : null
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    age: "",
    primaryCondition: "",
    sport: "",
    phase: "subacute",
    severity: "moderate",
    clinicalStage: "foundation",
    notes: "",
    caseHistory: {
      site: "",
      quality: "",
      intensity: "",
      duration: "",
      symptoms: "",
      cause: "",
      aggravating: "",
      relieving: "",
      nature: "",
      timing: "",
      advice: "",
      goals: "",
    },
  });

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || null;

  // XP progress for selected patient
  let xpProgressPercent = 0;
  if (selectedPatient && selectedPatient.xp) {
    const total = selectedPatient.xp.total ?? 0;
    const level = selectedPatient.xp.level ?? 1;
    const floor = xpLevelThresholds[level] ?? 0;
    const next = selectedPatient.xp.nextLevelXP ?? total;
    const range = next - floor || 1;
    xpProgressPercent = Math.min(
      100,
      Math.max(0, ((total - floor) / range) * 100)
    );
  }

  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
  };

  const handleStageChange = (patientId, newStage) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, clinicalStage: newStage } : p
      )
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCaseHistoryChange = (field, value) => {
    setNewPatientForm((prev) => ({
      ...prev,
      caseHistory: {
        ...prev.caseHistory,
        [field]: value,
      },
    }));
  };

  const resetNewPatientForm = () => {
    setNewPatientForm({
      name: "",
      age: "",
      primaryCondition: "",
      sport: "",
      phase: "subacute",
      severity: "moderate",
      clinicalStage: "foundation",
      notes: "",
      caseHistory: {
        site: "",
        quality: "",
        intensity: "",
        duration: "",
        symptoms: "",
        cause: "",
        aggravating: "",
        relieving: "",
        nature: "",
        timing: "",
        advice: "",
        goals: "",
      },
    });
  };

  const handleAddPatient = (e) => {
    e.preventDefault();

    if (!newPatientForm.name.trim()) {
      alert("Please enter a patient name.");
      return;
    }

    const newId = `p-${Date.now()}`;

    const basePatient = {
      id: newId,
      name: newPatientForm.name.trim(),
      age: newPatientForm.age ? Number(newPatientForm.age) : null,
      primaryCondition: newPatientForm.primaryCondition.trim(),
      sport: newPatientForm.sport.trim(),
      phase: newPatientForm.phase,
      severity: newPatientForm.severity,
      clinicalStage: newPatientForm.clinicalStage || "foundation",
      notes: newPatientForm.notes.trim(),
      caseHistory: newPatientForm.caseHistory,
      createdAt: new Date().toISOString(),
    };

    const patientWithPlan = buildPatientWithPlan(basePatient);

    setPatients((prev) => [...prev, patientWithPlan]);
    setSelectedPatientId(newId);
    resetNewPatientForm();
    setIsAddModalOpen(false);
  };

  const handleCompleteQuest = (patientId, questId) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;

        const quests = p.quests || [];
        const quest = quests.find((q) => q.id === questId);
        if (!quest || quest.done) return p;

        const updatedQuests = quests.map((q) =>
          q.id === questId ? { ...q, done: true } : q
        );

        const currentXP = p.xp?.total ?? 0;
        const addAmount = quest.xp ?? 0;
        const newTotal = currentXP + addAmount;
        const { level, nextLevelXP } = calculateLevelAndNext(newTotal);

        const xpEntry = {
          id: `xp-${Date.now()}`,
          timestamp: new Date().toISOString(),
          amount: addAmount,
          source: "quest_complete",
          questId,
        };

        const updatedXP = {
          total: newTotal,
          level,
          nextLevelXP,
          history: [...(p.xp?.history || []), xpEntry],
        };

        const newLog = {
          id: `log-xp-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "system",
          message: `Quest completed (+${addAmount} XP). Behaviour level now ${level}.`,
        };

        return {
          ...p,
          quests: updatedQuests,
          xp: updatedXP,
          logs: [newLog, ...(p.logs || [])],
        };
      })
    );
  };

  const activeStageId =
    selectedPatient?.clinicalStage || clinicalStages[0].id;

  const activeStageIndex = clinicalStages.findIndex(
    (s) => s.id === activeStageId
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title-group">
          <h1 className="app-title">Rehab Practitioner Dashboard</h1>
          <span className="app-subtitle">
            Front-end only · Test mode:{" "}
            <strong>{TEST_MODE ? "ON" : "OFF"}</strong>
          </span>
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <section className="panel">
            <h2 className="panel-title">Patients</h2>
            {patients.length === 0 ? (
              <p className="empty-state">
                No patients yet. Add your first one below.
              </p>
            ) : (
              <ul className="patient-list">
                {patients.map((patient) => (
                  <li
                    key={patient.id}
                    className={`patient-item ${
                      patient.id === selectedPatientId
                        ? "patient-item--active"
                        : ""
                    }`}
                    onClick={() => handleSelectPatient(patient.id)}
                  >
                    <div className="patient-item-name">{patient.name}</div>
                    <div className="patient-item-meta">
                      {patient.primaryCondition || "No condition set"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <h2 className="panel-title">Add patient</h2>
            <button
              type="button"
              className="primary-button full-width"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add new patient
            </button>
          </section>
        </aside>

        <section className="content">
          {!selectedPatient ? (
            <div className="empty-state large">
              <p>Select a patient on the left or add a new one to see the plan.</p>
            </div>
          ) : (
            <>
              {/* Patient overview */}
              <section className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Patient overview</h2>
                  <span className="panel-tag">ID: {selectedPatient.id}</span>
                </div>

                <div className="patient-summary-grid">
                  <div>
                    <div className="label">Name</div>
                    <div className="value">{selectedPatient.name}</div>
                  </div>
                  {selectedPatient.age && (
                    <div>
                      <div className="label">Age</div>
                      <div className="value">{selectedPatient.age}</div>
                    </div>
                  )}
                  {selectedPatient.sport && (
                    <div>
                      <div className="label">Sport / activity</div>
                      <div className="value">{selectedPatient.sport}</div>
                    </div>
                  )}
                  {selectedPatient.primaryCondition && (
                    <div className="full-width">
                      <div className="label">Primary condition</div>
                      <div className="value">
                        {selectedPatient.primaryCondition}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="label">Phase</div>
                    <div className="chip">
                      {selectedPatient.phase || "Not set"}
                    </div>
                  </div>
                  <div>
                    <div className="label">Severity</div>
                    <div className="chip chip--soft">
                      {selectedPatient.severity || "Not set"}
                    </div>
                  </div>
                  {selectedPatient.notes && (
                    <div className="full-width">
                      <div className="label">Notes</div>
                      <div className="value value--muted">
                        {selectedPatient.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clinical stage journey */}
                <div className="journey-wrapper">
                  <div className="journey-header">
                    <div>
                      <div className="label">Clinical stage</div>
                      <div className="journey-sub">
                        Stages reflect actual body progress (not XP).
                      </div>
                    </div>
                    <select
                      className="journey-select"
                      value={activeStageId}
                      onChange={(e) =>
                        handleStageChange(selectedPatient.id, e.target.value)
                      }
                    >
                      {clinicalStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="journey-strip">
                    {clinicalStages.map((stage, index) => {
                      const isActive = stage.id === activeStageId;
                      const isPast = activeStageIndex > index;
                      const classes = [
                        "journey-stage",
                        isActive && "journey-stage--active",
                        isPast && "journey-stage--past",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <div key={stage.id} className={classes}>
                          <div className="journey-stage-circle" />
                          <span className="journey-stage-label">
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* XP / level (behaviour) */}
                {selectedPatient.xp && (
                  <div className="xp-wrapper">
                    <div className="xp-header">
                      <div className="label">Rehab level (behaviour)</div>
                      <div className="xp-level">
                        Level {selectedPatient.xp.level} ·{" "}
                        {levelNames[selectedPatient.xp.level] || "In progress"}
                      </div>
                    </div>
                    <div className="xp-bar">
                      <div
                        className="xp-bar-fill"
                        style={{ width: `${xpProgressPercent}%` }}
                      />
                    </div>
                    {selectedPatient.xp.nextLevelXP ? (
                      <div className="xp-caption">
                        {selectedPatient.xp.total} XP /{" "}
                        {selectedPatient.xp.nextLevelXP} XP to next level
                      </div>
                    ) : (
                      <div className="xp-caption">
                        {selectedPatient.xp.total} XP · Max level reached
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Plan overview */}
              <section className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Plan overview</h2>
                  {selectedPatient.plan && (
                    <span className="panel-tag">
                      {selectedPatient.plan.reviewTimeline}
                    </span>
                  )}
                </div>

                {!selectedPatient.plan ? (
                  <p className="empty-state">
                    No plan generated yet. In test mode, plans are created
                    automatically when you add a patient.
                  </p>
                ) : (
                  <div className="plan-layout">
                    <div className="plan-column">
                      <h3 className="section-title">Summary</h3>
                      <p className="value">
                        {selectedPatient.plan.summary || ""}
                      </p>

                      <h3 className="section-title">Goals</h3>
                      <ul className="bullet-list">
                        {selectedPatient.plan.goals?.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>

                      <h3 className="section-title">Weekly structure</h3>
                      <ul className="bullet-list">
                        {selectedPatient.plan.weeklyStructure?.map(
                          (item, idx) => (
                            <li key={idx}>{item}</li>
                          )
                        )}
                      </ul>

                      {selectedPatient.plan.outcomeMeasures?.length > 0 && (
                        <>
                          <h3 className="section-title">Outcome measures</h3>
                          <ul className="tag-list">
                            {selectedPatient.plan.outcomeMeasures.map((om) => (
                              <li
                                key={om.id || om.name}
                                className="tag tag--accent"
                              >
                                {om.name}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <div className="plan-column">
                      <h3 className="section-title">Key exercises</h3>
                      <ul className="bullet-list">
                        {selectedPatient.plan.keyExercises?.map((ex, idx) => (
                          <li key={idx}>
                            <strong>{ex.name}</strong>
                            {ex.frequency && (
                              <span className="bullet-sub">
                                {" "}
                                · {ex.frequency}
                              </span>
                            )}
                            {ex.cues && (
                              <div className="bullet-sub">{ex.cues}</div>
                            )}
                          </li>
                        ))}
                      </ul>

                      {selectedPatient.plan.cautions?.length > 0 && (
                        <>
                          <h3 className="section-title">
                            Cautions &amp; load guardrails
                          </h3>
                          <ul className="bullet-list">
                            {selectedPatient.plan.cautions.map(
                              (caution, idx) => (
                                <li key={idx}>{caution}</li>
                              )
                            )}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Daily / weekly quests */}
              <section className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Quests</h2>
                  <span className="panel-tag">
                    {selectedPatient.quests?.filter((q) => q.done).length || 0}{" "}
                    / {selectedPatient.quests?.length || 0} completed
                  </span>
                </div>

                {!selectedPatient.quests ||
                selectedPatient.quests.length === 0 ? (
                  <p className="empty-state">No quests set yet.</p>
                ) : (
                  <ul className="quest-list">
                    {selectedPatient.quests.map((quest) => (
                      <li
                        key={quest.id}
                        className={`quest-item ${
                          quest.done ? "quest-item--done" : ""
                        }`}
                      >
                        <div className="quest-main">
                          <label className="quest-label">
                            <input
                              type="checkbox"
                              checked={quest.done}
                              disabled={quest.done}
                              onChange={() =>
                                handleCompleteQuest(
                                  selectedPatient.id,
                                  quest.id
                                )
                              }
                            />
                            <span className="quest-text">{quest.text}</span>
                          </label>
                          <span className="quest-type">
                            {quest.type === "weekly" ? "Weekly" : "Daily"}
                          </span>
                        </div>
                        <span className="quest-xp">+{quest.xp} XP</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Logs */}
              <section className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Patient logs</h2>
                  <span className="panel-tag">
                    {selectedPatient.logs?.length || 0} entries
                  </span>
                </div>

                {!selectedPatient.logs ||
                selectedPatient.logs.length === 0 ? (
                  <p className="empty-state">No logs yet for this patient.</p>
                ) : (
                  <ul className="log-list">
                    {selectedPatient.logs
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((log) => (
                        <li
                          key={log.id}
                          className={`log-item log-item--${log.type}`}
                        >
                          <div className="log-header">
                            <span className="log-type">
                              {log.type === "system" ? "System" : "Note"}
                            </span>
                            <span className="log-timestamp">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="log-message">{log.message}</div>
                        </li>
                      ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </section>
      </main>

      {/* Add patient modal */}
      {isAddModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setIsAddModalOpen(false);
          }}
        >
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Add new patient</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsAddModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form className="patient-form" onSubmit={handleAddPatient}>
              <div className="form-row">
                <label htmlFor="name">Name *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={newPatientForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Sam K."
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="age">Age</label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="5"
                  max="100"
                  value={newPatientForm.age}
                  onChange={handleFormChange}
                  placeholder="e.g. 32"
                />
              </div>

              <div className="form-row">
                <label htmlFor="primaryCondition">Primary condition</label>
                <input
                  id="primaryCondition"
                  name="primaryCondition"
                  type="text"
                  value={newPatientForm.primaryCondition}
                  onChange={handleFormChange}
                  placeholder="e.g. Patellofemoral pain, rotator cuff, etc."
                />
              </div>

              <div className="form-row">
                <label htmlFor="sport">Sport / activity</label>
                <input
                  id="sport"
                  name="sport"
                  type="text"
                  value={newPatientForm.sport}
                  onChange={handleFormChange}
                  placeholder="e.g. CrossFit, running"
                />
              </div>

              <div className="form-row inline-row">
                <div>
                  <label htmlFor="phase">Rehab phase</label>
                  <select
                    id="phase"
                    name="phase"
                    value={newPatientForm.phase}
                    onChange={handleFormChange}
                  >
                    <option value="acute">Acute</option>
                    <option value="subacute">Subacute</option>
                    <option value="chronic">Chronic</option>
                    <option value="return-to-sport">Return to sport</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="severity">Severity</label>
                  <select
                    id="severity"
                    name="severity"
                    value={newPatientForm.severity}
                    onChange={handleFormChange}
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="clinicalStage">Clinical stage</label>
                <select
                  id="clinicalStage"
                  name="clinicalStage"
                  value={newPatientForm.clinicalStage}
                  onChange={handleFormChange}
                >
                  {clinicalStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={newPatientForm.notes}
                  onChange={handleFormChange}
                  placeholder="Key findings, red flags ruled out, etc."
                />
              </div>

              <hr className="modal-divider" />

              <h3 className="section-title">SQIDSCARNTAG case history</h3>
              <p className="modal-helper">
                Structured pain case history fields. You can rename/adjust
                later.
              </p>

              <div className="form-row">
                <label>Site (S)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.site}
                  onChange={(e) =>
                    handleCaseHistoryChange("site", e.target.value)
                  }
                  placeholder="Where is the main area of symptoms?"
                />
              </div>

              <div className="form-row">
                <label>Quality (Q)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.quality}
                  onChange={(e) =>
                    handleCaseHistoryChange("quality", e.target.value)
                  }
                  placeholder="What does it feel like? (dull, sharp, achy, burning...)"
                />
              </div>

              <div className="form-row">
                <label>Intensity (I)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.intensity}
                  onChange={(e) =>
                    handleCaseHistoryChange("intensity", e.target.value)
                  }
                  placeholder="How strong is it? (e.g. 0–10, best/worst)"
                />
              </div>

              <div className="form-row">
                <label>Duration (D)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.duration}
                  onChange={(e) =>
                    handleCaseHistoryChange("duration", e.target.value)
                  }
                  placeholder="How long has it been going on? Constant or intermittent?"
                />
              </div>

              <div className="form-row">
                <label>Symptoms / pattern (S)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.symptoms}
                  onChange={(e) =>
                    handleCaseHistoryChange("symptoms", e.target.value)
                  }
                  placeholder="Stiffness, clicking, locking, swelling, morning pattern, warm-up pattern, etc."
                />
              </div>

              <div className="form-row">
                <label>Cause / onset (C)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.cause}
                  onChange={(e) =>
                    handleCaseHistoryChange("cause", e.target.value)
                  }
                  placeholder="What started it? (gradual build, acute event, change in training...)"
                />
              </div>

              <div className="form-row">
                <label>Aggravating factors (A)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.aggravating}
                  onChange={(e) =>
                    handleCaseHistoryChange("aggravating", e.target.value)
                  }
                  placeholder="Movements/loads that make it worse."
                />
              </div>

              <div className="form-row">
                <label>Relieving factors (R)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.relieving}
                  onChange={(e) =>
                    handleCaseHistoryChange("relieving", e.target.value)
                  }
                  placeholder="What eases it? (rest, ice, taping, meds...)"
                />
              </div>

              <div className="form-row">
                <label>Nature / red flags (N)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.nature}
                  onChange={(e) =>
                    handleCaseHistoryChange("nature", e.target.value)
                  }
                  placeholder="Night pain, weight loss, systemic symptoms, neuro changes, etc."
                />
              </div>

              <div className="form-row">
                <label>Timing / training context (T)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.timing}
                  onChange={(e) =>
                    handleCaseHistoryChange("timing", e.target.value)
                  }
                  placeholder="Training schedule, volume spikes, competitions, work patterns."
                />
              </div>

              <div className="form-row">
                <label>Advice / previous treatment (A)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.advice}
                  onChange={(e) =>
                    handleCaseHistoryChange("advice", e.target.value)
                  }
                  placeholder="What have they been told? What have they tried so far?"
                />
              </div>

              <div className="form-row">
                <label>Goals (G)</label>
                <textarea
                  rows="2"
                  value={newPatientForm.caseHistory.goals}
                  onChange={(e) =>
                    handleCaseHistoryChange("goals", e.target.value)
                  }
                  placeholder="Short-term and long-term goals, key milestones, events."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setIsAddModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save patient &amp; generate test plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <span>Front-end only · No API calls yet.</span>
        <span className="footer-separator">·</span>
        <span>Levels = behaviour · Stages = clinical progress.</span>
      </footer>
    </div>
  );
}
