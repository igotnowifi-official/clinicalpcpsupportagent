// Core data contract matching backend API

export interface Issue {
    id: string;
    body_region: string;
    body_region_id: string;
    description: string;
    pain_rating: number;
    onset: 'today' | 'days' | 'weeks' | 'months';
    course: 'better' | 'worse' | 'same';
    tags: string[];
  }
  
  export interface IntakePayload {
    patient: {
      patient_id?: string;
      birthdate: string;
    };
    consent: {
      accepted: boolean;
    };
    red_flags: {
      chest_pain: boolean;
      severe_shortness_of_breath: boolean;
      fainting_or_confusion: boolean;
    };
    issues: Issue[];
    symptoms: string[];
    vitals: {
      temperature_c?: number;
      bp_systolic?: number;
      bp_diastolic?: number;
      heart_rate?: number;
      spo2?: number;
    };
    history: {
      conditions: string[];
      allergies: string[];
      medications: string;
      family_history: string[];
      social: Record<string, string>;
    };
  }
  
  export interface IntakeResponse {
    intake_id: string;
    created_at: string;
    status?: 'accepted' | 'rejected';
    missing_fields?: string[];
  }
  
  export interface TriageResult {
    intake_id: string;
    status: 'urgent' | 'non_urgent';
    red_flags_triggered: string[];
    serious_buckets: {
      hypertension_risk: boolean;
      hyperglycemia_risk: boolean;
      respiratory_risk: boolean;
    };
    differentials?: {
      condition: string;
      probability: number;
    }[];
    lab_suggestions: string[];
    referral_suggestions: string[];
    medication_suggestions?: {
      name: string;
      dosage: string;
      frequency: string;
      notes?: string;
    }[];
    lifestyle_suggestions?: {
      category: 'exercise' | 'diet' | 'sleep' | 'stress' | 'screen_time' | 'other';
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  }
  
  export interface ExplanationResult {
    intake_id: string;
    top_evidence: {
      type: string;
      description: string;
      relevance: number;
    }[];
    graph_paths: string[];
  }
  
  // Intake flow state
  export type IntakeStep = 
    | 'consent' 
    | 'red_flags' 
    | 'body_map' 
    | 'symptoms_vitals' 
    | 'history' 
    | 'review' 
    | 'complete';
  
  export interface IntakeState {
    currentStep: IntakeStep;
    payload: IntakePayload;
    intake_id?: string;
    triage_result?: TriageResult;
  }
  
  // Body map types
  export interface BodyRegion {
    id: string;
    name: string;
    path: string;
  }
  
  // Symptom categories
  export const SYMPTOM_CATEGORIES = {
    respiratory: ['cough', 'sore_throat', 'runny_nose', 'sneezing', 'shortness_of_breath'],
    general: ['fever', 'fatigue', 'headache', 'dizziness'],
    allergic: ['itchy_eyes', 'sneezing', 'runny_nose'],
    metabolic: ['polyuria', 'polydipsia', 'blurred_vision'],
  } as const;
  
  export const ALL_SYMPTOMS = [
    { id: 'fever', label: 'Fever' },
    { id: 'cough', label: 'Cough' },
    { id: 'sore_throat', label: 'Sore Throat' },
    { id: 'runny_nose', label: 'Runny Nose' },
    { id: 'sneezing', label: 'Sneezing' },
    { id: 'itchy_eyes', label: 'Itchy Eyes' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'headache', label: 'Headache' },
    { id: 'dizziness', label: 'Dizziness' },
    { id: 'polyuria', label: 'Frequent Urination (Polyuria)' },
    { id: 'polydipsia', label: 'Excessive Thirst (Polydipsia)' },
    { id: 'blurred_vision', label: 'Blurred Vision' },
    { id: 'shortness_of_breath', label: 'Shortness of Breath' },
  ] as const;
  
  export const CONDITION_OPTIONS = [
    { id: 'asthma_copd', label: 'Asthma / COPD' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'prediabetes', label: 'Prediabetes' },
    { id: 'hypertension', label: 'Hypertension (High Blood Pressure)' },
  ] as const;
  
  export const FAMILY_HISTORY_OPTIONS = [
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'hypertension', label: 'Hypertension' },
    { id: 'heart_disease', label: 'Heart Disease' },
    { id: 'cancer', label: 'Cancer' },
  ] as const;
  
  export const ISSUE_TAGS = [
    { id: 'pain', label: 'Pain' },
    { id: 'swelling', label: 'Swelling' },
    { id: 'rash', label: 'Rash' },
    { id: 'numbness', label: 'Numbness' },
    { id: 'injury', label: 'Injury' },
    { id: 'other', label: 'Other' },
  ] as const;
  
  // Initial state factory
  export const createInitialIntakePayload = (): IntakePayload => ({
    patient: {
      birthdate: '',
    },
    consent: {
      accepted: false,
    },
    red_flags: {
      chest_pain: false,
      severe_shortness_of_breath: false,
      fainting_or_confusion: false,
    },
    issues: [],
    symptoms: [],
    vitals: {},
    history: {
      conditions: [],
      allergies: [],
      medications: '',
      family_history: [],
      social: {},
    },
  });
  