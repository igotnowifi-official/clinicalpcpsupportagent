/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useState } from "react";
import { IntakeQuestionnaireResponse, IssueCard, MedicationsEntry, AllergyEntry, FamilyHistoryEntry, SocialHistory, SymptomEntry, Vitals } from "../types/intake";
import BodyMap, { BodyRegionId } from "./BodyMap";
import ConsentScreen from "./ConsentScreen";
import IssueCardComponent from "./IssueCard";
import SymptomsVitalsForm from "./SymptomsVitalsForm";
import HistoryForm from "./HistoryForm";
import IntakeCompleteScreen from "./IntakeCompleteScreen";

type QuestionnaireMode = "full" | "telehealth";

interface IntakeQuestionnaireFormProps {
  sessionMeta: any;
  sessionToken: string;
  mode: QuestionnaireMode;
  questionnaire: any[];
  branchRules: any[];
  symptomMap: any[];
  onSubmit: (data: IntakeQuestionnaireResponse) => void;
  patientView: boolean;
}

const defaultVitals: Vitals = {
  temperature: undefined,
  heart_rate: undefined,
  respiratory_rate: undefined,
  blood_pressure_systolic: undefined,
  blood_pressure_diastolic: undefined,
  oxygen_saturation: undefined,
  height_cm: undefined,
  weight_kg: undefined,
  bmi: undefined,
  unknown: false,
};

