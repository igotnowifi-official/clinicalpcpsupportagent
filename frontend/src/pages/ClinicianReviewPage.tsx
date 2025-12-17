/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { IntakeQuestionnaireResponse, IntakeSession } from "../types/intake";
import { TriageResult } from "../types/triage";
import ClinicianView from "../components/ClinicianView";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const ClinicianReviewPage: React.FC = () => {
  const { session_token } = useParams<{ session_token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intake, setIntake] = useState<IntakeQuestionnaireResponse | null>(null);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [assistantActions, setAssistantActions] = useState<any[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<any[]>([]);

  useEffect(() => {
    if (!session_token) {
      setError("Session token is required.");
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch intake session
        const sessionResp = await axios.get<IntakeSession>(
          `${API_BASE}/clinician/review/${session_token}`
        );
        const session = sessionResp.data;

        if (!session.intake_data) {
          setError("Intake data not found for this session.");
          setLoading(false);
          return;
        }

        setIntake(session.intake_data);

        // Fetch triage result
        try {
          const triageResp = await axios.post<TriageResult>(
            `${API_BASE}/triage/run`,
            {
              session_token: session_token,
            }
          );
          setTriage(triageResp.data);
          setAssistantActions(triageResp.data.assistant_actions || []);
          setFollowupQuestions(triageResp.data.followup_questions || []);
        } catch (triageErr: any) {
          // Triage might not be available yet, that's okay
          console.warn("Triage not available:", triageErr);
          setAssistantActions([]);
          setFollowupQuestions([]);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            "Failed to load session data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [session_token]);

  const handleAssistantActionComplete = async (actionId: string) => {
    try {
      await axios.post(`${API_BASE}/assistant/apply`, {
        session_token: session_token,
        action_id: actionId,
      });
      // Refresh assistant actions
      if (triage) {
        setAssistantActions(
          triage.assistant_actions?.filter((a) => a.action_id !== actionId) || []
        );
      }
    } catch (err: any) {
      console.error("Failed to complete assistant action:", err);
    }
  };

  const handleFollowUpAnswer = async (questionId: string, answer: any) => {
    try {
      await axios.post(`${API_BASE}/triage/followup`, {
        session_token: session_token,
        question_id: questionId,
        answer: answer,
      });
      // Refresh follow-up questions
      if (triage) {
        setFollowupQuestions(
          triage.followup_questions?.filter((q) => q.question_id !== questionId) ||
            []
        );
      }
    } catch (err: any) {
      console.error("Failed to submit follow-up answer:", err);
    }
  };

  const handleFinalize = async () => {
    try {
      await axios.post(`${API_BASE}/clinician/finalize`, {
        session_token: session_token,
      });
      // Navigate back to dashboard or show success message
      window.location.href = "/clinician/dashboard";
    } catch (err: any) {
      console.error("Failed to finalize session:", err);
    }
  };

  if (loading) {
    return <div className="loading-banner">Loading session data...</div>;
  }

  if (error) {
    return <div className="error-banner">{error}</div>;
  }

  if (!intake) {
    return <div className="error-banner">Intake data not available.</div>;
  }

  if (!triage) {
    return (
      <div className="error-banner">
        Triage data not available. Please run triage first.
      </div>
    );
  }

  return (
    <ClinicianView
      intake={intake}
      triage={triage}
      assistantActions={assistantActions}
      followupQuestions={followupQuestions}
      onAssistantActionComplete={handleAssistantActionComplete}
      onFollowUpAnswer={handleFollowUpAnswer}
      onFinalize={handleFinalize}
    />
  );
};

export default ClinicianReviewPage;

