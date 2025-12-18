// Patient guide attachments knowledge pack
import { PatientGuide, MessageTemplate } from '@/types/clinical';

// Patient guides (nodes_patient_guide equivalent)
export const PATIENT_GUIDES: PatientGuide[] = [
  {
    guide_id: 'guide_posture_ergonomics',
    title: 'Posture and Ergonomics Guide',
    filename: 'posture_ergonomics.pdf',
    category: 'ergonomics',
    description: 'Tips for computer and phone posture',
  },
  {
    guide_id: 'guide_migraine_selfcare',
    title: 'Migraine Self-Care Guide',
    filename: 'migraine_selfcare.pdf',
    category: 'education',
    description: 'Common triggers and supportive steps for migraine management',
  },
  {
    guide_id: 'guide_neck_stretches',
    title: 'Neck Stretches and Mobility',
    filename: 'neck_stretches.pdf',
    category: 'exercise',
    description: 'Gentle exercises for posture-related discomfort',
  },
  {
    guide_id: 'guide_followup_scheduling',
    title: 'Follow-up Scheduling Instructions',
    filename: 'followup_scheduling.pdf',
    category: 'followup',
    description: 'How to schedule follow-up and what to expect',
  },
  {
    guide_id: 'guide_return_precautions',
    title: 'Return Precautions',
    filename: 'return_precautions.pdf',
    category: 'safety',
    description: 'When to seek urgent care',
  },
  {
    guide_id: 'guide_hypertension_lifestyle',
    title: 'Hypertension Lifestyle Guide',
    filename: 'hypertension_lifestyle.pdf',
    category: 'education',
    description: 'Diet, exercise, and monitoring tips for blood pressure management',
  },
  {
    guide_id: 'guide_diabetes_basics',
    title: 'Diabetes Basics Guide',
    filename: 'diabetes_basics.pdf',
    category: 'education',
    description: 'Understanding blood sugar and lifestyle modifications',
  },
  {
    guide_id: 'guide_respiratory_care',
    title: 'Respiratory Self-Care',
    filename: 'respiratory_care.pdf',
    category: 'education',
    description: 'Managing breathing symptoms and when to seek help',
  },
  {
    guide_id: 'guide_stress_management',
    title: 'Stress Management Techniques',
    filename: 'stress_management.pdf',
    category: 'education',
    description: 'Breathing exercises and relaxation techniques',
  },
  {
    guide_id: 'guide_sleep_hygiene',
    title: 'Sleep Hygiene Guide',
    filename: 'sleep_hygiene.pdf',
    category: 'education',
    description: 'Tips for better sleep quality',
  },
];

