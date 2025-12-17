/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";
import { IntakeQuestionnaireResponse } from "../types/intake";
import { TriageResult } from "../types/triage";

interface ClinicianViewProps {
  intake: IntakeQuestionnaireResponse;
  triage: TriageResult;
  assistantActions: any[];
  followupQuestions: any[];
  onAssistantActionComplete?: (actionId: string) => void;
  onFollowUpAnswer?: (questionId: string, answer: any) => void;
  onFinalize?: () => void;
}

const ClinicianView: React.FC<ClinicianViewProps> = ({
  intake,
  triage,
  assistantActions,
  followupQuestions,
  onAssistantActionComplete,
  onFollowUpAnswer,
  onFinalize,
}) => {
  return (
    <div className="clinician-view-main-container">
      <h2>Clinician Intake Review & Decision Support</h2>
      {/* Panel 1: Assistant Actions */}
      <section className="clinician-panel assistant-actions-panel">
        <h3>Assistant Actions</h3>
        {assistantActions.length === 0 ? (
          <span>No outstanding assistant actions.</span>
        ) : (
          <ul>
            {assistantActions.map((a) => (
              <li key={a.action_id}>
                {a.description}
                {!a.completed && onAssistantActionComplete && (
                  <button
                    onClick={() => onAssistantActionComplete(a.action_id)}
                    className="assistant-action-complete-btn"
                  >
                    Complete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Panel 2: Follow-up Questions */}
      <section className="clinician-panel followup-questions-panel">
        <h3>Follow-Up Questions</h3>
        {followupQuestions.length === 0 ? (
          <span>No additional follow-up questions suggested.</span>
        ) : (
          <ul>
            {followupQuestions.map((fq) => (
              <li key={fq.question_id}>
                <span>
                  <b>{fq.description}</b>
                </span>
                {onFollowUpAnswer &&
                  (fq.field_type === "string" ? (
                    <input
                      type="text"
                      onBlur={(e) =>
                        onFollowUpAnswer(fq.question_id, e.target.value)
                      }
                      disabled={!!fq.answer}
                    />
                  ) : fq.field_type === "boolean" ? (
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        onFollowUpAnswer(fq.question_id, e.target.checked)
                      }
                      checked={!!fq.answer}
                      disabled={!!fq.answer}
                    />
                  ) : null)}
              </li>
            ))}
          </ul>
        )}
      </section>
      {/* Panel 3: Suggested Diagnoses (Differential) */}
      <section className="clinician-panel diff-panel">
        <h3>Suggested Diagnoses (Differential)</h3>
        <ol>
          {triage.top_5_conditions.map((cond, idx) => (
            <li key={cond.condition_id}>
              <span>
                <b>{cond.condition_name}</b>
                {" - "}
                Probability: {(cond.probability * 100).toFixed(1)}% (
                {cond.confidence_label})
                {cond.triggered_red_flag && (
                  <span className="red-flag-label"> – Red Flag</span>
                )}
              </span>
              {cond.notes && <div className="note">{cond.notes}</div>}
            </li>
          ))}
        </ol>
      </section>
      {/* Panel 4: Triage Summary */}
      <section className="clinician-panel triage-summary-panel">
        <h3>Triage Summary</h3>
        <p>
          <b>{triage.triage_summary.acuity.toUpperCase()}</b>:{" "}
          {triage.triage_summary.summary}
        </p>
        {triage.triage_summary.red_flags.length > 0 && (
          <div className="red-flag-alert">
            Red flags: {triage.triage_summary.red_flags.join(", ")}
          </div>
        )}
        {triage.triage_summary.major_anomalies.length > 0 && (
          <div className="anomaly-alert">
            Anomalies: {triage.triage_summary.major_anomalies.join("; ")}
          </div>
        )}
      </section>
      {/* Panel 5: Suggestions */}
      <section className="clinician-panel suggestions-panel">
        <h3>Suggestions (Orders, Guides, Actions)</h3>
        <ul>
          {triage.suggestions.map((s, idx) => (
            <li key={s.suggestion_id + "-" + idx}>
              {s.suggestion_type.toUpperCase()}: {s.description}
            </li>
          ))}
        </ul>
      </section>
      {/* Panel 6: Clinical Wrap-Up */}
      <section className="clinician-panel wrapup-panel">
        <h3>Clinical Wrap-Up</h3>
        <button className="finalize-btn" type="button" onClick={onFinalize}>
          Finalize Diagnosis & Plan
        </button>
      </section>
      {/* Panel 7: Draft Patient Communication */}
      <section className="clinician-panel message-draft-panel">
        <h3>Draft Patient Communication</h3>
        <div>
          {triage.patient_communication_draft || "No message drafted yet."}
        </div>
      </section>
      {/* Panel 8: Notes & Timeline */}
      <section className="clinician-panel audit-panel">
        <h3>Notes & Timeline</h3>
        <div>
          {Array.isArray(intake.audit_trail) && intake.audit_trail.length > 0 ? (
            <ul>
              {intake.audit_trail.map((log, i) => (
                <li key={i}>
                  [{log.at}] {log.event_type} {log.field ? `(Field: ${log.field})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <span>No timeline events.</span>
          )}
        </div>
      </section>
      <footer className="clinician-footer">
        © 2025 igotnowifi, LLC · Proprietary Clinical Software
      </footer>
    </div>
  );
};

export default ClinicianView;