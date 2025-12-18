/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { IntakeSession } from "../types/intake";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const StaffIssueQuestionnaire: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const preselectedPatientId = params.get("patient_id") || "";

  const [step, setStep] = useState<"select" | "issuing" | "issued" | "error">("select");
  const [patientId, setPatientId] = useState(preselectedPatientId);
  const [intakeMode, setIntakeMode] = useState<"full" | "telehealth">("full");
  const [sessionInfo, setSessionInfo] = useState<IntakeSession | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Optionally, fetch checked-in patients for quick select (MVP: rely on passed param)
  // or provide a simple text input for patientId.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("issuing");
    setErrorMsg(null);
    try {
      const resp = await axios.post(`${API_BASE}/intake/issue`, {
        patient_id: patientId,
        issued_by: "staff", // In MVP: no real auth; production: use real userId
        intake_mode: intakeMode,
      });
      setSessionInfo(resp.data);
      setStep("issued");
    } catch (err: any) {
      setErrorMsg(
        (err.response && err.response.data && err.response.data.detail) ||
          "Failed to issue questionnaire. Please try again."
      );
      setStep("error");
    }
  };

  const handleGoToDashboard = () => navigate("/staff/dashboard");
  
  const handleRetry = () => {
    setStep("select");
    setErrorMsg(null);
  };

  return (
    <div className="staff-issue-questionnaire-container">
      <h2>Issue Questionnaire to Patient</h2>
      {step === "select" && (
        <form className="issue-questionnaire-form" onSubmit={handleSubmit}>
          <label>
            Patient ID
            <input
              type="text"
              required
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              maxLength={32}
              autoFocus
              autoComplete="off"
            />
          </label>
          <label>
            Questionnaire Mode
            <select
              required
              value={intakeMode}
              onChange={e => setIntakeMode(e.target.value as "full" | "telehealth")}
            >
              <option value="full">Full Clinic-Grade</option>
              <option value="telehealth">Telehealth-Short</option>
            </select>
          </label>
          <button className="issue-btn" type="submit">
            Issue Questionnaire
          </button>
        </form>
      )}
      {step === "issuing" && (
        <div className="loading-banner">Issuing questionnaire...</div>
      )}
      {step === "issued" && sessionInfo && (
        <div className="success-banner">
          <h3>Questionnaire Issued</h3>
          <p>
            <b>Patient ID:</b> {sessionInfo.patient_id}
            <br />
            <b>Session Token:</b> <code>{sessionInfo.session_token}</code>
            <br />
            <b>Mode:</b> {sessionInfo.intake_mode}
            <br />
            <b>Status:</b> {sessionInfo.status}
          </p>
          <p>
            <u>For patient intake:</u><br />
            <b>Clinic Tablet/Kiosk:</b> Visit <code>/q/{sessionInfo.session_token}</code><br />
            <b>Patient Mobile:</b> You may generate and display a QR code or send a link with the session token (not implemented in MVP).
          </p>
          <button type="button" onClick={handleGoToDashboard}>
            Return to Dashboard
          </button>
        </div>
      )}
      {step === "error" && errorMsg && (
        <div className="error-banner">
          <p>{errorMsg}</p>
          <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button type="button" onClick={handleRetry}>
              Try Again
            </button>
            <button type="button" onClick={handleGoToDashboard}>
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
      <footer className="clinician-footer">
        © 2025 igotnowifi, LLC · Proprietary Clinical Software
      </footer>
    </div>
  );
};

export default StaffIssueQuestionnaire;