// Condition to guide mappings (edges_condition_guides equivalent)
export const CONDITION_GUIDE_MAPPINGS: Record<string, { guide_id: string; priority: 'high' | 'medium' | 'low'; reason: string }[]> = {
  migraine_possible: [
    { guide_id: 'guide_migraine_selfcare', priority: 'high', reason: 'Provide migraine self-care guidance' },
    { guide_id: 'guide_posture_ergonomics', priority: 'medium', reason: 'Posture may contribute to symptoms' },
    { guide_id: 'guide_stress_management', priority: 'medium', reason: 'Stress is a common trigger' },
  ],
  tension_headache: [
    { guide_id: 'guide_posture_ergonomics', priority: 'high', reason: 'Posture often contributes to tension headaches' },
    { guide_id: 'guide_neck_stretches', priority: 'high', reason: 'Stretches can relieve muscle tension' },
    { guide_id: 'guide_stress_management', priority: 'medium', reason: 'Stress management helps prevention' },
  ],
  low_back_pain_strain: [
    { guide_id: 'guide_neck_stretches', priority: 'high', reason: 'Gentle mobility guidance' },
    { guide_id: 'guide_posture_ergonomics', priority: 'high', reason: 'Posture correction important for recovery' },
  ],
  cervical_strain: [
    { guide_id: 'guide_neck_stretches', priority: 'high', reason: 'Targeted neck exercises' },
    { guide_id: 'guide_posture_ergonomics', priority: 'high', reason: 'Ergonomic adjustments needed' },
  ],
  hypertension_risk: [
    { guide_id: 'guide_hypertension_lifestyle', priority: 'high', reason: 'Lifestyle modifications for BP control' },
    { guide_id: 'guide_stress_management', priority: 'medium', reason: 'Stress affects blood pressure' },
    { guide_id: 'guide_followup_scheduling', priority: 'medium', reason: 'Encourage follow-up evaluation process' },
  ],
  type2_diabetes_risk: [
    { guide_id: 'guide_diabetes_basics', priority: 'high', reason: 'Understanding diabetes management' },
    { guide_id: 'guide_followup_scheduling', priority: 'high', reason: 'Lab follow-up essential' },
  ],
  allergic_rhinitis: [
    { guide_id: 'guide_return_precautions', priority: 'low', reason: 'Know when symptoms warrant return visit' },
  ],
  viral_uri: [
    { guide_id: 'guide_respiratory_care', priority: 'medium', reason: 'Supportive care guidance' },
    { guide_id: 'guide_return_precautions', priority: 'medium', reason: 'Know warning signs' },
  ],
  flu_like_illness: [
    { guide_id: 'guide_respiratory_care', priority: 'high', reason: 'Manage respiratory symptoms' },
    { guide_id: 'guide_return_precautions', priority: 'high', reason: 'Watch for complications' },
  ],
  insomnia: [
    { guide_id: 'guide_sleep_hygiene', priority: 'high', reason: 'First-line intervention for sleep issues' },
    { guide_id: 'guide_stress_management', priority: 'medium', reason: 'Anxiety often contributes' },
  ],
  anxiety_disorder: [
    { guide_id: 'guide_stress_management', priority: 'high', reason: 'Coping techniques for anxiety' },
    { guide_id: 'guide_sleep_hygiene', priority: 'medium', reason: 'Sleep quality affects anxiety' },
  ],
};

// Action to guide mappings (edges_action_guides equivalent)
export const ACTION_GUIDE_MAPPINGS: Record<string, { guide_id: string; priority: 'high' | 'medium' | 'low'; reason: string }[]> = {
  action_reduce_screen_time: [
    { guide_id: 'guide_posture_ergonomics', priority: 'medium', reason: 'Ergonomics can support reduced strain' },
  ],
  action_gentle_mobility: [
    { guide_id: 'guide_neck_stretches', priority: 'high', reason: 'Exercise guide supports recommended mobility' },
  ],
  action_posture_correction: [
    { guide_id: 'guide_posture_ergonomics', priority: 'high', reason: 'Detailed posture guidance' },
    { guide_id: 'guide_neck_stretches', priority: 'medium', reason: 'Supporting exercises' },
  ],
  action_sleep_hygiene: [
    { guide_id: 'guide_sleep_hygiene', priority: 'high', reason: 'Comprehensive sleep guidance' },
  ],
  action_stress_reduction: [
    { guide_id: 'guide_stress_management', priority: 'high', reason: 'Detailed relaxation techniques' },
  ],
  action_reduce_sodium: [
    { guide_id: 'guide_hypertension_lifestyle', priority: 'high', reason: 'Dietary guidance for BP' },
  ],
  action_dash_diet: [
    { guide_id: 'guide_hypertension_lifestyle', priority: 'high', reason: 'DASH diet details' },
  ],
};

