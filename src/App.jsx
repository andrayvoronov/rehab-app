import { useState, useEffect } from "react";
import "./index.css";
import wizardImg from "./assets/FF_wizard.png";
import levelUpImg from "./assets/level-up.png";
import rxhabBanner from "./assets/rxhabquest_banner.png";

const XP_LEVEL_CAP = 99;

// XP needed to go from this level → next level
function getXpForLevel(level) {
  const base = 40;
  const perLevel = 2;
  return base + perLevel * level;
}

// --- PSEUDO LOGIN COMPONENT ---

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

    localStorage.setItem("rehabAppUser", JSON.stringify(profile));
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
          {/* Role toggle */}
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

          {/* Name */}
          <div className="login-field">
            <label className="login-label">Display name</label>
            <input
              className="login-input"
              placeholder={
                role === "practitioner"
                  ? "e.g. Dr Andray"
                  : "e.g. RehabRanger27"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Optional clinic / code */}
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

// --- EXISTING DATA + COMPONENTS ---

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
  },
];

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

// Tweaked to start from welcome, now that pseudo login handles the email bit
function PatientFlow() {
  const [step, setStep] = useState("welcome");
  const [avatarArchetype, setAvatarArchetype] = useState("Runner");
  const [avatarVibe, setAvatarVibe] = useState("Calm & steady");
  const [avatarFocus, setAvatarFocus] = useState("Lower limb");

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

          <button
            className="btn-primary full-width-btn"
            onClick={() => setStep("character")}
          >
            Accept quest
          </button>
        </section>
      </main>
    );
  }

  if (step === "character") {
    return (
      <main className="patient-main">
        <section className="card">
          <div className="card-header">
            <h2>Create your rehab character</h2>
          </div>
          <p className="card-helper">
            None of this changes your clinical programme – it just gives your
            journey a face and a feel that matches you.
          </p>

          <div className="form-grid">
            <label className="form-field">
              <span className="label">Archetype</span>
              <select
                className="input"
                value={avatarArchetype}
                onChange={(e) => setAvatarArchetype(e.target.value)}
              >
                <option>Runner</option>
                <option>Lifter</option>
                <option>Grappler</option>
                <option>Everyday Hero</option>
              </select>
            </label>

            <label className="form-field">
              <span className="label">Vibe</span>
              <select
                className="input"
                value={avatarVibe}
                onChange={(e) => setAvatarVibe(e.target.value)}
              >
                <option>Calm & steady</option>
                <option>Fiery & driven</option>
                <option>Playful & curious</option>
                <option>Quietly determined</option>
              </select>
            </label>

            <label className="form-field">
              <span className="label">Main focus</span>
              <select
                className="input"
                value={avatarFocus}
                onChange={(e) => setAvatarFocus(e.target.value)}
              >
                <option>Lower limb</option>
                <option>Shoulder / upper limb</option>
                <option>Spine & core</option>
                <option>Whole body resilience</option>
              </select>
            </label>
          </div>

          <div className="character-preview">
            <div className="avatar-circle">
              <span className="avatar-initial">
                {avatarArchetype.charAt(0)}
              </span>
            </div>
            <div className="character-text">
              <p className="character-title">
                {avatarArchetype} · {avatarVibe}
              </p>
              <p className="character-sub">Focus: {avatarFocus}</p>
              <p className="hint-text">
                Later this can sync with a visual avatar, gear, and cosmetic
                unlocks as you progress.
              </p>
            </div>
          </div>

          <button
            className="btn-primary full-width-btn"
            onClick={() => setStep("portal")}
          >
            Confirm character
          </button>
        </section>
      </main>
    );
  }

  // Patient portal preview
  return (
    <main className="patient-main">
      <section className="card">
        <div className="card-header">
          <h2>Patient portal (preview)</h2>
        </div>
        <p className="card-helper">
          This is a simple mock of what a real patient view could look like
          once their character is created.
        </p>

        <div className="character-preview portal-preview">
          <div className="avatar-circle">
            <span className="avatar-initial">
              {avatarArchetype.charAt(0)}
            </span>
          </div>
          <div className="character-text">
            <p className="character-title">
              {avatarArchetype} · {avatarVibe}
            </p>
            <p className="character-sub">Focus: {avatarFocus}</p>
          </div>
        </div>

        <div className="divider" />

        <div className="portal-grid">
          <div>
            <p className="label">Today&apos;s main quest</p>
            <p>Complete your foundation block and log how your body feels.</p>
          </div>
          <div>
            <p className="label">This week</p>
            <ul className="quest-list">
              <li className="quest-item">
                <span className="quest-checkbox" />
                <span>3 × rehab sessions</span>
              </li>
              <li className="quest-item">
                <span className="quest-checkbox" />
                <span>1 × &quot;win&quot; activity that feels good</span>
              </li>
              <li className="quest-item">
                <span className="quest-checkbox" />
                <span>Log your pain and confidence once this week</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="hint-text">
          In the full build, this screen will pull your real programme, outcome
          measures, and XP from the clinician dashboard.
        </p>
      </section>
    </main>
  );
}

