/**
 * API Service - Connected to FastAPI Backend with Neo4j Integration
 * 
 * This service connects to the Python FastAPI backend which uses:
 * - KnowledgeBaseAdapter (Excel or Neo4j mode)
 * - MemoryStore adapter for session management
 * - TriageEngine for clinical triage
 */

import { IntakePayload, IntakeResponse, TriageResult, ExplanationResult } from '@/types/intake';
import { API_CONFIG, apiRequest } from '@/config/api';
import { 
  transformIntakePayloadToBackend, 
  transformTriageResultFromBackend 
} from './apiTransform';

// Extended intake with follow-ups
interface StoredIntake extends IntakePayload {
  created_at: string;
  follow_ups?: { question: string; answer: string; timestamp: string }[];
}

// In-memory storage (simulates MemoryStore adapter)
const intakeStore: Map<string, StoredIntake> = new Map();

// Generate unique ID (in production, this comes from backend)
const generateId = (): string => {
  return `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Issue a questionnaire session (step 1: staff/clinician issues questionnaire)
 */
export const issueQuestionnaire = async (
  patientId: string,
  issuedBy: string = 'system',
  intakeMode: 'full' | 'telehealth' = 'full'
) => {
  const response = await apiRequest<any>(API_CONFIG.endpoints.intake.issue, {
    method: 'POST',
    body: JSON.stringify({
      patient_id: patientId,
      issued_by: issuedBy,
      intake_mode: intakeMode,
    }),
  });
  
  return response;
};

/**
 * Submit intake form
 * Step 1: Issue questionnaire (if not already issued)
 * Step 2: Transform and submit intake data
 * Returns session token and submission status
 */
export const submitIntake = async (
  payload: IntakePayload,
  sessionToken?: string,
  patientId?: string
): Promise<IntakeResponse> => {
  // If no session token, issue a new questionnaire first
  let token = sessionToken;
  let patient_id = patientId || payload.patient.patient_id || `patient_${Date.now()}`;
  
  if (!token) {
    const session = await issueQuestionnaire(patient_id, 'system', 'full');
    token = session.session_token;
  }

  // Transform frontend payload to backend format
  const backendPayload = transformIntakePayloadToBackend(
    payload,
    token,
    patient_id,
    'system',
    'full'
  );

  // Submit to backend
  const response = await apiRequest<any>(API_CONFIG.endpoints.intake.submit, {
    method: 'POST',
    body: JSON.stringify(backendPayload),
  });

  if (response.status === 'rejected') {
    const missing = response.missing_fields?.join(', ') || 'unknown fields';
    throw new Error(`Submission rejected. Missing required information: ${missing}`);
  }

  // Return in frontend format
  return {
    intake_id: response.session_token, // Use session_token as intake_id
    created_at: response.submitted_at || new Date().toISOString(),
    status: response.status,
    missing_fields: response.missing_fields,
  };
};

/**
 * Get triage result from backend
 * Uses the real TriageEngine with Neo4j/Excel knowledge base
 */
export const getTriageResult = async (
  sessionToken: string,
  actorType: string = 'clinician',
  actorId?: string
): Promise<TriageResult> => {
  const response = await apiRequest<any>(API_CONFIG.endpoints.triage.run, {
    method: 'POST',
    body: JSON.stringify({
      session_token: sessionToken,
      actor_type: actorType,
      actor_id: actorId,
      is_rerun: false,
    }),
  });

  // Transform backend response to frontend format
  return transformTriageResultFromBackend(response);
};

/**
 * Get explanation for triage decision
 * Mock: Returns mock evidence and graph paths
 * Production: GET /explain/{intake_id}
 */
export const getExplanation = async (intake_id: string): Promise<ExplanationResult> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const intake = intakeStore.get(intake_id);
  if (!intake) {
    throw new Error(`Intake not found: ${intake_id}`);
  }

  return generateExplanation(intake_id, intake);
};

/**
 * Check if patient has previous intake
 * Mock: Always returns false for new patients
 * Production: GET /intake/check/{patient_id}
 */
export const checkExistingIntake = async (patient_id: string): Promise<{ exists: boolean; intake_id?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  // In mock mode, check our local store
  for (const [id, intake] of intakeStore.entries()) {
    if (intake.patient.patient_id === patient_id) {
      return { exists: true, intake_id: id };
    }
  }

  return { exists: false };
};

/**
 * Update intake with additional vitals or information
 * Mock: Updates in-memory store
 * Production: PATCH /intake/{intake_id}
 */
export const updateIntakeVitals = async (
  intake_id: string,
  vitals: Partial<IntakePayload['vitals']>
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const intake = intakeStore.get(intake_id);
  if (!intake) {
    throw new Error(`Intake not found: ${intake_id}`);
  }

  // Merge new vitals with existing
  intake.vitals = { ...intake.vitals, ...vitals };
  intakeStore.set(intake_id, intake);
};

/**
 * Add follow-up question and answer
 * Mock: Appends to in-memory store
 * Production: POST /intake/{intake_id}/followup
 */
export const addFollowUp = async (
  intake_id: string,
  question: string,
  answer: string
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const intake = intakeStore.get(intake_id);
  if (!intake) {
    throw new Error(`Intake not found: ${intake_id}`);
  }

  if (!intake.follow_ups) {
    intake.follow_ups = [];
  }

  intake.follow_ups.push({
    question,
    answer,
    timestamp: new Date().toISOString(),
  });

  intakeStore.set(intake_id, intake);
};

/**
 * Get intake record with all data
 * Mock: Returns from in-memory store
 * Production: GET /intake/{intake_id}
 */
export const getIntakeRecord = async (intake_id: string): Promise<StoredIntake> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  const intake = intakeStore.get(intake_id);
  if (!intake) {
    throw new Error(`Intake not found: ${intake_id}`);
  }

  return intake;
};

function runTriageEngine(intake_id: string, intake: IntakePayload): TriageResult {
  const red_flags_triggered: string[] = [];
  let status: 'urgent' | 'non_urgent' = 'non_urgent';

  // Red flag detection
  if (intake.red_flags.chest_pain) {
    red_flags_triggered.push('Chest pain reported');
    status = 'urgent';
  }

  if (intake.red_flags.severe_shortness_of_breath) {
    red_flags_triggered.push('Severe shortness of breath');
    status = 'urgent';
  }

  if (intake.red_flags.fainting_or_confusion) {
    red_flags_triggered.push('Fainting or confusion');
    status = 'urgent';
  }

  // Vitals-based red flags
  if (intake.vitals.spo2 !== undefined && intake.vitals.spo2 < 92) {
    red_flags_triggered.push(`Critical SpO2: ${intake.vitals.spo2}%`);
    status = 'urgent';
  }

  if (intake.vitals.bp_systolic !== undefined && intake.vitals.bp_systolic >= 180) {
    red_flags_triggered.push(`Hypertensive crisis: BP ${intake.vitals.bp_systolic}/${intake.vitals.bp_diastolic || '?'}`);
    status = 'urgent';
  }

  if (intake.vitals.bp_diastolic !== undefined && intake.vitals.bp_diastolic >= 120) {
    red_flags_triggered.push(`Hypertensive crisis: BP ${intake.vitals.bp_systolic || '?'}/${intake.vitals.bp_diastolic}`);
    status = 'urgent';
  }

  // Serious buckets
  const serious_buckets = {
    hypertension_risk: (intake.vitals.bp_systolic || 0) >= 160,
    hyperglycemia_risk: intake.symptoms.includes('polyuria') && intake.symptoms.includes('polydipsia'),
    respiratory_risk: (intake.vitals.spo2 !== undefined && intake.vitals.spo2 >= 92 && intake.vitals.spo2 <= 94) ||
      intake.symptoms.includes('shortness_of_breath'),
  };

  // Differential probabilities (only for non-urgent)
  let differentials: { condition: string; probability: number }[] | undefined;

  if (status === 'non_urgent') {
    differentials = calculateDifferentials(intake);
  }

  // Lab suggestions based on conditions
  const lab_suggestions = generateLabSuggestions(intake, serious_buckets);

  // Referral suggestions
  const referral_suggestions = generateReferralSuggestions(intake, serious_buckets, status);

  // Medication suggestions
  const medication_suggestions = generateMedicationSuggestions(intake, serious_buckets, differentials);

  // Lifestyle suggestions
  const lifestyle_suggestions = generateLifestyleSuggestions(intake, serious_buckets);

  return {
    intake_id,
    status,
    red_flags_triggered,
    serious_buckets,
    differentials,
    lab_suggestions,
    referral_suggestions,
    medication_suggestions,
    lifestyle_suggestions,
  };
}

function calculateDifferentials(intake: IntakePayload): { condition: string; probability: number }[] {
  const scores: Record<string, number> = {
    allergic_rhinitis: 0,
    viral_uri: 0,
    flu_like_illness: 0,
  };

  // Score based on symptoms
  const symptoms = new Set(intake.symptoms);

  if (symptoms.has('sneezing') || symptoms.has('itchy_eyes') || symptoms.has('runny_nose')) {
    scores.allergic_rhinitis += 3;
  }

  if (symptoms.has('cough') || symptoms.has('sore_throat') || symptoms.has('runny_nose')) {
    scores.viral_uri += 2;
  }

  if (symptoms.has('fever') || symptoms.has('fatigue') || symptoms.has('headache')) {
    scores.flu_like_illness += 2;
    scores.viral_uri += 1;
  }

  if (symptoms.has('cough') && symptoms.has('fever')) {
    scores.flu_like_illness += 2;
  }

  // Normalize to sum to 1
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;

  return Object.entries(scores)
    .map(([condition, score]) => ({
      condition: formatConditionName(condition),
      probability: Math.round((score / total) * 100) / 100,
    }))
    .filter(d => d.probability > 0)
    .sort((a, b) => b.probability - a.probability);
}

function formatConditionName(id: string): string {
  const names: Record<string, string> = {
    allergic_rhinitis: 'Allergic Rhinitis',
    viral_uri: 'Viral Upper Respiratory Infection',
    flu_like_illness: 'Flu-like Illness',
  };
  return names[id] || id;
}

function generateLabSuggestions(
  intake: IntakePayload,
  buckets: TriageResult['serious_buckets']
): string[] {
  const labs: string[] = [];

  if (buckets.hyperglycemia_risk || intake.history.conditions.includes('diabetes')) {
    labs.push('Fasting Blood Glucose');
    labs.push('HbA1c');
  }

  if (buckets.hypertension_risk || intake.history.conditions.includes('hypertension')) {
    labs.push('Basic Metabolic Panel');
    labs.push('Lipid Panel');
  }

  if (buckets.respiratory_risk) {
    labs.push('Chest X-Ray');
    labs.push('Pulse Oximetry Monitoring');
  }

  if (intake.symptoms.includes('fever')) {
    labs.push('Complete Blood Count (CBC)');
  }

  return [...new Set(labs)];
}

function generateReferralSuggestions(
  intake: IntakePayload,
  buckets: TriageResult['serious_buckets'],
  status: 'urgent' | 'non_urgent'
): string[] {
  const referrals: string[] = [];

  if (status === 'urgent') {
    referrals.push('Immediate physician evaluation');
  }

  if (buckets.hypertension_risk) {
    referrals.push('Cardiology consultation');
  }

  if (buckets.hyperglycemia_risk) {
    referrals.push('Endocrinology consultation');
  }

  if (buckets.respiratory_risk && !status) {
    referrals.push('Pulmonology consultation');
  }

  // Body-region specific referrals
  intake.issues.forEach(issue => {
    if (issue.body_region_id.includes('eye')) {
      referrals.push('Ophthalmology consultation');
    }
    if (issue.body_region_id.includes('joint') || issue.pain_rating >= 7) {
      referrals.push('Orthopedic evaluation');
    }
  });

  return [...new Set(referrals)];
}

function generateMedicationSuggestions(
  intake: IntakePayload,
  buckets: TriageResult['serious_buckets'],
  differentials?: { condition: string; probability: number }[]
): TriageResult['medication_suggestions'] {
  const medications: NonNullable<TriageResult['medication_suggestions']> = [];

  // Symptom-based suggestions
  if (intake.symptoms.includes('fever') || intake.symptoms.includes('headache')) {
    medications.push({
      name: 'Acetaminophen',
      dosage: '500-1000mg',
      frequency: 'Every 6-8 hours as needed',
      notes: 'Max 4g/day. Avoid if liver disease present.',
    });
  }

  if (intake.symptoms.includes('cough')) {
    medications.push({
      name: 'Dextromethorphan',
      dosage: '10-20mg',
      frequency: 'Every 4 hours as needed',
      notes: 'For dry cough only. Avoid if productive cough.',
    });
  }

  if (intake.symptoms.includes('runny_nose') || intake.symptoms.includes('sneezing')) {
    medications.push({
      name: 'Cetirizine (Zyrtec)',
      dosage: '10mg',
      frequency: 'Once daily',
      notes: 'Non-drowsy antihistamine for allergic symptoms.',
    });
  }

  if (intake.symptoms.includes('sore_throat')) {
    medications.push({
      name: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'Every 6-8 hours with food',
      notes: 'Anti-inflammatory. Avoid if GI or kidney issues.',
    });
  }

  // Condition-based suggestions
  if (buckets.hypertension_risk && !intake.history.conditions.includes('hypertension')) {
    medications.push({
      name: 'Lifestyle modification first',
      dosage: 'N/A',
      frequency: 'Ongoing',
      notes: 'Consider antihypertensive if BP remains elevated after lifestyle changes.',
    });
  }

  if (buckets.hyperglycemia_risk) {
    medications.push({
      name: 'Blood glucose monitoring',
      dosage: 'N/A',
      frequency: 'Before meals and bedtime',
      notes: 'Medication decisions pending glucose results.',
    });
  }

  return medications.length > 0 ? medications : undefined;
}

function generateLifestyleSuggestions(
  intake: IntakePayload,
  buckets: TriageResult['serious_buckets']
): TriageResult['lifestyle_suggestions'] {
  const suggestions: NonNullable<TriageResult['lifestyle_suggestions']> = [];

  // Hypertension-related
  if (buckets.hypertension_risk || intake.history.conditions.includes('hypertension')) {
    suggestions.push({
      category: 'exercise',
      recommendation: 'Engage in 30 minutes of moderate aerobic exercise (walking, swimming) 5 days per week',
      priority: 'high',
    });
    suggestions.push({
      category: 'diet',
      recommendation: 'Reduce sodium intake to less than 2,300mg/day. Follow DASH diet principles.',
      priority: 'high',
    });
    suggestions.push({
      category: 'stress',
      recommendation: 'Practice stress-reduction techniques: deep breathing, meditation, or yoga for 10-15 minutes daily',
      priority: 'medium',
    });
  }

  // Diabetes/hyperglycemia-related
  if (buckets.hyperglycemia_risk || intake.history.conditions.includes('diabetes') || intake.history.conditions.includes('prediabetes')) {
    suggestions.push({
      category: 'diet',
      recommendation: 'Limit refined carbohydrates and sugary drinks. Focus on whole grains, vegetables, and lean proteins.',
      priority: 'high',
    });
    suggestions.push({
      category: 'exercise',
      recommendation: 'Walk for 15-30 minutes after meals to help regulate blood sugar levels',
      priority: 'high',
    });
  }

  // General wellness
  if (intake.symptoms.includes('fatigue') || intake.symptoms.includes('headache')) {
    suggestions.push({
      category: 'sleep',
      recommendation: 'Aim for 7-9 hours of quality sleep. Maintain consistent sleep/wake times.',
      priority: 'medium',
    });
    suggestions.push({
      category: 'screen_time',
      recommendation: 'Reduce screen time 1 hour before bed. Take 5-minute breaks every hour during work.',
      priority: 'medium',
    });
  }

  if (intake.symptoms.includes('dizziness')) {
    suggestions.push({
      category: 'other',
      recommendation: 'Stay well hydrated. Avoid sudden position changes. Rest when symptomatic.',
      priority: 'high',
    });
  }

  // Eye-related issues
  if (intake.symptoms.includes('itchy_eyes') || intake.symptoms.includes('blurred_vision')) {
    suggestions.push({
      category: 'screen_time',
      recommendation: 'Follow 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds.',
      priority: 'medium',
    });
  }

  // Respiratory
  if (buckets.respiratory_risk || intake.history.conditions.includes('asthma_copd')) {
    suggestions.push({
      category: 'other',
      recommendation: 'Avoid smoke, dust, and allergens. Use air purifier if available. Stay hydrated.',
      priority: 'high',
    });
  }

  // Add general wellness if no specific suggestions
  if (suggestions.length === 0) {
    suggestions.push({
      category: 'other',
      recommendation: 'Rest adequately and stay hydrated. Monitor symptoms and return if worsening.',
      priority: 'low',
    });
  }

  return suggestions;
}

function generateExplanation(intake_id: string, intake: IntakePayload): ExplanationResult {
  const top_evidence: ExplanationResult['top_evidence'] = [];

  // Add evidence based on what was reported
  if (intake.red_flags.chest_pain || intake.red_flags.severe_shortness_of_breath) {
    top_evidence.push({
      type: 'RED_FLAG',
      description: 'Critical symptom reported requiring immediate evaluation',
      relevance: 1.0,
    });
  }

  if (intake.symptoms.length > 0) {
    top_evidence.push({
      type: 'SYMPTOM_CLUSTER',
      description: `${intake.symptoms.length} symptoms reported matching common patterns`,
      relevance: 0.8,
    });
  }

  if (intake.issues.length > 0) {
    top_evidence.push({
      type: 'BODY_LOCATION',
      description: `${intake.issues.length} body region(s) with reported issues`,
      relevance: 0.7,
    });
  }

  if (intake.history.conditions.length > 0) {
    top_evidence.push({
      type: 'MEDICAL_HISTORY',
      description: `Known conditions: ${intake.history.conditions.join(', ')}`,
      relevance: 0.6,
    });
  }

  // Mock graph paths (will be real Neo4j paths in production)
  const graph_paths = [
    `Patient -> reports -> Symptoms -> suggests -> Differential`,
    `Symptoms -> co-occurs-with -> BodyRegion -> indicates -> Condition`,
    `MedicalHistory -> increases-risk -> CurrentSymptoms -> triages-to -> Priority`,
  ];

  return {
    intake_id,
    top_evidence,
    graph_paths,
  };
}

// New finalization store
const finalizationStore: Map<string, any> = new Map();
const messageStore: Map<string, any[]> = new Map();

/**
 * Save finalization data
 */
export const saveFinalization = async (intake_id: string, finalization: any): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  finalizationStore.set(intake_id, finalization);
};

/**
 * Generate message draft
 */
export const generateMessageDraft = async (intake_id: string, finalization: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const draft_id = `MSG-${Date.now()}`;
  const diagnosis = finalization.final_diagnosis_free_text || finalization.final_diagnosis_condition_id || 'Evaluation complete';
  
  return {
    draft_id,
    created_at: new Date().toISOString(),
    recipients: { to: [], cc: [], bcc: [] },
    subject: 'Your Visit Summary and Next Steps',
    body: `Dear Patient,

Thank you for your recent visit. Based on today's evaluation, here is your care summary:

**Assessment**: ${diagnosis}

**Follow-up Instructions**:
${finalization.followup?.timeframe || 'As needed'} - ${finalization.followup?.instructions || 'Contact clinic if needed'}

**Important**:
If symptoms worsen or urgent warning signs develop, please seek care immediately.

Best regards,
Your Care Team`,
    attachments: [],
    status: 'draft',
  };
};

/**
 * Send message (mock)
 */
export const sendMessage = async (intake_id: string, draft: any): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const messages = messageStore.get(intake_id) || [];
  messages.push({ ...draft, status: 'sent_mock', sent_at: new Date().toISOString() });
  messageStore.set(intake_id, messages);
};

// Export store for debugging (remove in production)
export const _debugGetStore = () => intakeStore;