const IntakeQuestionnaireForm: React.FC<IntakeQuestionnaireFormProps> = ({
  sessionMeta,
  sessionToken,
  mode,
  questionnaire,
  branchRules,
  symptomMap,
  onSubmit,
  patientView,
}) => {
  // Progression state
  const [step, setStep] = useState<
    | "consent"
    | "chief_concern"
    | "bodymap"
    | "issues"
    | "symptoms"
    | "red_flags"
    | "vitals"
    | "meds_allergies"
    | "history"
    | "review"
    | "complete"
  >("consent");

  // State for all fields
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [chiefConcern, setChiefConcern] = useState("");
  const [bodyMapView, setBodyMapView] = useState<"front" | "back">("front");
  const [issueCards, setIssueCards] = useState<IssueCard[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>(
    symptomMap.map((s: any) => ({
      symptom_id: s.symptom_id,
      present: false,
      severity: "",
      duration: "",
      notes: "",
    }))
  );
  const [redFlags, setRedFlags] = useState<{ red_flag_id: string; present: boolean; notes?: string }[]>(
    (questionnaire || []).filter((q) => q.type === "red_flag").map((q) => ({
      red_flag_id: q.id,
      present: false,
      notes: "",
    }))
  );
  const [medications, setMedications] = useState<MedicationsEntry[]>([]);
  const [allergies, setAllergies] = useState<AllergyEntry[]>([]);
  const [vitals, setVitals] = useState<Vitals>({ ...defaultVitals });
  const [pmh, setPmh] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistoryEntry[]>([]);
  const [socialHistory, setSocialHistory] = useState<SocialHistory>({});
  const [ros, setRos] = useState<{ [symptom_id: string]: boolean }>({});
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Consent logic
  if (step === "consent") {
    return (
      <ConsentScreen
        consentAcknowledged={consentAcknowledged}
        onAcknowledge={() => {
          setConsentAcknowledged(true);
          setStep("chief_concern");
        }}
        onDecline={() => setErrorBanner("Consent required to proceed.")}
      />
    );
  }

  // Chief Concern
  if (step === "chief_concern") {
    return (
      <div className="chief-concern-page">
        <h2>Chief Concern</h2>
        <label>
          What is the main reason for your visit today?
          <input
            type="text"
            value={chiefConcern}
            onChange={e => setChiefConcern(e.target.value)}
            maxLength={80}
            autoFocus
            required
          />
        </label>
        <div className="form-nav-row">
          <button
            type="button"
            className="next-btn"
            disabled={!chiefConcern.trim()}
            onClick={() => setStep("bodymap")}
          >
            Next: Select Body Region
          </button>
        </div>
      </div>
    );
  }

  // Body Map
  if (step === "bodymap") {
    return (
      <div className="bodymap-section">
        <h2>Body Map</h2>
        <BodyMap
          view={bodyMapView}
          onSelectRegion={(regionId: BodyRegionId) => {
            // Add issue card for new region if not present
            if (!issueCards.find(ic => ic.region_id === regionId)) {
              setIssueCards([
                ...issueCards,
                {
                  issue_id: `issue_${Date.now()}_${regionId}`,
                  region_id: regionId,
                  description: "",
                  pain_score: 0,
                  functional_impact: "none",
                  onset: "",
                  course: "",
                  triggers: "",
                  relief_factors: "",
                },
              ]);
            }
          }}
          selectedRegions={issueCards.map(ic => ic.region_id as BodyRegionId)}
        />
        <div className="bodymap-toggle">
          <button
            type="button"
            onClick={() => setBodyMapView(view => (view === "front" ? "back" : "front"))}
          >
            {bodyMapView === "front" ? "Switch to Back" : "Switch to Front"}
          </button>
        </div>
        <div className="form-nav-row">
          <button type="button" className="next-btn" onClick={() => setStep("issues")}>
            Next: Describe Issues
          </button>
        </div>
      </div>
    );
  }

  // Issue Cards
  if (step === "issues") {
    return (
      <div className="issuecards-section">
        <h2>Describe Issues in Selected Regions</h2>
        {issueCards.map((issue, idx) => (
          <IssueCardComponent
            key={issue.issue_id}
            issue={issue}
            onChange={updated =>
              setIssueCards([
                ...issueCards.slice(0, idx),
                updated,
                ...issueCards.slice(idx + 1),
              ])
            }
            onRemove={() =>
              setIssueCards(issueCards.filter((_, i) => i !== idx))
            }
          />
        ))}
        {issueCards.length === 0 && (
          <div className="empty-banner">
            Select at least one region to report an issue.
          </div>
        )}
        <div className="form-nav-row">
          <button
            type="button"
            className="prev-btn"
            onClick={() => setStep("bodymap")}
          >
            Back
          </button>
          <button
            type="button"
            className="next-btn"
            disabled={issueCards.length === 0}
            onClick={() => setStep("symptoms")}
          >
            Next: Symptoms
          </button>
        </div>
      </div>
    );
  }

  // Symptoms
  if (step === "symptoms") {
    // Only show non-branching list for MVP; real logic: use questionnaire and branchRules
    return (
      <div className="symptoms-section">
        <h2>Symptoms Checklist</h2>
        <SymptomsVitalsForm
          symptoms={symptoms}
          onSymptomsChange={setSymptoms}
          vitals={vitals}
          onVitalsChange={setVitals}
          symptomList={symptomMap.map(sm => ({
            symptom_id: sm.symptom_id,
            text: sm.text || sm.symptom_id,
          }))}
        />
        <div className="form-nav-row">
          <button type="button" className="prev-btn" onClick={() => setStep("issues")}>
            Back
          </button>
          <button type="button" className="next-btn" onClick={() => setStep("red_flags")}>
            Next: Red Flag Screening
          </button>
        </div>
      </div>
    );
  }

  // Red Flags
  if (step === "red_flags") {
    return (
      <div className="redflags-section">
        <h2>Red Flag Screening</h2>
        <ul>
          {redFlags.map((rf, idx) => (
            <li key={rf.red_flag_id}>
              <label>
                <input
                  type="checkbox"
                  checked={!!rf.present}
                  onChange={e => {
                    const updated = { ...rf, present: e.target.checked };
                    setRedFlags([
                      ...redFlags.slice(0, idx),
                      updated,
                      ...redFlags.slice(idx + 1),
                    ]);
                  }}
                />
                {rf.red_flag_id.split("_").join(" ")}
              </label>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={rf.notes || ""}
                onChange={e => {
                  const updated = { ...rf, notes: e.target.value };
                  setRedFlags([
                    ...redFlags.slice(0, idx),
                    updated,
                    ...redFlags.slice(idx + 1),
                  ]);
                }}
              />
            </li>
          ))}
        </ul>
        <div className="form-nav-row">
          <button
            type="button"
            className="prev-btn"
            onClick={() => setStep("symptoms")}
          >
            Back
          </button>
          <button
            type="button"
            className="next-btn"
            onClick={() => setStep("meds_allergies")}
          >
            Next: Medications & Allergies
          </button>
        </div>
      </div>
    );
  }

  // Medications & Allergies
  if (step === "meds_allergies") {
    return (
      <div className="meds-allergies-section">
        <h2>Medications & Allergies</h2>
        <HistoryForm
          medications={medications}
          allergies={allergies}
          familyHistory={familyHistory}
          socialHistory={socialHistory}
          onMedicationsChange={setMedications}
          onAllergiesChange={setAllergies}
          onFamilyHistoryChange={setFamilyHistory}
          onSocialHistoryChange={setSocialHistory}
        />
        <div className="form-nav-row">
          <button
            type="button"
            className="prev-btn"
            onClick={() => setStep("red_flags")}
          >
            Back
          </button>
          <button
            type="button"
            className="next-btn"
            onClick={() => setStep("history")}
          >
            Next: Medical/Social History
          </button>
        </div>
      </div>
    );
  }

  // Medical & Social History (+ROS/Tier-3)
  if (step === "history") {
    return (
      <div className="history-section">
        <h2>Medical & Social History</h2>
        <label>
          Past Medical History (PMH)
          <input
            type="text"
            value={pmh.join(", ")}
            onChange={(e) =>
              setPmh(
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter((v) => v.length > 0)
              )
            }
            placeholder="List conditions separated by commas"
          />
        </label>
        {/* Optional additional ROS and notes fields */}
        <label>
          Additional Notes (optional)
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            maxLength={400}
          />
        </label>
        <div className="form-nav-row">
          <button
            type="button"
            className="prev-btn"
            onClick={() => setStep("meds_allergies")}
          >
            Back
          </button>
          <button
            type="button"
            className="next-btn"
            onClick={() => setStep("review")}
          >
            Review & Submit
          </button>
        </div>
      </div>
    );
  }

  // REVIEW
  if (step === "review") {
    const canSubmit =
      consentAcknowledged &&
      !!chiefConcern &&
      issueCards.length > 0 &&
      symptoms.some((s) => s.present) &&
      redFlags.length > 0 &&
      medications !== undefined &&
      allergies !== undefined &&
      vitals !== undefined;
    return (
      <div className="review-section">
        <h2>Review Your Answers</h2>
        {/* Show summary of required fields. In production: render everything with edit buttons. */}
        <div>
          <b>Chief Concern:</b> {chiefConcern}
        </div>
        <div>
          <b>Body Regions/Issue Cards:</b>
          <ul>
            {issueCards.map((ic) => (
              <li key={ic.issue_id}>
                <b>{ic.region_id}</b>:
                {ic.description ? ` ${ic.description}` : ""}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <b>Medications:</b>{" "}
          {medications.length > 0
            ? medications.map((m) => m.med_name).join(", ")
            : "—"}
        </div>
        <div>
          <b>Allergies:</b>{" "}
          {allergies.length > 0
            ? allergies.map((a) => a.allergen).join(", ")
            : "—"}
        </div>
        <div>
          <b>Past Medical History:</b>{" "}
          {pmh.length > 0 ? pmh.join(", ") : "—"}
        </div>
        <div>
          <b>Additional Notes:</b> {additionalNotes || "—"}
        </div>
        <div className="form-nav-row">
          <button
            type="button"
            className="prev-btn"
            onClick={() => setStep("history")}
          >
            Back
          </button>
          <button
            className="submit-btn"
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              // Compose result object
              const now = new Date();
              const submission: IntakeQuestionnaireResponse = {
                session_token: sessionToken,
                patient_id: sessionMeta.patient_id,
                issued_by: sessionMeta.issued_by,
                intake_mode: mode,
                started_at: sessionMeta.started_at,
                submitted_at: now.toISOString(),
                entered_by: undefined,
                reported_by: undefined,
                chief_concern: chiefConcern,
                issue_cards: issueCards,
                symptoms: symptoms,
                red_flags: redFlags,
                consent_acknowledged: consentAcknowledged,
                medications: medications,
                allergies: allergies,
                vitals: vitals,
                pmh: pmh,
                symptom_durations: Object.fromEntries(
                  symptoms.map((s) => [s.symptom_id, s.duration || null])
                ),
                functional_impacts: Object.fromEntries(
                  symptoms.map((s) => [s.symptom_id, s.severity || null])
                ),
                social_history: socialHistory,
                ros,
                family_history: familyHistory,
                occupation: socialHistory.occupation,
                additional_notes: additionalNotes,
                last_modified: now.toISOString(),
                source: "patient",
                overrides: {},
                audit_trail: [],
              };
              onSubmit(submission);
              setStep("complete");
            }}
          >
            Submit Questionnaire
          </button>
        </div>
      </div>
    );
  }

  // COMPLETE/THANK YOU
  if (step === "complete") {
    return <IntakeCompleteScreen />;
  }

  // Default fail
  return (
    <div className="intake-form-error">
      <div>Error in intake questionnaire flow.</div>
      {errorBanner && <div className="error-banner">{errorBanner}</div>}
    </div>
  );
};

export default IntakeQuestionnaireForm;