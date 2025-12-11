import { useState, useEffect } from "react";
import "./index.css";

import wizardImg from "./assets/FF_wizard.png";
import levelUpImg from "./assets/level-up.png";
import rxhabBanner from "./assets/rxhabquest_banner.png";

// ===== SPRITE IMPORTS (ensure these exist in src/sprites) =====
// PALADIN (p)
import p1_m from "./sprites/p1_m.png";
import p1_f from "./sprites/p1_f.png";
import p4_m from "./sprites/p4_m.png";
import p4_f from "./sprites/p4_f.png";

// MAGE (m)
import m1_m from "./sprites/m1_m.png";
import m1_f from "./sprites/m1_f.png";
import m4_m from "./sprites/m4_m.png";
import m4_f from "./sprites/m4_f.png";

// ASSASSIN (a)
import a1_m from "./sprites/a1_m.png";
import a1_f from "./sprites/a1_f.png";
import a4_m from "./sprites/a4_m.png";
import a4_f from "./sprites/a4_f.png";

// HUNTER (h)
import h1_m from "./sprites/h1_m.png";
import h1_f from "./sprites/h1_f.png";
import h4_m from "./sprites/h4_m.png";
import h4_f from "./sprites/h4_f.png";

const XP_LEVEL_CAP = 99;

// Simple class defs for the selector
const CLASS_DEFS = [
  {
    id: "paladin",
    code: "p",
    finalTitle: "Solaris Paladin",
    tierOneTitle: "Village Squire",
    blurb:
      "Armoured protector who channels light, structure, and steady progression. Great for patients who like a clear path and solid guard rails.",
  },
  {
    id: "mage",
    code: "m",
    finalTitle: "Astral Mage",
    tierOneTitle: "Curious Scribe",
    blurb:
      "Curious tactician who likes understanding the ‘why’ behind rehab. Perfect for data-driven, reflective patients.",
  },
  {
    id: "assassin",
    code: "a",
    finalTitle: "Shadow Assassin",
    tierOneTitle: "Novice Scout",
    blurb:
      "Agile, stealthy operator who loves efficiency, speed, and tight, focused sessions. Ideal for busy, time-poor humans.",
  },
  {
    id: "hunter",
    code: "h",
    finalTitle: "Druid Ranger",
    tierOneTitle: "Forest Initiate",
    blurb:
      "Nature-linked mover who thrives on variety, outdoor work, and whole-body feeling. Great for active, exploratory types.",
  },
];

// ===== HELPERS =====

function getXpForLevel(level) {
  const base = 40;
  const perLevel = 2;
  return base + perLevel * level;
}

function formatLastLogin(isoString) {
  if (!isoString) return "No logins yet";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Within the last hour";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getFinalSprite(classId, gender) {
  const isMale = gender === "male";
  switch (classId) {
    case "paladin":
      return isMale ? p4_m : p4_f;
    case "mage":
      return isMale ? m4_m : m4_f;
    case "assassin":
      return isMale ? a4_m : a4_f;
    case "hunter":
      return isMale ? h4_m : h4_f;
    default:
      return isMale ? p4_m : p4_f;
  }
}

function getTierOneSprite(classId, gender) {
  const isMale = gender === "male";
  switch (classId) {
    case "paladin":
      return isMale ? p1_m : p1_f;
    case "mage":
      return isMale ? m1_m : m1_f;
    case "assassin":
      return isMale ? a1_m : a1_f;
    case "hunter":
      return isMale ? h1_m : h1_f;
    default:
      return isMale ? p1_m : p1_f;
  }
}

// ===== PSEUDO LOGIN =====

const ROLES = [
  { id: "practitioner", label: "Clinician" },
  { id: "patient", label: "Patient" },
];

