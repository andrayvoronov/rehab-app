// src/components/PseudoLogin.jsx
import { useState } from "react";

const ROLES = [
  { id: "patient", label: "Patient" },
  { id: "clinician", label: "Clinician" },
];

export default function PseudoLogin({ onLogin }) {
  const [role, setRole] = useState("patient");
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

    // purely local, not real auth
    localStorage.setItem("rehabAppUser", JSON.stringify(profile));
    if (onLogin) onLogin(profile);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-pill">Rehab XP</span>
        </div>

        <h1 className="login-title">Enter the Rehab Realm</h1>
        <p className="login-subtitle">
          Pick your role, name your character, and we’ll load your world.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* role toggle */}
          <div className="login-field">
            <label className="login-label">Role</label>
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

          {/* name */}
          <div className="login-field">
            <label className="login-label">Display name</label>
            <input
              className="login-input"
              placeholder="e.g. Dr Andray, RehabRanger27"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* optional clinic / invite code */}
          <div className="login-field">
            <label className="login-label">
              Clinic / invite code <span className="login-label-optional">(optional)</span>
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
            Enter rehab app
          </button>

          <p className="login-disclaimer">
            Pseudo login only • No real authentication • Data stored in your browser
          </p>
        </form>
      </div>
    </div>
  );
}
