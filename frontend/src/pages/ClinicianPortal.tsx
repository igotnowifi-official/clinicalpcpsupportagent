/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useState } from "react";
import axios from "axios";
import { PatientCheckInRequest, PatientCheckInResponse } from "../types/checkin";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const PatientCheckInFlow: React.FC = () => {
  const [step, setStep] = useState<"input" | "waiting" | "error" | "done">("input");
  const [form, setForm] = useState<PatientCheckInRequest>({
    first_name: "",
    last_name: "",
    dob: "",
  });
  const [checkInResponse, setCheckInResponse] = useState<PatientCheckInResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep("waiting");
    setErrorMsg(null);
    try {
      const resp = await axios.post<PatientCheckInResponse>(`${API_BASE}/checkin`, form);
      setCheckInResponse(resp.data);
      setStep("done");
    } catch (err: any) {
      setErrorMsg(
        (err.response && err.response.data && err.response.data.detail) ||
          "Check-in failed. Please confirm your information and try again."
      );
      setStep("error");
    }
  };

  if (step === "waiting") {
    return <div className="loading-banner">Checking in...</div>;
  }

  if (step === "done" && checkInResponse) {
    return (
      <div className="checkin-success-container">
        <h2>Check-in complete!</h2>
        <p>
          Thank you, <b>{form.first_name} {form.last_name}</b>.<br />
          Please wait. A staff member will issue your intake questionnaire shortly.
        </p>
        <div className="checkin-meta">
          <div>Case ID: <code>{checkInResponse.case_id}</code></div>
          <div>Patient ID: <code>{checkInResponse.patient_id}</code></div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-checkin-form-container">
      <h2>Patient Check-In</h2>
      <form className="checkin-form" onSubmit={handleSubmit} autoComplete="off">
        <label>
          First Name
          <input
            required
            name="first_name"
            autoFocus
            value={form.first_name}
            onChange={handleChange}
            type="text"
            autoComplete="off"
            maxLength={48}
          />
        </label>
        <label>
          Last Name
          <input
            required
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            type="text"
            autoComplete="off"
            maxLength={48}
          />
        </label>
        <label>
          Date of Birth
          <input
            required
            name="dob"
            value={form.dob}
            onChange={handleChange}
            type="date"
            autoComplete="off"
            max="2099-12-31"
          />
        </label>
        {step === "error" && errorMsg && (
          <div className="error-banner">{errorMsg}</div>
        )}
        <button
          className="checkin-submit-btn"
          type="submit"
          disabled={step === "done"}
        >
          Check In
        </button>
      </form>
    </div>
  );
};

export default PatientCheckInFlow;