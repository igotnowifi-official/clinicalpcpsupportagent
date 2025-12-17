/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";
import {
  MedicationsEntry,
  AllergyEntry,
  FamilyHistoryEntry,
  SocialHistory,
} from "../types/intake";

interface HistoryFormProps {
  medications: MedicationsEntry[];
  allergies: AllergyEntry[];
  familyHistory: FamilyHistoryEntry[];
  socialHistory: SocialHistory;
  onMedicationsChange: (meds: MedicationsEntry[]) => void;
  onAllergiesChange: (allergies: AllergyEntry[]) => void;
  onFamilyHistoryChange: (fh: FamilyHistoryEntry[]) => void;
  onSocialHistoryChange: (sh: SocialHistory) => void;
}

const HistoryForm: React.FC<HistoryFormProps> = ({
  medications,
  allergies,
  familyHistory,
  socialHistory,
  onMedicationsChange,
  onAllergiesChange,
  onFamilyHistoryChange,
  onSocialHistoryChange,
}) => {
  // Medications
  const addMedication = () => {
    onMedicationsChange([...medications, { med_name: "", med_class: "" }]);
  };
  const medFieldChange = (idx: number, field: string, value: string) => {
    const updated = medications.map((m, i) =>
      i === idx ? { ...m, [field]: value } : m
    );
    onMedicationsChange(updated);
  };

  const removeMedication = (idx: number) => {
    onMedicationsChange(medications.filter((_, i) => i !== idx));
  };

  // Allergies
  const addAllergy = () => {
    onAllergiesChange([...allergies, { allergen: "" }]);
  };
  const allergyFieldChange = (idx: number, field: string, value: string) => {
    const updated = allergies.map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    );
    onAllergiesChange(updated);
  };

  const removeAllergy = (idx: number) => {
    onAllergiesChange(allergies.filter((_, i) => i !== idx));
  };

  // Family History
  const addFamilyHistory = () => {
    onFamilyHistoryChange([...familyHistory, { relation: "", condition: "" }]);
  };
  const familyHistoryFieldChange = (
    idx: number,
    field: string,
    value: string
  ) => {
    const updated = familyHistory.map((fh, i) =>
      i === idx ? { ...fh, [field]: value } : fh
    );
    onFamilyHistoryChange(updated);
  };
  const removeFamilyHistory = (idx: number) => {
    onFamilyHistoryChange(familyHistory.filter((_, i) => i !== idx));
  };

  // Social History
  const handleSocialHistoryChange = (
    field: keyof SocialHistory,
    value: string
  ) => {
    onSocialHistoryChange({ ...socialHistory, [field]: value });
  };

  return (
    <div className="history-form">
      <h3>Medications</h3>
      <ul>
        {medications.map((med, i) => (
          <li key={i} className="medication-entry">
            <input
              type="text"
              placeholder="Medication Name"
              value={med.med_name}
              onChange={(e) => medFieldChange(i, "med_name", e.target.value)}
              maxLength={48}
              required
            />
            <input
              type="text"
              placeholder="Medication Class"
              value={med.med_class}
              onChange={(e) => medFieldChange(i, "med_class", e.target.value)}
              maxLength={48}
              required
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={med.reason || ""}
              onChange={(e) => medFieldChange(i, "reason", e.target.value)}
              maxLength={64}
            />
            <button
              type="button"
              onClick={() => removeMedication(i)}
              className="remove-btn"
              aria-label="Remove medication"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addMedication} className="add-btn">
        + Add Medication
      </button>

      <h3>Allergies</h3>
      <ul>
        {allergies.map((allergy, i) => (
          <li key={i} className="allergy-entry">
            <input
              type="text"
              placeholder="Allergen"
              value={allergy.allergen}
              onChange={(e) => allergyFieldChange(i, "allergen", e.target.value)}
              maxLength={48}
              required
            />
            <input
              type="text"
              placeholder="Reaction (optional)"
              value={allergy.reaction || ""}
              onChange={(e) => allergyFieldChange(i, "reaction", e.target.value)}
              maxLength={64}
            />
            <button
              type="button"
              onClick={() => removeAllergy(i)}
              className="remove-btn"
              aria-label="Remove allergy"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addAllergy} className="add-btn">
        + Add Allergy
      </button>

      <h3>Family History</h3>
      <ul>
        {familyHistory.map((fh, i) => (
          <li key={i} className="family-history-entry">
            <input
              type="text"
              placeholder="Relation"
              value={fh.relation}
              onChange={(e) =>
                familyHistoryFieldChange(i, "relation", e.target.value)
              }
              maxLength={32}
              required
            />
            <input
              type="text"
              placeholder="Condition"
              value={fh.condition}
              onChange={(e) =>
                familyHistoryFieldChange(i, "condition", e.target.value)
              }
              maxLength={48}
              required
            />
            <button
              type="button"
              onClick={() => removeFamilyHistory(i)}
              className="remove-btn"
              aria-label="Remove family history"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={addFamilyHistory} className="add-btn">
        + Add Family History
      </button>

      <h3>Social & Risk History</h3>
      <div className="social-history-fields">
        <label>
          Tobacco Use:
          <input
            type="text"
            value={socialHistory.tobacco || ""}
            maxLength={64}
            onChange={(e) => handleSocialHistoryChange("tobacco", e.target.value)}
            placeholder="(e.g., never, former, current, amount)"
          />
        </label>
        <label>
          Alcohol Use:
          <input
            type="text"
            value={socialHistory.alcohol || ""}
            maxLength={64}
            onChange={(e) => handleSocialHistoryChange("alcohol", e.target.value)}
            placeholder="(e.g., never, social, daily, amount)"
          />
        </label>
        <label>
          Drug Use:
          <input
            type="text"
            value={socialHistory.drugs || ""}
            maxLength={64}
            onChange={(e) => handleSocialHistoryChange("drugs", e.target.value)}
            placeholder="(e.g., never, specify if applicable)"
          />
        </label>
        <label>
          Occupation:
          <input
            type="text"
            value={socialHistory.occupation || ""}
            maxLength={64}
            onChange={(e) => handleSocialHistoryChange("occupation", e.target.value)}
            placeholder="Your occupation"
          />
        </label>
        <label>
          Stressors:
          <input
            type="text"
            value={socialHistory.stressors || ""}
            maxLength={128}
            onChange={(e) => handleSocialHistoryChange("stressors", e.target.value)}
            placeholder="(e.g., major life events, chronic stress)"
          />
        </label>
        <label>
          Exercise:
          <input
            type="text"
            value={socialHistory.exercise || ""}
            maxLength={64}
            onChange={(e) => handleSocialHistoryChange("exercise", e.target.value)}
            placeholder="(e.g., frequency/type)"
          />
        </label>
      </div>
    </div>
  );
};

export default HistoryForm;