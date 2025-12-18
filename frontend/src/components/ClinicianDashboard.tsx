/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useEffect, useState } from "react";
import { IntakeSession } from "../types/intake";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const ClinicianDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<IntakeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await axios.get(`${API_BASE}/clinician/dashboard`);
        setSessions(resp.data);
      } catch (err: any) {
        setError("Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="clinician-dashboard-container">
      <h2>Clinician Dashboard</h2>
      {loading && <div className="loading-banner">Loading...</div>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && sessions.length === 0 && (
        <div className="empty-banner">No active sessions.</div>
      )}
      {!loading && sessions.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Started At</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.session_token}>
                <td>
                  {session.patient_id}
                  {/* Ideally replace with patient lookup for name */}
                </td>
                <td>
                  {session.started_at
                    ? new Date(session.started_at).toLocaleString()
                    : "—"}
                </td>
                <td>{session.status}</td>
                <td>{session.intake_mode}</td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/clinician/review/${session.session_token}`)
                    }
                  >
                    Review
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/clinician/assistant/${session.session_token}`)
                    }
                  >
                    Assistant/Follow-ups
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/clinician/wrapup/${session.session_token}`)
                    }
                  >
                    Wrap-up
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/clinician/message/${session.session_token}`)
                    }
                  >
                    Message
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

export default ClinicianDashboard;