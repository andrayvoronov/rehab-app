import { useState } from "react";

const ROLES = [
  {
    id: "mobility_mage",
    name: "Mobility Mage",
    description: "Focuses on range of motion, flexibility and joint control.",
    icon: "🧙‍♂️",
  },
  {
    id: "strength_knight",
    name: "Strength Knight",
    description: "Builds raw strength and joint stability.",
    icon: "🛡️",
  },
  {
    id: "endurance_rogue",
    name: "Endurance Rogue",
    description: "Prioritises conditioning, stamina and work capacity.",
    icon: "🥷",
  },
];

const BODY_TYPES = [
  { id: "slim", label: "Slim" },
  { id: "athletic", label: "Athletic" },
  { id: "solid", label: "Solid" },
];

const FOCUS_AREAS = [
  {
    id: "upper_body",
    label: "Upper body",
    description: "Shoulder, elbow, wrist and hand focus.",
  },
  {
    id: "lower_body",
    label: "Lower body",
    description: "Hip, knee, ankle and foot focus.",
  },
  {
    id: "spine_core",
    label: "Spine + core",
    description: "Lumbar, thoracic, cervical and core stability.",
  },
];

export default function CharacterCreator({ onComplete }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [bodyType, setBodyType] = useState(null);
  const [focusArea, setFocusArea] = useState(null);

  const canNext =
    (step === 1 && role) ||
    (step === 2 && bodyType) ||
    (step === 3 && focusArea);

  const next = () => {
    if (!canNext) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete?.({ role, bodyType, focusArea });
    }
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="character-creator">
      <div className="character-steps">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={
              "character-step-pill" +
              (step === s
                ? " active"
                : step > s
                ? " completed"
                : "")
            }
          >
            <span className="character-step-number">{s}</span>
            <span className="character-step-label">
              {s === 1 && "Class"}
              {s === 2 && "Look"}
              {s === 3 && "Focus"}
            </span>
          </div>
        ))}
      </div>

      <div className="character-panel">
        {step === 1 && (
          <StepOne role={role} onSelect={setRole} />
        )}
        {step === 2 && (
          <StepTwo bodyType={bodyType} onSelect={setBodyType} />
        )}
        {step === 3 && (
          <StepThree
            focusArea={focusArea}
            onSelect={setFocusArea}
            role={role}
          />
        )}
      </div>

      <div className="character-footer">
        <button
          type="button"
          className="btn-secondary"
          onClick={back}
          disabled={step === 1}
        >
          Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={next}
          disabled={!canNext}
        >
          {step < 3 ? "Next" : "Confirm"}
        </button>
      </div>
    </div>
  );
}

function StepOne({ role, onSelect }) {
  return (
    <div className="character-step-content">
      <h3>Choose your rehab class</h3>
      <p className="character-step-subtitle">
        This sets your flavour for quests and language. It doesn&apos;t
        change your actual programme.
      </p>
      <div className="character-grid">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            className={
              "character-card" +
              (role?.id === r.id ? " selected" : "")
            }
            onClick={() => onSelect(r)}
          >
            <div className="character-card-icon">{r.icon}</div>
            <div className="character-card-title">{r.name}</div>
            <p className="character-card-desc">{r.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepTwo({ bodyType, onSelect }) {
  return (
    <div className="character-step-content">
      <h3>Choose your avatar look</h3>
      <p className="character-step-subtitle">
        Later this can link to 32-bit sprites and cosmetic unlocks.
      </p>
      <div className="character-grid">
        {BODY_TYPES.map((b) => (
          <button
            key={b.id}
            type="button"
            className={
              "character-card" +
              (bodyType?.id === b.id ? " selected" : "")
            }
            onClick={() => onSelect(b)}
          >
            <div className="character-card-title">{b.label}</div>
            <p className="character-card-desc">
              Simple visual flavour – doesn&apos;t change your exercises.
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepThree({ focusArea, onSelect, role }) {
  return (
    <div className="character-step-content">
      <h3>Choose your main focus</h3>
      <p className="character-step-subtitle">
        This helps prioritise quests and outcome measures.
      </p>

      <div className="character-grid">
        {FOCUS_AREAS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={
              "character-card" +
              (focusArea?.id === f.id ? " selected" : "")
            }
            onClick={() => onSelect(f)}
          >
            <div className="character-card-title">{f.label}</div>
            <p className="character-card-desc">{f.description}</p>
          </button>
        ))}
      </div>

      {role && (
        <div className="character-summary">
          <p>
            You&apos;ll start as a{" "}
            <strong>{role.name}</strong> focusing on{" "}
            <strong>{focusArea?.label || "…"}</strong>. You
            can still work on everything – this just guides
            what shows up first.
          </p>
        </div>
      )}
    </div>
  );
}
