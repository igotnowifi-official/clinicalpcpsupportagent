/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const StaffDashboard: React.FC = () => {
  const [patients, setPatients] = useState<PatientMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // In MVP, list all current patients in memory store marked as 'waiting'
        const resp = await axios.get(`${API_BASE}/staff/patients`);
        setPatients(resp.data.patients || []);
      } catch (err: any) {
        setError(
          (err.response && err.response.data && err.response.data.detail) ||
            "Failed to load checked-in patients."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="staff-dashboard-container">
      <h2>Staff/MA Dashboard</h2>
      {loading && <div className="loading-banner">Loading...</div>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && patients.length === 0 && (
        <div className="empty-banner">No patients checked in or waiting.</div>
      )}
      {!loading && patients.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>DOB</th>
              <th>Checked In</th>
              <th>Status</th>
              <th>Case ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.patient_id}>
                <td>
                  {p.first_name} {p.last_name}
                </td>
                <td>{p.dob}</td>
                <td>
                  {p.checked_in_at
                    ? new Date(p.checked_in_at).toLocaleString()
                    : "—"}
                </td>
                <td>{p.status}</td>
                <td>{p.case_id}</td>
                <td>
                  <button
                    onClick={() =>
                      navigate(
                        `/staff/issue?patient_id=${encodeURIComponent(
                          p.patient_id
                        )}`
                      )
                    }
                  >
                    Issue Questionnaire
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <footer className="clinician-footer">
        © 2025 igotnowifi, LLC · Proprietary Clinical Software
      </footer>
    </div>
  );
};

export default StaffDashboard;