function PseudoLogin({ onLogin }) {
  const [role, setRole] = useState("practitioner");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile = {
      role,
      name: name.trim(),
      code: code.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem("rehabAppUser", JSON.stringify(profile));
    } catch (err) {
      console.error("Failed to persist pseudo user", err);
    }

    onLogin(profile);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-pill">RxHabQuest</span>
        </div>

        <h1 className="login-title">Adventure awaits!</h1>
        <p className="login-subtitle">
          Choose how you&apos;re playing today, name your character, and we&apos;ll
          load your view.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">I&apos;m logging in as</label>
            <div className="role-toggle">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className={
                    "role-pill" + (role === r.id ? " role-pill--active" : "")
                  }
                  onClick={() => setRole(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Display name</label>
            <input
              className="login-input"
              placeholder={
                role === "practitioner" ? "e.g. Dr Andray" : "e.g. RehabRanger27"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="login-label">
              Clinic / invite code{" "}
              <span className="login-label-optional">(optional)</span>
            </label>
            <input
              className="login-input"
              placeholder="e.g. GRAVITY-OSTEO"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={!name.trim()}
          >
            Enter RxHabQuest
          </button>

          <p className="login-disclaimer">
            Pseudo login only • No real authentication • Stored in your browser
          </p>
        </form>
      </div>
    </div>
  );
}

// ===== TYPEWRITER =====

function Typewriter({ text, speed = 25 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <p>{displayed}</p>;
}

// ===== PATIENT DATA (PRACTITIONER SIDE) =====

const initialPatients = [
  {
    id: "p-1",
    name: "Alex Runner",
    age: 32,
    sport: "Recreational running / CrossFit",
    condition: "Right knee patellofemoral pain",
    phase: "Subacute",
    severity: "Moderate",
    notes:
      "Desk-based job. Pain with stairs, box jumps, and running downhill. Better with cycling.",
    stage: "Foundation",
    behaviourLevel: "Level 1 – Initiation",
    behaviourSummary:
      "Building consistency with basic rehab habits and movement confidence.",
    stageNotes:
      "Stages reflect actual body progress (not XP). Clinical stage currently in FOUNDATION.",
    quests: [
      "Complete your prescribed foundation-level exercises 3x this week.",
      "Log pain levels before and after one key activity (stairs, running, or box jumps).",
      "Do one ‘win’ activity that feels good (e.g. cycling, walking) and record how it felt.",
    ],
    xpLevel: 2,
    xpCurrent: 40,
    lastLogin: "2025-12-09T08:30:00Z",
    engagement: "active",
    outcomeTrend: [52, 48, 44, 40],
  },
  {
    id: "p-2",
    name: "Jordan Runner",
    age: 27,
    sport: "Recreational running",
    condition: "Right knee patellofemoral pain",
    phase: "Chronic",
    severity: "Mild",
    notes: "Building back to 10 km continuous running.",
    stage: "Strength",
    behaviourLevel: "Level 2 – Consolidation",
    behaviourSummary:
      "Strength and load tolerance are improving. Focus is on progression without flare ups.",
    stageNotes:
      "Can tolerate moderate loading. Next step is confident plyometrics and downhill running.",
    quests: [
      "Complete strength block (squats, hinges, calf raises) 2–3x this week.",
      "Track RPE and knee response for one run.",
      "Add one graded exposure set (tempo, volume, or incline) if symptoms allow.",
    ],
    xpLevel: 3,
    xpCurrent: 30,
    lastLogin: "2025-12-05T18:10:00Z",
    engagement: "moderate",
    outcomeTrend: [60, 60, 58, 58],
  },
  {
    id: "p-3",
    name: "Taylor Lifter",
    age: 29,
    sport: "Olympic lifting",
    condition: "Left shoulder pain with overhead lifting",
    phase: "Subacute",
    severity: "Moderate",
    notes:
      "Pain with snatch and jerk from floor. Comfortable with front squat and pulls.",
    stage: "Power",
    behaviourLevel: "Level 3 – Performance",
    behaviourSummary:
      "Transferring rehab strength into explosive, sport-specific tasks.",
    stageNotes:
      "Tolerates heavy but controlled strength work. Building confidence with dynamic overhead work.",
    quests: [
      "Complete shoulder control drills before every training session.",
      "Perform overhead strength block 2x this week and record loads.",
      "Add one graded exposure set to snatch or jerk from blocks.",
    ],
    xpLevel: 4,
    xpCurrent: 40,
    lastLogin: "2025-11-28T07:45:00Z",
    engagement: "risk",
    outcomeTrend: [42, 46, 50, 54],
  },
];

// ===== OUTCOME MINI CHART (PRACTITIONER) =====

function OutcomeMiniChart({ values }) {
  if (!values || values.length === 0) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <div className="om-chart">
      {values.map((v, idx) => {
        const normalised = (v - min) / range;
        const height = 30 + normalised * 40; // 30–70px
        return (
          <div
            key={idx}
            className="om-bar"
            style={{ height: `${height}px` }}
          />
        );
      })}
    </div>
  );
}

// ===== PATIENT FLOW (PATIENT JOURNEY + PORTAL) =====

function PatientFlow({ onSendMessage, user }) {
  const [step, setStep] = useState("welcome");
  const [nickname, setNickname] = useState("");
  const [archetype, setArchetype] = useState("Runner");
  const [gender, setGender] = useState("male");
  const [focus, setFocus] = useState("lower limb");
  const [classIndex, setClassIndex] = useState(0);
  const [showClassBurst, setShowClassBurst] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageUrgency, setMessageUrgency] = useState("normal");
  const [messageSentHint, setMessageSentHint] = useState("");

  const selectedClass = CLASS_DEFS[classIndex] ?? CLASS_DEFS[0];
  const classId = selectedClass.id;

  const tierOneSprite = getTierOneSprite(classId, gender);
  const finalSprite = getFinalSprite(classId, gender);

  const resetCreator = () => {
    setNickname("");
    setArchetype("Runner");
    setGender("male");
    setFocus("lower limb");
    setClassIndex(0);
    setStep("welcome");
    setMessageSentHint("");
  };

  const goPrevClass = () => {
    setClassIndex((prev) =>
      prev === 0 ? CLASS_DEFS.length - 1 : prev - 1,
    );
    setMessageSentHint("");
  };

  const goNextClass = () => {
    setClassIndex((prev) =>
      prev === CLASS_DEFS.length - 1 ? 0 : prev + 1,
    );
    setMessageSentHint("");
  };

  const handleConfirmClass = () => {
    setShowClassBurst(true);
    setTimeout(() => {
      setShowClassBurst(false);
      setStep("summary");
    }, 650);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    if (onSendMessage) {
      onSendMessage({
        message: messageText.trim(),
        urgency: messageUrgency,
      });
    }
    setMessageText("");
    setMessageUrgency("normal");
    setShowMessageModal(false);
    setMessageSentHint("Message sent to your clinician (demo only).");
  };

  // ===== STEP: WELCOME =====
  if (step === "welcome") {
    return (
      <main className="patient-main">
        <section className="card">
          <div className="card-header">
            <h2>Welcome to your rehab journey</h2>
          </div>

          <p className="card-helper">
            This is where the light RPG flavour sets the tone for your
            programme.
          </p>

          <div className="wizard-wrapper">
            <div className="wizard-container">
              <img src={wizardImg} alt="Wizard guide" className="wizard-img" />
              <div className="wizard-mouth" />
            </div>
          </div>

          <div className="narrative-block narrative-type">
            <Typewriter
              text={`You've answered the call to adventure. Somewhere between pain and potential, a version of you is waiting – stronger, more confident, and at home in your body again.

Your clinician has set up a path just for you. Along the way you'll unlock quests, earn experience, and see your body adapt in real time.

Ready to step into your story and build the most capable version of you?`}
              speed={25}
            />
          </div>

          <div className="creator-nav creator-nav-centre">
            <button
              className="btn-primary"
              type="button"
              onClick={() => setStep("nickname")}
            >
              Start character setup
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ===== STEP: NICKNAME =====
  if (step === "nickname") {
    return (
      <main className="patient-main">
        <section className="card">
          <div className="card-header">
            <h2>Your nickname</h2>
          </div>
          <p className="card-helper">
            This is how you&apos;ll see yourself in the app. Your clinician
            doesn&apos;t need this – it&apos;s just for you.
          </p>

          <div className="form-grid">
            <label className="form-field">
              <span className="label">Nickname</span>
              <input
                className="input"
                placeholder="e.g. Knee Knight, Shoulder Witch…"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>
          </div>

          <div className="creator-nav">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep("welcome")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep("profile")}
              disabled={!nickname.trim()}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ===== STEP: PROFILE =====
  if (step === "profile") {
    return (
      <main className="patient-main">
        <section className="card">
          <div className="card-header">
            <h2>Build your base profile</h2>
          </div>
          <p className="card-helper">
            This doesn&apos;t change your clinical plan – it just helps the app
            feel more like you.
          </p>

          <div className="form-grid">
            <label className="form-field">
              <span className="label">Archetype</span>
              <select
                className="input"
                value={archetype}
                onChange={(e) => setArchetype(e.target.value)}
              >
                <option>Runner</option>
                <option>Crossfitter</option>
                <option>Grappler</option>
                <option>Lifter</option>
                <option>Baller</option>
                <option>Everyday Hero</option>
              </select>
            </label>

            <label className="form-field">
              <span className="label">Gender</span>
              <div className="toggle-row">
                <button
                  type="button"
                  className={
                    "toggle-pill" +
                    (gender === "male" ? " toggle-pill--active" : "")
                  }
                  onClick={() => setGender("male")}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={
                    "toggle-pill" +
                    (gender === "female" ? " toggle-pill--active" : "")
                  }
                  onClick={() => setGender("female")}
                >
                  Female
                </button>
              </div>
            </label>

            <label className="form-field">
              <span className="label">Main focus</span>
              <select
                className="input"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
              >
                <option value="upper limb">Upper limb</option>
                <option value="lower limb">Lower limb</option>
                <option value="lower back">Lower back</option>
                <option value="hips">Hips</option>
                <option value="neck">Neck</option>
                <option value="middle back">Middle back</option>
              </select>
            </label>
          </div>

          <div className="creator-nav">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep("nickname")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep("class")}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ===== STEP: CLASS SELECTOR (ONE AT A TIME + ARROWS) =====
  if (step === "class") {
    return (
      <main className="patient-main">
        <section className="card">
          <div className="card-header">
            <h2>Choose your class</h2>
          </div>
          <p className="card-helper">
            These are the final forms of each class. You&apos;ll start at tier 1
            and grow into them as your body adapts.
          </p>

          <div className="class-single-wrapper">
            <div
              className={
                "class-card class-card-active" +
                (showClassBurst ? " class-card-burst" : "")
              }
            >
              <div className="class-sprite-wrap">
                <img
                  src={finalSprite}
                  alt={selectedClass.finalTitle}
                  className="class-sprite"
                />
              </div>
              <div className="class-text">
                <p className="class-name">{selectedClass.finalTitle}</p>
                <p className="class-subtitle">
                  Tier 1: {selectedClass.tierOneTitle}
                </p>
                <p className="class-blurb">{selectedClass.blurb}</p>
              </div>
            </div>

            <div className="class-pager">
              <button
                type="button"
                className="pager-btn"
                onClick={goPrevClass}
              >
                ◀
              </button>
              <span className="pager-status">
                {classIndex + 1} / {CLASS_DEFS.length}
              </span>
              <button
                type="button"
                className="pager-btn"
                onClick={goNextClass}
              >
                ▶
              </button>
            </div>
          </div>

          <div className="creator-nav">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setStep("profile")}
            >
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmClass}
            >
              Confirm class
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ===== STEP: SUMMARY (CONFIRM OR RESTART) =====
  if (step === "summary") {
    return (
      <main className="patient-main">
        <section className="card">
          <div className="card-header">
            <h2>Review your character</h2>
          </div>
          <p className="card-helper">
            Check everything looks right before you confirm. You can restart if
            you want to change your vibe.
          </p>

          <div className="character-panel">
            <div className="class-sprite-wrap large">
              <img
                src={tierOneSprite}
                alt={selectedClass.tierOneTitle}
                className="class-sprite"
              />
            </div>
            <div className="character-details">
              <p className="character-nickname">
                {nickname || "Your nickname here"}
              </p>
              <p className="character-line">
                Archetype: <span>{archetype}</span>
              </p>
              <p className="character-line">
                Class: <span>{selectedClass.tierOneTitle}</span>
              </p>
              <p className="character-line">
                Focus: <span>{focus}</span>
              </p>
            </div>
          </div>

          <div className="hint-text">
            This summary won&apos;t replace real clinical notes – it&apos;s just
            how your story shows up in the app.
          </div>

          <div className="creator-nav">
            <button
              type="button"
              className="btn-secondary"
              onClick={resetCreator}
            >
              Restart character setup
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setStep("portal")}
            >
              Continue
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ===== STEP: PATIENT PORTAL (SIMILAR TO PRACTITIONER LAYOUT) =====
  return (
    <>
      <main className="app-grid patient-portal-grid">
        <section className="card patient-portal-side">
          <div className="card-header">
            <h2>Your character</h2>
          </div>

          {/* centred character on portal */}
          <div className="character-panel column portal-center">
            <div className="class-sprite-wrap large">
              <img
                src={tierOneSprite}
                alt={selectedClass.tierOneTitle}
                className="class-sprite"
              />
            </div>
            <div className="character-details">
              <p className="character-nickname">
                {nickname || (user?.name || "You")}
              </p>
              <p className="character-line">
                Class: <span>{selectedClass.tierOneTitle}</span>
              </p>
              <p className="character-line">
                Archetype: <span>{archetype}</span>
              </p>
              <p className="character-line">
                Focus: <span>{focus}</span>
              </p>
            </div>
          </div>

          <div className="xp-block">
            <div className="xp-header">
              <span className="xp-level">Level 1</span>
              <span className="xp-numbers">0 / 40 XP</span>
            </div>
            <div className="xp-bar-wrapper">
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: "0%" }} />
              </div>
            </div>
            <p className="xp-hint">
              In the full build this bar will link to your actual quests and
              programme.
            </p>
          </div>

          <div className="divider" />

          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowMessageModal(true)}
          >
            Send message to clinician
          </button>

          {messageSentHint && (
            <p className="hint-text portal-hint">{messageSentHint}</p>
          )}

          <div className="divider" />

          {/* Restart button REMOVED here on purpose */}
        </section>

        <section className="card patient-portal-main">
          <div className="card-header">
            <h2>Your rehab hub</h2>
          </div>
          <p className="card-helper">
            This is a simple preview of how your character, XP, and quests could
            show up in your real portal.
          </p>

          <div className="portal-section">
            <h3 className="section-title">Today&apos;s focus</h3>
            <p className="hint-text">
              In the real version, you&apos;ll see your key exercises, any
              outcome measures, and how they fit into your current stage.
            </p>
          </div>

          <div className="divider" />

          <div className="portal-section">
            <h3 className="section-title">Quests (example)</h3>
            <ul className="quest-list">
              <li className="quest-item">
                <span className="quest-checkbox" />
                <span>Complete your main rehab block once today.</span>
              </li>
              <li className="quest-item">
                <span className="quest-checkbox" />
                <span>Notice how your body feels before and after.</span>
              </li>
              <li className="quest-item">
                <span className="quest-checkbox" />
                <span>Do one small thing that feels like a win.</span>
              </li>
            </ul>
          </div>

          <div className="divider" />

          <p className="hint-text">
            All of this is prototype only and not medical advice – in a live
            build, it would sync directly with your clinician&apos;s programme.
          </p>
        </section>
      </main>

      {showMessageModal && (
        <div
          className="program-modal-backdrop"
          onClick={() => setShowMessageModal(false)}
        >
          <div
            className="program-modal card message-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="program-modal-header">
              <div>
                <h2>Message your clinician</h2>
                <p className="program-modal-sub">
                  This will appear in their Notifications panel (demo only).
                </p>
              </div>
              <button
                className="app-logout-button"
                onClick={() => setShowMessageModal(false)}
              >
                Close
              </button>
            </div>

            <div className="form-grid">
              <label className="form-field">
                <span className="label">Urgency</span>
                <select
                  className="input"
                  value={messageUrgency}
                  onChange={(e) => setMessageUrgency(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label className="form-field">
                <span className="label">Message</span>
                <textarea
                  className="input message-textarea"
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="e.g. My knee flared after yesterday's run..."
                />
              </label>
            </div>

            <div className="creator-nav">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowMessageModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                Send message
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== PROGRAM MODAL (PRACTITIONER SIDE) =====

function ProgramModal({ patient, onClose }) {
  if (!patient) return null;

  return (
    <div className="program-modal-backdrop" onClick={onClose}>
      <div
        className="program-modal card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="program-modal-header">
          <div>
            <h2>{patient.name}</h2>
            <p className="program-modal-sub">
              {patient.sport} · {patient.condition}
            </p>
          </div>
          <button className="app-logout-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="program-modal-tags">
          <span className="stage-pill">{patient.stage}</span>
          <span className="pill-soft">{patient.behaviourLevel}</span>
        </div>

        <div className="divider" />

        <div className="program-modal-grid">
          <div>
            <h3 className="section-title">Current daily / weekly quests</h3>
            <ul className="quest-list">
              {patient.quests.map((q, idx) => (
                <li key={idx} className="quest-item">
                  <span className="quest-checkbox" />
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="section-title">Plan adjustments</h3>
            <p className="hint-text">
              This is where you&apos;ll tweak load, add / remove quests, and
              push updated plans to the patient. For now this is just a visual
              placeholder.
            </p>

            <div className="program-adjust-placeholder">
              <div className="program-adjust-row">
                <span>Stage</span>
                <span className="pill-soft">{patient.stage}</span>
              </div>
              <div className="program-adjust-row">
                <span>Behaviour level</span>
                <span className="pill-soft">{patient.behaviourLevel}</span>
              </div>
              <div className="program-adjust-row">
                <span>Notes</span>
                <span className="pill-soft">Add clinical notes UI here</span>
              </div>
            </div>
          </div>
        </div>

        <p className="program-modal-footer">
          Changes here would eventually sync to the patient&apos;s app view and
          XP system.
        </p>
      </div>
    </div>
  );
}

// ===== NOTIFICATIONS (CLINICIAN SIDE) =====

function NotificationsCard({ notifications, onOpen }) {
  return (
    <section className="card notifications-card">
      <div className="card-header">
        <h2>Notifications</h2>
      </div>
      {(!notifications || notifications.length === 0) && (
        <p className="card-helper">No messages from patients yet.</p>
      )}
      {notifications && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={
                "notification-row" +
                (n.status === "unread" ? " notification-unread" : "")
              }
            >
              <div className="notification-main">
                <p className="notification-from">{n.from}</p>
                <p className="notification-meta">
                  {new Date(n.createdAt).toLocaleString()} ·{" "}
                  <span className={"urgency-tag urgency-" + n.urgency}>
                    {n.urgency === "high"
                      ? "High"
                      : n.urgency === "low"
                      ? "Low"
                      : "Normal"}
                  </span>
                  {n.status === "replied" && (
                    <span className="notification-status-tag">Replied</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => onOpen(n.id)}
              >
                Open
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function NotificationModal({ notification, onClose, onReply }) {
  const [replyText, setReplyText] = useState("");

  if (!notification) return null;

  const handleReply = () => {
    onReply(notification.id, replyText.trim());
    setReplyText("");
  };

  return (
    <div className="program-modal-backdrop" onClick={onClose}>
      <div
        className="program-modal card notification-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="program-modal-header">
          <div>
            <h2>Message from {notification.from}</h2>
            <p className="program-modal-sub">
              {new Date(notification.createdAt).toLocaleString()} ·{" "}
              <span className={"urgency-tag urgency-" + notification.urgency}>
                {notification.urgency === "high"
                  ? "High urgency"
                  : notification.urgency === "low"
                  ? "Low urgency"
                  : "Normal urgency"}
              </span>
            </p>
          </div>
          <button className="app-logout-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="notification-body">
          <p>{notification.message}</p>
        </div>

        <div className="divider" />

        <div className="notification-reply">
          <p className="label">Reply (stored locally – demo only)</p>
          <textarea
            className="input notification-textarea"
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
          />
          <div className="creator-nav">
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn-primary btn-small"
              onClick={handleReply}
              disabled={!replyText.trim()}
            >
              Save reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN APP =====

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("practitioner");
  const [patientData, setPatientData] = useState(initialPatients);
  const [selectedId, setSelectedId] = useState(initialPatients[0].id);

  const [xpGainKey, setXpGainKey] = useState(0);
  const [showXpGain, setShowXpGain] = useState(false);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);

  const [showProgramModal, setShowProgramModal] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [openNotificationId, setOpenNotificationId] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rehabAppUser");
      if (raw) {
        const stored = JSON.parse(raw);
        setUser(stored);
        setMode(stored.role === "patient" ? "patient" : "practitioner");
      }
    } catch (err) {
      console.error("Failed to load stored user", err);
    }
  }, []);

  const handleLogin = (profile) => {
    setUser(profile);
    setMode(profile.role === "patient" ? "patient" : "practitioner");
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("rehabAppUser");
    } catch (err) {
      console.error("Failed to clear stored user", err);
    }
    setUser(null);
  };

  const handleSendMessageFromPatient = ({ message, urgency }) => {
    if (!user) return;
    const entry = {
      id: `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      from: user.name || "Patient",
      createdAt: new Date().toISOString(),
      urgency: urgency || "normal",
      message,
      status: "unread",
    };
    setNotifications((prev) => [entry, ...prev]);
  };

  const handleOpenNotification = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: n.status === "unread" ? "read" : n.status } : n,
      ),
    );
    setOpenNotificationId(id);
  };

  const handleReplyNotification = (id, replyText) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: "replied", reply: replyText } : n,
      ),
    );
  };

  const selectedIndex = patientData.findIndex((p) => p.id === selectedId);
  const selected = selectedIndex >= 0 ? patientData[selectedIndex] : null;

  const xpPercent =
    selected && selected.xpLevel < XP_LEVEL_CAP
      ? Math.min(
          100,
          Math.round(
            (selected.xpCurrent / getXpForLevel(selected.xpLevel)) * 100,
          ),
        )
      : 100;

  const addTestXP = () => {
    if (selectedIndex < 0) return;

    setPatientData((prev) => {
      const updated = [...prev];
      const current = { ...updated[selectedIndex] };

      if (current.xpLevel >= XP_LEVEL_CAP) return prev;

      const prevLevel = current.xpLevel;

      let xp = current.xpCurrent + 25;
      let level = current.xpLevel;
      let needed = getXpForLevel(level);

      while (level < XP_LEVEL_CAP && xp >= needed) {
        xp -= needed;
        level += 1;
        if (level < XP_LEVEL_CAP) {
          needed = getXpForLevel(level);
        } else {
          xp = 0;
        }
      }

      current.xpLevel = level;
      current.xpCurrent = xp;
      updated[selectedIndex] = current;

      setShowXpGain(true);
      setXpGainKey((k) => k + 1);
      setTimeout(() => setShowXpGain(false), 1200);

      if (level > prevLevel) {
        setLevelUpKey((k) => k + 1);
        setShowLevelUpPopup(true);
        setTimeout(() => setShowLevelUpPopup(false), 1800);
      }

      return updated;
    });
  };

  if (!user) {
    return <PseudoLogin onLogin={handleLogin} />;
  }

  const openNotification =
    notifications.find((n) => n.id === openNotificationId) || null;

  return (
    <div className={"app-root" + (showLevelUpPopup ? " screen-shake" : "")}>
      <header className="app-header">
        <div className="banner-wrapper">
          <img
            src={rxhabBanner}
            alt="RxHabQuest Banner"
            className="app-banner"
          />
        </div>

        <div className="header-meta">
          <div className="mode-toggle">
            <button
              className={
                "mode-btn" +
                (mode === "practitioner" ? " mode-btn-active" : "")
              }
              onClick={() => setMode("practitioner")}
            >
              Practitioner view
            </button>
            <button
              className={
                "mode-btn" + (mode === "patient" ? " mode-btn-active" : "")
              }
              onClick={() => setMode("patient")}
            >
              Patient journey (demo)
            </button>
          </div>

          <div className="header-user-block">
            <span className="env-pill">Prototype build</span>
            <span className="header-user">
              {user.name}{" "}
              <span className="header-user-role">
                ({user.role === "patient" ? "Patient" : "Clinician"})
              </span>
            </span>
            <button className="app-logout-button" onClick={handleLogout}>
              Switch user
            </button>
          </div>
        </div>
      </header>

      {showLevelUpPopup && (
        <div key={levelUpKey} className="levelup-popup">
          <img src={levelUpImg} alt="Level up" className="levelup-img" />
        </div>
      )}

      {showLevelUpPopup && (
        <div key={"confetti-" + levelUpKey} className="confetti">
          {Array.from({ length: 18 }).map((_, i) => {
            const angle = (i / 18) * Math.PI * 2;
            const distance = 120 + Math.random() * 40;
            const x = Math.cos(angle) * distance + "px";
            const y = Math.sin(angle) * distance + "px";
            const colours = [
              "#facc15",
              "#f87171",
              "#34d399",
              "#60a5fa",
              "#fb923c",
            ];
            return (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  "--x": x,
                  "--y": y,
                  "--c": colours[i % colours.length],
                }}
              />
            );
          })}
        </div>
      )}

      {mode === "patient" && (
        <PatientFlow
          onSendMessage={handleSendMessageFromPatient}
          user={user}
        />
      )}

      {mode === "practitioner" && selected && (
        <>
          <NotificationsCard
            notifications={notifications}
            onOpen={handleOpenNotification}
          />

          <main className="app-grid">
            <section className="card patients-card">
              <div className="card-header">
                <h2>Patients</h2>
                <button className="btn-primary">+ Add new patient</button>
              </div>

              <p className="card-helper">
                Select a patient to view their current clinical stage, behaviour
                level, engagement, and XP.
              </p>

              <div className="patient-list">
                {patientData.map((p) => (
                  <button
                    key={p.id}
                    className={
                      "patient-pill" +
                      (p.id === selectedId ? " patient-pill-active" : "")
                    }
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="patient-pill-main">
                      <span className="patient-name">{p.name}</span>
                      <span className="patient-condition">
                        {p.condition}
                      </span>
                    </div>
                    <span className="patient-stage-chip">{p.stage}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="card main-card">
              <div className="card-header">
                <h2>Patient overview</h2>
                <span className="pill-soft">ID: {selected.id}</span>
              </div>

              <div className="overview-grid">
                <div>
                  <p className="label">Name</p>
                  <p>{selected.name}</p>
                </div>
                <div>
                  <p className="label">Age</p>
                  <p>{selected.age}</p>
                </div>
                <div>
                  <p className="label">Sport / activity</p>
                  <p>{selected.sport}</p>
                </div>
                <div>
                  <p className="label">Primary condition</p>
                  <p>{selected.condition}</p>
                </div>
                <div>
                  <p className="label">Phase</p>
                  <p>{selected.phase}</p>
                </div>
                <div>
                  <p className="label">Severity</p>
                  <p>{selected.severity}</p>
                </div>
              </div>

              <div className="divider" />

              <div className="notes-block">
                <p className="label">Notes</p>
                <p>{selected.notes}</p>
              </div>

              <div className="pill-row">
                <span className="stage-pill">{selected.stage}</span>
                <span className="pill-soft">
                  Stages reflect actual body progress (not XP).
                </span>
              </div>

              <p className="hint-text">{selected.stageNotes}</p>
            </section>

            <section className="card side-card">
              <div className="card-header">
                <h2>Patient snapshot</h2>
                <button
                  className="btn-secondary btn-small"
                  type="button"
                  onClick={() => setShowProgramModal(true)}
                >
                  View full programme
                </button>
              </div>

              <div className="engagement-row">
                <div>
                  <p className="label">Last login</p>
                  <p>{formatLastLogin(selected.lastLogin)}</p>
                </div>
                <div className="engagement-right">
                  <span
                    className={
                      "engagement-chip engagement-" +
                      (selected.engagement || "moderate")
                    }
                  >
                    {selected.engagement === "active"
                      ? "Active"
                      : selected.engagement === "risk"
                      ? "At risk"
                      : "Moderate"}
                  </span>

                  {selected.engagement === "risk" && (
                    <button
                      type="button"
                      className="nudge-button"
                      onClick={() =>
                        alert(
                          `Nudge sent to ${selected.name} (pseudo – notifications later)`,
                        )
                      }
                    >
                      Nudge patient
                    </button>
                  )}
                </div>
              </div>

              <div className="om-block">
                <div className="om-header">
                  <p className="label">Outcome measure trend</p>
                  {selected.outcomeTrend &&
                    selected.outcomeTrend.length > 0 && (
                      <span className="om-latest">
                        Latest:{" "}
                        {
                          selected.outcomeTrend[
                            selected.outcomeTrend.length - 1
                          ]
                        }{" "}
                        pts
                      </span>
                    )}
                </div>

                {selected.outcomeTrend &&
                selected.outcomeTrend.length > 0 ? (
                  <OutcomeMiniChart values={selected.outcomeTrend} />
                ) : (
                  <p className="hint-text">No outcome data logged yet.</p>
                )}

                <p className="hint-text">
                  Example only · hook this into your real outcome measures
                  later.
                </p>
              </div>

              <div className="divider" />

              <div className="xp-block">
                <div className="xp-header">
                  <span
                    key={levelUpKey}
                    className={
                      "xp-level" +
                      (levelUpKey > 0 ? " xp-level-flash" : "")
                    }
                  >
                    Level {selected.xpLevel}
                  </span>
                  <span className="xp-numbers">
                    {selected.xpLevel >= XP_LEVEL_CAP
                      ? "MAX LEVEL"
                      : `${selected.xpCurrent} / ${getXpForLevel(
                          selected.xpLevel,
                        )} XP`}
                  </span>
                </div>

                <div className="xp-bar-wrapper">
                  <div
                    key={levelUpKey}
                    className={
                      "xp-bar" + (levelUpKey > 0 ? " xp-bar-pulse" : "")
                    }
                  >
                    <div
                      className="xp-bar-fill"
                      style={{ width: xpPercent + "%" }}
                    />
                  </div>

                  {showXpGain && (
                    <div key={xpGainKey} className="xp-gain-float">
                      +25 XP
                    </div>
                  )}
                </div>

                <p className="xp-hint">
                  XP comes from completing weekly quests, outcome measures, and
                  streaks.
                </p>

                <button
                  className="btn-primary xp-test-btn"
                  onClick={addTestXP}
                >
                  +25 XP (Test)
                </button>
              </div>

              <div className="divider" />

              <div className="side-section-header">
                <h3>Rehab level (behaviour)</h3>
              </div>

              <div className="behaviour-level">
                <p className="behaviour-title">
                  {selected.behaviourLevel}
                </p>
                <p className="behaviour-summary">
                  {selected.behaviourSummary}
                </p>
              </div>

              <div className="divider" />

              <div className="stages-rail">
                {["Foundation", "Strength", "Power", "Athlete"].map(
                  (stage) => (
                    <div
                      key={stage}
                      className={
                        "stage-node" +
                        (stage === selected.stage
                          ? " stage-node-active"
                          : "")
                      }
                    >
                      <span>{stage}</span>
                    </div>
                  ),
                )}
              </div>
            </section>
          </main>
        </>
      )}

      {showProgramModal && (
        <ProgramModal
          patient={selected}
          onClose={() => setShowProgramModal(false)}
        />
      )}

      {openNotification && (
        <NotificationModal
          notification={openNotification}
          onClose={() => setOpenNotificationId(null)}
          onReply={handleReplyNotification}
        />
      )}
    </div>
  );
}

export default App;
