/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";
import { SymptomEntry, Vitals } from "../types/intake";

interface SymptomListItem {
  symptom_id: string;
  text: string;
}

interface SymptomsVitalsFormProps {
  symptoms: SymptomEntry[];
  onSymptomsChange: (symptoms: SymptomEntry[]) => void;
  vitals: Vitals;
  onVitalsChange: (vitals: Vitals) => void;
  symptomList: SymptomListItem[];
}

const SymptomsVitalsForm: React.FC<SymptomsVitalsFormProps> = ({
  symptoms,
  onSymptomsChange,
  vitals,
  onVitalsChange,
  symptomList,
}) => {
  const handleSymptomChange = (symptomId: string, field: keyof SymptomEntry, value: any) => {
    const updated = symptoms.map(s =>
      s.symptom_id === symptomId ? { ...s, [field]: value } : s
    );
    onSymptomsChange(updated);
  };

  const handleVitalChange = (field: keyof Vitals, value: any) => {
    onVitalsChange({ ...vitals, [field]: value });
  };

  return (
    <div className="symptoms-vitals-form">
      <div className="symptoms-section">
        <h3>Symptoms</h3>
        {symptomList.map(symptom => {
          const symptomEntry = symptoms.find(s => s.symptom_id === symptom.symptom_id) || {
            symptom_id: symptom.symptom_id,
            present: false,
          };
          return (
            <label key={symptom.symptom_id} className="symptom-checkbox">
              <input
                type="checkbox"
                checked={symptomEntry.present || false}
                onChange={e => {
                  if (e.target.checked) {
                    if (!symptomEntry.symptom_id) {
                      onSymptomsChange([...symptoms, { symptom_id: symptom.symptom_id, present: true }]);
                    } else {
                      handleSymptomChange(symptom.symptom_id, "present", true);
                    }
                  } else {
                    handleSymptomChange(symptom.symptom_id, "present", false);
                  }
                }}
              />
              {symptom.text}
            </label>
          );
        })}
      </div>

      <div className="vitals-section">
        <h3>Vital Signs</h3>
        <div className="vitals-grid">
          <label>
            Temperature (°C)
            <input
              type="number"
              step="0.1"
              value={vitals.temperature ?? ""}
              onChange={e => handleVitalChange("temperature", e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </label>
          <label>
            Heart Rate (bpm)
            <input
              type="number"
              value={vitals.heart_rate ?? ""}
              onChange={e => handleVitalChange("heart_rate", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </label>
          <label>
            Respiratory Rate (per min)
            <input
              type="number"
              value={vitals.respiratory_rate ?? ""}
              onChange={e => handleVitalChange("respiratory_rate", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </label>
          <label>
            Blood Pressure (Systolic)
            <input
              type="number"
              value={vitals.blood_pressure_systolic ?? ""}
              onChange={e => handleVitalChange("blood_pressure_systolic", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </label>
          <label>
            Blood Pressure (Diastolic)
            <input
              type="number"
              value={vitals.blood_pressure_diastolic ?? ""}
              onChange={e => handleVitalChange("blood_pressure_diastolic", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </label>
          <label>
            Oxygen Saturation (%)
            <input
              type="number"
              value={vitals.oxygen_saturation ?? ""}
              onChange={e => handleVitalChange("oxygen_saturation", e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </label>
          <label>
            Height (cm)
            <input
              type="number"
              step="0.1"
              value={vitals.height_cm ?? ""}
              onChange={e => handleVitalChange("height_cm", e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </label>
          <label>
            Weight (kg)
            <input
              type="number"
              step="0.1"
              value={vitals.weight_kg ?? ""}
              onChange={e => handleVitalChange("weight_kg", e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </label>
        </div>
        <label className="vitals-unknown">
          <input
            type="checkbox"
            checked={vitals.unknown || false}
            onChange={e => handleVitalChange("unknown", e.target.checked)}
          />
          Vitals not available
        </label>
      </div>
    </div>
  );
};

export default SymptomsVitalsForm;
