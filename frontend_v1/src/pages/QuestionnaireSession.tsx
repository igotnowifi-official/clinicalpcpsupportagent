/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IntakeQuestionnaireResponse } from "../types/intake";
import axios from "axios";

// Import UI components/renderers as needed
import IntakeQuestionnaireForm from "../components/IntakeQuestionnaireForm";
import SubmissionThankYou from "../components/SubmissionThankYou";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

type QuestionnaireMode = "full" | "telehealth";

const QuestionnaireSession: React.FC = () => {
  const { session_token } = useParams<{ session_token: string }>();
  const [loading, setLoading] = useState(true);
  const [sessionMeta, setSessionMeta] = useState<any>(null);
  const [mode, setMode] = useState<QuestionnaireMode>("full");
  const [questionnaire, setQuestionnaire] = useState<any[]>([]);
  const [branchRules, setBranchRules] = useState<any[]>([]);
  const [symptomMap, setSymptomMap] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [intakeSession, setIntakeSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load session metadata
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resp = await axios.get(`${API_BASE}/intake/session/${session_token}`);
        setSessionMeta(resp.data);
        setMode(resp.data.intake_mode === "telehealth" ? "telehealth" : "full");
        setIntakeSession(resp.data);
      } catch (err: any) {
        setError("Session not found or expired.");
      } finally {
        setLoading(false);
      }
    })();
  }, [session_token]);

  // Load questionnaire, rules, etc from knowledge pack-driven backend endpoints
  useEffect(() => {
    if (!mode) return;
    (async () => {
      try {
        const [qRes, branchRes, mapRes] = await Promise.all([
          axios.get(`${API_BASE}/questionnaire/intake?mode=${mode}`),
          axios.get(`${API_BASE}/questionnaire/branch_rules`),
          axios.get(`${API_BASE}/questionnaire/symptom_map`),
        ]);
        setQuestionnaire(qRes.data.questionnaire);
        setBranchRules(branchRes.data.branch_rules);
        setSymptomMap(mapRes.data.symptom_map);
      } catch (err) {
        setError("Failed to load questionnaire.");
      }
    })();
  }, [mode]);

  // Submission handler — patient flow
  const handleSubmit = async (data: IntakeQuestionnaireResponse) => {
    try {
      await axios.post(`${API_BASE}/intake/submit`, data);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response && err.response.data && err.response.data.detail
        ? err.response.data.detail
        : "Submission error");
    }
  };

  if (loading) {
    return <div className="loading-banner">Loading...</div>;
  }
  if (error) {
    return <div className="error-banner">{error}</div>;
  }
  if (submitted) {
    // Thank you, please return device!
    return <SubmissionThankYou />;
  }
  if (!sessionMeta || !questionnaire) {
    return <div className="error-banner">Unable to load questionnaire.</div>;
  }

  return (
    <div className="questionnaire-session-container">
      <IntakeQuestionnaireForm
        sessionMeta={sessionMeta}
        sessionToken={session_token!}
        mode={mode}
        questionnaire={questionnaire}
        branchRules={branchRules}
        symptomMap={symptomMap}
        onSubmit={handleSubmit}
        patientView={true}
      />
    </div>
  );
};

export default QuestionnaireSession;