// --- MAIN APP ---

function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("practitioner");
  const [patientData, setPatientData] = useState(initialPatients);
  const [selectedId, setSelectedId] = useState(initialPatients[0].id);

  const [xpGainKey, setXpGainKey] = useState(0);
  const [showXpGain, setShowXpGain] = useState(false);
  const [levelUpKey, setLevelUpKey] = useState(0);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);

  // Hydrate pseudo user
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
    localStorage.removeItem("rehabAppUser");
    setUser(null);
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

      // support multiple level-ups in one hit
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

      // +25 XP floater every time
      setShowXpGain(true);
      setXpGainKey((k) => k + 1);
      setTimeout(() => setShowXpGain(false), 1200);

      // LEVEL UP popup on every level increase
      if (level > prevLevel) {
        setLevelUpKey((k) => k + 1);
        setShowLevelUpPopup(true);
        setTimeout(() => setShowLevelUpPopup(false), 1800);
      }

      return updated;
    });
  };

// If no pseudo user yet → show login screen
if (!user) {
  return (
    <div className="app-root-login">
      <PseudoLogin onLogin={handleLogin} />
    </div>
  );
}

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

      {/* LEVEL UP overlay using your pixel image */}
      {showLevelUpPopup && (
        <div key={levelUpKey} className="levelup-popup">
          <img src={levelUpImg} alt="Level up" className="levelup-img" />
        </div>
      )}

      {/* CONFETTI BURST */}
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

      {mode === "patient" && <PatientFlow />}

      {mode === "practitioner" && selected && (
        <main className="app-grid">
          {/* Left: patients list */}
          <section className="card patients-card">
            <div className="card-header">
              <h2>Patients</h2>
              <button className="btn-primary">+ Add new patient</button>
            </div>

            <p className="card-helper">
              Select a patient to view their current clinical stage, behaviour
              level, and weekly quests.
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
                    <span className="patient-condition">{p.condition}</span>
                  </div>
                  <span className="patient-stage-chip">{p.stage}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Middle: overview */}
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

          {/* Right: XP + behaviour */}
          <section className="card side-card">
            <div className="card-header">
              <h2>XP progression</h2>
            </div>

            <div className="xp-block">
              <div className="xp-header">
                <span
                  key={levelUpKey}
                  className={
                    "xp-level" + (levelUpKey > 0 ? " xp-level-flash" : "")
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

              <button className="btn-primary xp-test-btn" onClick={addTestXP}>
                +25 XP (Test)
              </button>
            </div>

            <div className="divider" />

            <div className="side-section-header">
              <h3>Rehab level (behaviour)</h3>
            </div>

            <div className="behaviour-level">
              <p className="behaviour-title">{selected.behaviourLevel}</p>
              <p className="behaviour-summary">
                {selected.behaviourSummary}
              </p>
            </div>

            <div className="divider" />

            <div className="stages-rail">
              {["Foundation", "Strength", "Power", "Athlete"].map((stage) => (
                <div
                  key={stage}
                  className={
                    "stage-node" +
                    (stage === selected.stage ? " stage-node-active" : "")
                  }
                >
                  <span>{stage}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div>
              <h3 className="section-title">Weekly quests</h3>
              <ul className="quest-list">
                {selected.quests.map((q, idx) => (
                  <li key={idx} className="quest-item">
                    <span className="quest-checkbox" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
              <p className="hint-text">
                Later this can sync with your real outcome measures and
                auto-award XP.
              </p>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