// Message templates (nodes_message_template equivalent)
export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    template_id: 'template_general',
    name: 'General Visit Summary',
    subject_template: 'Your Visit Summary and Next Steps',
    body_template: `Dear {patient_name},

Thank you for your recent visit. Based on today's evaluation, here is your care summary:

**Assessment**: {final_diagnosis}

**Plan Summary**:
{plan_summary}

**Follow-up Instructions**:
{followup_instructions}

**Important - Return Precautions**:
{return_precautions}

If symptoms worsen or urgent warning signs develop, please seek care immediately.

Please don't hesitate to contact us with any questions.

Best regards,
Your Care Team`,
  },
  {
    template_id: 'template_respiratory',
    name: 'Respiratory Condition Summary',
    subject_template: 'Your Respiratory Care Summary',
    body_template: `Dear {patient_name},

Following your visit for respiratory concerns, here is your care summary:

**Assessment**: {final_diagnosis}

**Plan Summary**:
{plan_summary}

**Breathing Tips**:
- Rest and stay well hydrated
- Use a humidifier if available
- Avoid irritants like smoke and strong odors

**Follow-up**:
{followup_instructions}

**When to Seek Urgent Care**:
- Difficulty breathing or shortness of breath at rest
- Bluish color to lips or fingertips
- High fever not responding to medication
- Symptoms significantly worsening

If symptoms worsen or urgent warning signs develop, please seek care immediately.

Best regards,
Your Care Team`,
  },
  {
    template_id: 'template_musculoskeletal',
    name: 'Musculoskeletal Care Summary',
    subject_template: 'Your Musculoskeletal Care Plan',
    body_template: `Dear {patient_name},

Following your visit for musculoskeletal concerns, here is your care summary:

**Assessment**: {final_diagnosis}

**Plan Summary**:
{plan_summary}

**Recovery Tips**:
- Apply ice or heat as directed
- Gentle movement within comfort limits
- Avoid activities that worsen pain

**Follow-up**:
{followup_instructions}

**When to Seek Care**:
- Sudden worsening of pain
- Numbness or tingling
- Weakness in the affected area
- Inability to bear weight (if applicable)

If symptoms worsen or urgent warning signs develop, please seek care immediately.

Best regards,
Your Care Team`,
  },
];

// Condition to template mappings
export const CONDITION_TEMPLATE_MAPPINGS: Record<string, { template_id: string; priority: 'high' | 'medium' | 'low'; reason: string }> = {
  viral_uri: { template_id: 'template_respiratory', priority: 'high', reason: 'Respiratory-specific guidance' },
  flu_like_illness: { template_id: 'template_respiratory', priority: 'high', reason: 'Respiratory-specific guidance' },
  bronchitis: { template_id: 'template_respiratory', priority: 'high', reason: 'Respiratory-specific guidance' },
  asthma_exacerbation: { template_id: 'template_respiratory', priority: 'high', reason: 'Respiratory-specific guidance' },
  low_back_pain_strain: { template_id: 'template_musculoskeletal', priority: 'high', reason: 'MSK-specific guidance' },
  cervical_strain: { template_id: 'template_musculoskeletal', priority: 'high', reason: 'MSK-specific guidance' },
  muscle_strain: { template_id: 'template_musculoskeletal', priority: 'high', reason: 'MSK-specific guidance' },
  joint_pain_arthralgia: { template_id: 'template_musculoskeletal', priority: 'high', reason: 'MSK-specific guidance' },
  tendonitis: { template_id: 'template_musculoskeletal', priority: 'high', reason: 'MSK-specific guidance' },
};

// Helper to get recommended guides for a condition
export function getGuidesForCondition(conditionId: string): PatientGuide[] {
  const mappings = CONDITION_GUIDE_MAPPINGS[conditionId] || [];
  const guideIds = mappings.map(m => m.guide_id);
  return PATIENT_GUIDES.filter(g => guideIds.includes(g.guide_id));
}

// Helper to get recommended guides for actions
export function getGuidesForActions(actionIds: string[]): PatientGuide[] {
  const guideIds = new Set<string>();
  actionIds.forEach(actionId => {
    const mappings = ACTION_GUIDE_MAPPINGS[actionId] || [];
    mappings.forEach(m => guideIds.add(m.guide_id));
  });
  return PATIENT_GUIDES.filter(g => guideIds.has(g.guide_id));
}

// Helper to get template for condition
export function getTemplateForCondition(conditionId: string): MessageTemplate {
  const mapping = CONDITION_TEMPLATE_MAPPINGS[conditionId];
  if (mapping) {
    return MESSAGE_TEMPLATES.find(t => t.template_id === mapping.template_id) || MESSAGE_TEMPLATES[0];
  }
  return MESSAGE_TEMPLATES[0]; // Default to general template
}
