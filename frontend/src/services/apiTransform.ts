/**
 * API Transformation Utilities
 * 
 * Converts between frontend types and backend API types
 */

import { IntakePayload } from '@/types/intake';

/**
 * Transform frontend IntakePayload to backend IntakeQuestionnaireResponse format
 */
export const transformIntakePayloadToBackend = (
  payload: IntakePayload,
  sessionToken: string,
  patientId: string,
  issuedBy: string = 'system',
  intakeMode: 'full' | 'telehealth' = 'full'
) => {
  // Transform issues to issue_cards
  const issue_cards = payload.issues.map((issue, index) => ({
    issue_id: issue.id || `issue_${index}`,
    region_id: issue.body_region_id,
    description: issue.description || '',
    pain_score: issue.pain_rating || null,
    functional_impact: mapFunctionalImpact(issue),
    onset: issue.onset || 'unknown',
    course: mapCourse(issue.course || 'same'),
    triggers: null,
    relief_factors: null,
  }));

  // Transform symptoms to SymptomEntry format
  const symptoms = payload.symptoms.map(symptomId => ({
    symptom_id: symptomId,
    present: true,
    severity: null,
    duration: null,
    notes: null,
  }));

  // Transform red flags
  const red_flags = [
    {
      red_flag_id: 'chest_pain',
      present: payload.red_flags.chest_pain || false,
      notes: null,
    },
    {
      red_flag_id: 'severe_shortness_of_breath',
      present: payload.red_flags.severe_shortness_of_breath || false,
      notes: null,
    },
    {
      red_flag_id: 'fainting_or_confusion',
      present: payload.red_flags.fainting_or_confusion || false,
      notes: null,
    },
  ];

  // Transform vitals
  const vitals = {
    temperature: payload.vitals.temperature_c || null,
    heart_rate: payload.vitals.heart_rate || null,
    respiratory_rate: null,
    blood_pressure_systolic: payload.vitals.bp_systolic || null,
    blood_pressure_diastolic: payload.vitals.bp_diastolic || null,
    oxygen_saturation: payload.vitals.spo2 || null,
    height_cm: null,
    weight_kg: null,
    bmi: null,
    unknown: !payload.vitals.temperature_c && !payload.vitals.heart_rate && 
             !payload.vitals.bp_systolic && !payload.vitals.spo2,
  };

  // Transform medications
  const medications = payload.history.medications
    ? payload.history.medications.split(',').map(med => ({
        med_name: med.trim(),
        med_class: 'unknown',
        reason: null,
      }))
    : [];

  // Transform allergies
  const allergies = payload.history.allergies.map(allergy => ({
    allergen: allergy,
    reaction: null,
  }));

  // Transform social history
  const social_history = {
    tobacco: payload.history.social.tobacco || null,
    alcohol: payload.history.social.alcohol || null,
    drugs: payload.history.social.drugs || null,
    occupation: payload.history.social.occupation || null,
    stressors: payload.history.social.stressors || null,
    exercise: payload.history.social.exercise || null,
  };

  // Build symptom durations map
  const symptom_durations: Record<string, string | null> = {};
  payload.symptoms.forEach(symptomId => {
    symptom_durations[symptomId] = null; // Frontend doesn't track duration per symptom yet
  });

  // Build functional impacts map
  const functional_impacts: Record<string, string | null> = {};
  payload.issues.forEach(issue => {
    functional_impacts[issue.id] = mapFunctionalImpact(issue);
  });

  // Transform family history
  const family_history = payload.history.family_history.map(condition => ({
    relation: 'unknown',
    condition: condition,
  }));

  return {
    session_token: sessionToken,
    patient_id: patientId,
    issued_by: issuedBy,
    intake_mode: intakeMode,
    started_at: new Date().toISOString(),
    submitted_at: null,
    entered_by: null,
    reported_by: 'patient',
    
    // Tier 1
    chief_concern: payload.issues.length > 0 
      ? (payload.issues[0].description || `Issue with ${payload.issues[0].body_region}`)
      : payload.symptoms.length > 0 
        ? `Symptoms: ${payload.symptoms.join(', ')}`
        : 'General consultation',
    issue_cards,
    symptoms,
    red_flags,
    consent_acknowledged: payload.consent.accepted,
    medications,
    allergies,
    vitals,
    
    // Tier 2
    pmh: payload.history.conditions || [],
    symptom_durations,
    functional_impacts,
    social_history,
    
    // Tier 3
    ros: {},
    family_history,
    occupation: null,
    additional_notes: null,
    
    // Meta
    last_modified: new Date().toISOString(),
    source: 'patient',
    overrides: {},
    audit_trail: [],
  };
};

/**
 * Transform backend TriageResult to frontend TriageResult format
 */
export const transformTriageResultFromBackend = (backendResult: any) => {
  // Map top_5_conditions to differentials
  const differentials = backendResult.top_5_conditions?.map((cond: any) => ({
    condition: cond.condition_name || cond.condition_id,
    probability: cond.probability || 0,
  })) || [];

  // Extract lab suggestions
  const lab_suggestions = backendResult.suggestions
    ?.filter((s: any) => s.suggestion_type === 'labs')
    .map((s: any) => s.description) || [];

  // Extract referral suggestions
  const referral_suggestions = backendResult.suggestions
    ?.filter((s: any) => s.suggestion_type === 'referrals')
    .map((s: any) => s.description) || [];

  // Extract medication suggestions
  const medication_suggestions = backendResult.suggestions
    ?.filter((s: any) => s.suggestion_type === 'meds')
    .map((s: any) => ({
      name: s.description,
      dosage: 'As prescribed',
      frequency: 'As needed',
      notes: s.relevant_condition_id ? `For condition: ${s.relevant_condition_id}` : null,
    })) || undefined;

  // Extract lifestyle suggestions
  const lifestyle_suggestions = backendResult.suggestions
    ?.filter((s: any) => s.suggestion_type === 'actions' || s.suggestion_type === 'guides')
    .map((s: any) => ({
      category: 'other' as const,
      recommendation: s.description,
      priority: 'medium' as const,
    })) || undefined;

  // Determine status from acuity
  const status = backendResult.triage_summary?.acuity === 'urgent' 
    ? 'urgent' as const 
    : 'non_urgent' as const;

  return {
    intake_id: backendResult.intake_session_token,
    status,
    red_flags_triggered: backendResult.triage_summary?.red_flags || [],
    serious_buckets: {
      hypertension_risk: false, // Backend doesn't provide this directly
      hyperglycemia_risk: false,
      respiratory_risk: false,
    },
    differentials: differentials.length > 0 ? differentials : undefined,
    lab_suggestions,
    referral_suggestions,
    medication_suggestions,
    lifestyle_suggestions,
  };
};

// Helper functions
function mapFunctionalImpact(issue: IntakePayload['issues'][0]): string {
  // Map pain rating to functional impact
  if (issue.pain_rating >= 7) return 'severe';
  if (issue.pain_rating >= 4) return 'moderate';
  if (issue.pain_rating >= 1) return 'mild';
  return 'none';
}

function mapCourse(course: string): string {
  const mapping: Record<string, string> = {
    'better': 'improving',
    'worse': 'worsening',
    'same': 'unchanged',
  };
  return mapping[course] || 'unchanged';
}

