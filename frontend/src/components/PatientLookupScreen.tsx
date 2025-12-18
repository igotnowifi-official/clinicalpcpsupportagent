/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

interface PatientMeta {
  patient_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  checked_in_at: string;
  case_id: string;
  status: string;
}

const PatientLookupScreen: React.FC<{ onFound: (patient: PatientMeta) => void }> = ({ onFound }) => {
  const [lookupId, setLookupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<PatientMeta | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLookupId(e.target.value);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setPatient(null);
    try {
      const resp = await axios.get(`${API_BASE}/patient/lookup/${lookupId}`);
      setPatient(resp.data);
      onFound(resp.data);
    } catch (err: any) {
      setErrorMsg(
        (err.response && err.response.data && err.response.data.detail) ||
          "Patient not found. Please check the ID and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-lookup-container">
      <h3>Lookup Patient</h3>
      <form onSubmit={handleLookup} className="patient-lookup-form">
        <label>
          Patient ID
          <input
            required
            type="text"
            name="lookup_id"
            value={lookupId}
            onChange={handleChange}
            maxLength={32}
            autoFocus
            autoComplete="off"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Looking up..." : "Lookup"}
        </button>
      </form>
      {errorMsg && <div className="error-banner">{errorMsg}</div>}
      {patient && (
        <div className="patient-lookup-result">
          <div>
            <b>{patient.first_name} {patient.last_name}</b>
          </div>
          <div>ID: <code>{patient.patient_id}</code></div>
          <div>DOB: {patient.dob}</div>
          <div>Status: <b>{patient.status}</b></div>
        </div>
      )}
    </div>
  );
};

export default PatientLookupScreen;