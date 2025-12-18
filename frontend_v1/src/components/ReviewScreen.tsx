/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";
import { IntakeQuestionnaireResponse } from "../types/intake";

interface ReviewScreenProps {
  intake: IntakeQuestionnaireResponse;
  anomalies?: string[];
  missingTier2?: string[];
  redFlags?: string[];
  onEditField?: (field: string) => void;
  onFinalize: () => void;
  clinicianView?: boolean;
}

const humanizeField = (field: string) =>
  field
    .replace(/_/g, " ")
    .replace(/\b(\w)/g, (s) => s.toUpperCase());

const ReviewScreen: React.FC<ReviewScreenProps> = ({
  intake,
  anomalies = [],
  missingTier2 = [],
  redFlags = [],
  onEditField,
  onFinalize,
  clinicianView = false,
}) => {
  return (
    <div className="review-screen-container">
      <h2>Review Intake Questionnaire</h2>
      {redFlags.length > 0 && (
        <div className="alert red-flag-alert">
          <b>Red Flags Detected:</b>
          <ul>
            {redFlags.map((rf, i) => (
              <li key={i}>{rf}</li>
            ))}
          </ul>
        </div>
      )}

      {anomalies.length > 0 && (
        <div className="alert anomaly-alert">
          <b>Possible anomalies or contradictions:</b>
          <ul>
            {anomalies.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {missingTier2.length > 0 && (
        <div className="alert missing-data-alert">
          <b>Missing Tier-2 Information:</b>
          <ul>
            {missingTier2.map((f, i) => (
              <li key={i}>{humanizeField(f)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="review-fields-group">
        <div>
          <b>Chief Concern:</b>{" "}
          {intake.chief_concern}
          {onEditField && (
            <button type="button" onClick={() => onEditField("chief_concern")}>
              Edit
            </button>
          )}
        </div>
        <div>
          <b>Issue Cards:</b>
          <ul>
            {(intake.issue_cards || []).map((card, idx) => (
              <li key={card.issue_id || idx}>
                {humanizeField(card.region_id)}:
                <span> {card.description}</span>
                {onEditField && (
                  <button
                    type="button"
                    onClick={() => onEditField(`issue_cards.${idx}`)}
                  >
                    Edit
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <b>Medications:</b>{" "}
          {(intake.medications || [])
            .map((m) => m.med_name + (m.med_class ? ` (${m.med_class})` : ""))
            .join(", ")}
        </div>
        <div>
          <b>Allergies:</b>{" "}
          {(intake.allergies || [])
            .map((a) => a.allergen + (a.reaction ? ` (${a.reaction})` : ""))
            .join(", ")}
        </div>
        <div>
          <b>Social History:</b>{" "}
          {Object.entries(intake.social_history || {})
            .map(([k, v]) => `${humanizeField(k)}: ${v}`)
            .join("; ")}
        </div>
        <div>
          <b>Notes/Last-minute:</b> {intake.additional_notes || "—"}
        </div>
        {/* Add additional review as required by intake fields */}
      </div>
      <div className="finalize-row">
        <button className="finalize-btn" type="button" onClick={onFinalize}>
          Finalize and Continue
        </button>
      </div>
      {clinicianView && (
        <footer className="clinician-review-footer">
          © 2025 igotnowifi, LLC · Proprietary Clinical Software
        </footer>
      )}
    </div>
  );
};

export default ReviewScreen;