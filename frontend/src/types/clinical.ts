// Clinical wrap-up and messaging types

// Enhanced differential with evidence
export interface DifferentialDiagnosis {
    condition_id: string;
    condition_name: string;
    probability: number; // 0-100
    confidence: 'high' | 'medium' | 'low';
    evidence_count: number;
    evidence: {
      description: string;
      type: 'symptom' | 'vital' | 'history' | 'body_region';
    }[];
    missing_evidence: string[];
    suggested_labs: string[];
    suggested_referrals: string[];
    suggested_meds: string[];
    suggested_actions: string[];
  }
  
  // Patient guides
  export interface PatientGuide {
    guide_id: string;
    title: string;
    filename: string;
    category: 'education' | 'exercise' | 'ergonomics' | 'followup' | 'safety' | 'medication_info';
    description: string;
  }
  
  // Message template
  export interface MessageTemplate {
    template_id: string;
    name: string;
    subject_template: string;
    body_template: string;
  }
  
  // Finalization data
  export interface Finalization {
    final_diagnosis_condition_id?: string;
    final_diagnosis_free_text?: string;
    final_labs: { lab_id: string; notes: string }[];
    final_referrals: { specialist_id: string; notes: string }[];
    final_medication_options: { med_id: string; notes: string }[];
    final_actions: { action_id: string; notes: string }[];
    followup: {
      timeframe: string;
      instructions: string;
    };
    patient_notes: string;
  }
  
  // Message draft
  export interface MessageDraft {
    draft_id: string;
    created_at: string;
    recipients: {
      to: string[];
      cc: string[];
      bcc: string[];
    };
    subject: string;
    body: string;
    attachments: {
      attachment_id: string;
      filename: string;
    }[];
    status: 'draft' | 'queued' | 'sent_mock' | 'sent';
  }
  
  // Recipient routing
  export interface RecipientRouting {
    patient_email?: string;
    admin_email?: string;
    pharmacist_email?: string;
    lab_email?: string;
    specialist_email?: string;
    other_emails: string[];
  }
  
  // Extended triage with differential
  export interface ExtendedTriageResult {
    intake_id: string;
    status: 'urgent' | 'non_urgent';
    red_flags_triggered: string[];
    is_overridden_by_redflag: boolean;
    override_reason?: string;
    serious_buckets: {
      hypertension_risk: boolean;
      hyperglycemia_risk: boolean;
      respiratory_risk: boolean;
    };
    differential: DifferentialDiagnosis[];
    lab_suggestions: string[];
    referral_suggestions: string[];
    medication_suggestions?: {
      med_id: string;
      name: string;
      dosage: string;
      frequency: string;
      notes?: string;
    }[];
    lifestyle_suggestions?: {
      action_id: string;
      category: 'exercise' | 'diet' | 'sleep' | 'stress' | 'screen_time' | 'other';
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  }
  
  // All 30 conditions for final diagnosis selection
  export const ALL_CONDITIONS = [
    { id: 'migraine_possible', name: 'Migraine (Possible)' },
    { id: 'tension_headache', name: 'Tension Headache' },
    { id: 'cluster_headache', name: 'Cluster Headache' },
    { id: 'allergic_rhinitis', name: 'Allergic Rhinitis' },
    { id: 'viral_uri', name: 'Viral Upper Respiratory Infection' },
    { id: 'flu_like_illness', name: 'Flu-like Illness' },
    { id: 'sinusitis', name: 'Sinusitis' },
    { id: 'bronchitis', name: 'Bronchitis' },
    { id: 'pneumonia_possible', name: 'Pneumonia (Possible)' },
    { id: 'asthma_exacerbation', name: 'Asthma Exacerbation' },
    { id: 'copd_exacerbation', name: 'COPD Exacerbation' },
    { id: 'hypertension_risk', name: 'Hypertension Risk' },
    { id: 'hypertensive_crisis', name: 'Hypertensive Crisis' },
    { id: 'type2_diabetes_risk', name: 'Type 2 Diabetes Risk' },
    { id: 'hypoglycemia', name: 'Hypoglycemia' },
    { id: 'low_back_pain_strain', name: 'Low Back Pain / Strain' },
    { id: 'cervical_strain', name: 'Cervical Strain' },
    { id: 'muscle_strain', name: 'Muscle Strain' },
    { id: 'joint_pain_arthralgia', name: 'Joint Pain / Arthralgia' },
    { id: 'tendonitis', name: 'Tendonitis' },
    { id: 'gastritis', name: 'Gastritis' },
    { id: 'gerd', name: 'GERD (Gastroesophageal Reflux)' },
    { id: 'ibs', name: 'Irritable Bowel Syndrome' },
    { id: 'uti_possible', name: 'UTI (Possible)' },
    { id: 'anxiety_disorder', name: 'Anxiety Disorder' },
    { id: 'depression_possible', name: 'Depression (Possible)' },
    { id: 'insomnia', name: 'Insomnia' },
    { id: 'vertigo', name: 'Vertigo' },
    { id: 'dermatitis', name: 'Dermatitis' },
    { id: 'other_undetermined', name: 'Other / Undetermined' },
  ] as const;
  
  // Lab options
  export const LAB_OPTIONS = [
    { id: 'cbc', name: 'Complete Blood Count (CBC)' },
    { id: 'bmp', name: 'Basic Metabolic Panel' },
    { id: 'cmp', name: 'Comprehensive Metabolic Panel' },
    { id: 'lipid_panel', name: 'Lipid Panel' },
    { id: 'hba1c', name: 'HbA1c' },
    { id: 'fasting_glucose', name: 'Fasting Blood Glucose' },
    { id: 'tsh', name: 'TSH (Thyroid)' },
    { id: 'urinalysis', name: 'Urinalysis' },
    { id: 'urine_culture', name: 'Urine Culture' },
    { id: 'chest_xray', name: 'Chest X-Ray' },
    { id: 'ecg', name: 'ECG / EKG' },
    { id: 'pulse_ox', name: 'Pulse Oximetry Monitoring' },
  ] as const;
  
  // Specialist referral options
  export const SPECIALIST_OPTIONS = [
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'pulmonology', name: 'Pulmonology' },
    { id: 'endocrinology', name: 'Endocrinology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'rheumatology', name: 'Rheumatology' },
    { id: 'gastroenterology', name: 'Gastroenterology' },
    { id: 'psychiatry', name: 'Psychiatry' },
    { id: 'physical_therapy', name: 'Physical Therapy' },
    { id: 'ophthalmology', name: 'Ophthalmology' },
    { id: 'ent', name: 'ENT (Ear, Nose, Throat)' },
    { id: 'dermatology', name: 'Dermatology' },
  ] as const;
  
  // OTC Medication categories
  export const MEDICATION_OPTIONS = [
    { id: 'med_acetaminophen_analgesic', name: 'Acetaminophen (Tylenol)', category: 'analgesic' },
    { id: 'med_ibuprofen_nsaid', name: 'Ibuprofen (Advil)', category: 'nsaid' },
    { id: 'med_naproxen_nsaid', name: 'Naproxen (Aleve)', category: 'nsaid' },
    { id: 'med_cetirizine_antihistamine', name: 'Cetirizine (Zyrtec)', category: 'antihistamine' },
    { id: 'med_loratadine_antihistamine', name: 'Loratadine (Claritin)', category: 'antihistamine' },
    { id: 'med_diphenhydramine_antihistamine', name: 'Diphenhydramine (Benadryl)', category: 'antihistamine' },
    { id: 'med_dextromethorphan_cough', name: 'Dextromethorphan (Cough)', category: 'cough' },
    { id: 'med_guaifenesin_expectorant', name: 'Guaifenesin (Mucinex)', category: 'expectorant' },
    { id: 'med_antacid', name: 'Antacid (Tums/Maalox)', category: 'gi' },
    { id: 'med_omeprazole', name: 'Omeprazole (Prilosec)', category: 'gi' },
  ] as const;
  
  // Lifestyle action options
  export const ACTION_OPTIONS = [
    { id: 'action_sleep_hygiene', name: 'Sleep Hygiene', category: 'sleep' },
    { id: 'action_reduce_screen_time', name: 'Reduce Screen Time', category: 'screen_time' },
    { id: 'action_gentle_mobility', name: 'Gentle Mobility Exercises', category: 'exercise' },
    { id: 'action_aerobic_exercise', name: 'Regular Aerobic Exercise', category: 'exercise' },
    { id: 'action_reduce_sodium', name: 'Reduce Sodium Intake', category: 'diet' },
    { id: 'action_dash_diet', name: 'DASH Diet', category: 'diet' },
    { id: 'action_limit_carbs', name: 'Limit Refined Carbs', category: 'diet' },
    { id: 'action_stress_reduction', name: 'Stress Reduction Techniques', category: 'stress' },
    { id: 'action_hydration', name: 'Increase Hydration', category: 'diet' },
    { id: 'action_posture_correction', name: 'Posture Correction', category: 'exercise' },
  ] as const;
  