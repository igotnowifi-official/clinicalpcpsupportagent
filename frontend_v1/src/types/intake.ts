/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

export interface IssueCard {
    issue_id: string;
    region_id: string; // body region id
    description: string;
    pain_score?: number;
    functional_impact: 'none' | 'mild' | 'moderate' | 'severe';
    onset: string; // today/days/weeks/months
    course: string; // improving/worsening/unchanged
    triggers?: string;
    relief_factors?: string;
  }
  
  export interface Vitals {
    temperature?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    blood_pressure_systolic?: number;
    blood_pressure_diastolic?: number;
    oxygen_saturation?: number;
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    unknown?: boolean;
  }
  
  export interface SymptomEntry {
    symptom_id: string;
    present?: boolean;
    severity?: string;
    duration?: string;
    notes?: string;
  }
  
  export interface MedicationsEntry {
    med_name: string;
    med_class: string;
    reason?: string;
  }
  
  export interface AllergyEntry {
    allergen: string;
    reaction?: string;
  }
  
  export interface FamilyHistoryEntry {
    relation: string;
    condition: string;
  }
  
  export interface SocialHistory {
    tobacco?: string;
    alcohol?: string;
    drugs?: string;
    occupation?: string;
    stressors?: string;
    exercise?: string;
  }
  
  export interface RedFlagScreening {
    red_flag_id: string;
    present: boolean;
    notes?: string;
  }
  
  export interface IntakeQuestionnaireResponse {
    session_token: string;
    patient_id: string;
    issued_by: string;
    intake_mode: 'full' | 'telehealth';
    started_at: string; // ISO datetime
    submitted_at?: string; // ISO datetime
    entered_by?: string;
    reported_by?: string;
  
    chief_concern: string;
    issue_cards: IssueCard[];
    symptoms: SymptomEntry[];
    red_flags: RedFlagScreening[];
    consent_acknowledged: boolean;
    medications: MedicationsEntry[];
    allergies: AllergyEntry[];
    vitals: Vitals;
  
    pmh: string[];
    symptom_durations: { [symptom_id: string]: string | null };
    functional_impacts: { [symptom_id: string]: string | null };
    social_history: SocialHistory;
  
    ros?: { [symptom_id: string]: boolean };
    family_history?: FamilyHistoryEntry[];
    occupation?: string;
    additional_notes?: string;
  
    last_modified: string;
    source: string;
    overrides?: { [field: string]: any };
    audit_trail?: any[];
  }

  export interface IntakeSession {
    session_token: string;
    patient_id: string;
    status: 'waiting' | 'questionnaire_issued' | 'in_progress' | 'submitted' | 'completed';
    issued_by: string;
    intake_mode: 'full' | 'telehealth';
    started_at: string; // ISO datetime
    submitted_at?: string; // ISO datetime
    expires_at?: string; // ISO datetime
    intake_data?: IntakeQuestionnaireResponse;
    entered_by?: string;
    reported_by?: string;
    audit_trail?: any[];
  }