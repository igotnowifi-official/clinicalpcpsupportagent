/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 * 
 * Clinical Knowledge Pack v02 - Single source of truth
 * Data extracted from clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx
 */

// ============= CONDITIONS (nodes_condition) =============
export interface Condition {
    condition_id: string;
    name: string;
    severity: 'common' | 'serious_bucket';
    description: string;
  }
  
  export const CONDITIONS: Condition[] = [
    { condition_id: 'posture_related_headache', name: 'Posture-related headache', severity: 'common', description: 'Headache possibly related to posture and muscle strain' },
    { condition_id: 'tension_headache', name: 'Tension headache', severity: 'common', description: 'Band-like headache without focal neurologic deficits' },
    { condition_id: 'migraine_possible', name: 'Migraine possible', severity: 'common', description: 'Headache with features such as photophobia, nausea, or aura' },
    { condition_id: 'eye_strain_headache', name: 'Eye strain headache', severity: 'common', description: 'Headache possibly related to prolonged screen use or visual strain' },
    { condition_id: 'sleep_deprivation_headache', name: 'Sleep deprivation headache', severity: 'common', description: 'Headache associated with insufficient or disrupted sleep' },
    { condition_id: 'dehydration_headache', name: 'Dehydration headache', severity: 'common', description: 'Headache associated with low fluid intake or fluid losses' },
    { condition_id: 'viral_uri', name: 'Viral upper respiratory infection', severity: 'common', description: 'Cold-like symptoms including runny nose and sore throat' },
    { condition_id: 'influenza_like_illness', name: 'Influenza-like illness', severity: 'common', description: 'Fever and body aches with respiratory symptoms' },
    { condition_id: 'covid_like_illness', name: 'COVID-like illness', severity: 'common', description: 'Respiratory symptoms with systemic features' },
    { condition_id: 'acute_sinusitis', name: 'Acute sinusitis possible', severity: 'common', description: 'Facial pressure and congestion with persistent symptoms' },
    { condition_id: 'acute_pharyngitis', name: 'Acute pharyngitis', severity: 'common', description: 'Sore throat with inflammatory symptoms' },
    { condition_id: 'acute_bronchitis', name: 'Acute bronchitis', severity: 'common', description: 'Cough after URI, often without pneumonia signs' },
    { condition_id: 'allergic_rhinitis', name: 'Allergic rhinitis', severity: 'common', description: 'Sneezing and itchy eyes/runny nose often tied to allergens' },
    { condition_id: 'asthma_exacerbation', name: 'Asthma exacerbation', severity: 'common', description: 'Wheeze or SOB in context of asthma history/triggers' },
    { condition_id: 'copd_exacerbation', name: 'COPD exacerbation', severity: 'common', description: 'Increased cough/sputum/SOB in COPD context' },
    { condition_id: 'acute_gastroenteritis', name: 'Acute gastroenteritis', severity: 'common', description: 'Nausea/vomiting/diarrhea' },
    { condition_id: 'gerd', name: 'GERD', severity: 'common', description: 'Heartburn or reflux-related symptoms' },
    { condition_id: 'gastritis_peptic_ulcer_possible', name: 'Gastritis/ulcer possible', severity: 'common', description: 'Epigastric pain with nausea or bleeding concern' },
    { condition_id: 'ibs_possible', name: 'IBS possible', severity: 'common', description: 'Chronic abdominal discomfort with bowel changes' },
    { condition_id: 'constipation', name: 'Constipation', severity: 'common', description: 'Infrequent hard stools and straining' },
    { condition_id: 'uti_uncomplicated', name: 'UTI possible (uncomplicated)', severity: 'common', description: 'Dysuria and frequency without systemic signs' },
    { condition_id: 'kidney_stone_possible', name: 'Kidney stone possible', severity: 'common', description: 'Flank pain with urinary symptoms' },
    { condition_id: 'low_back_pain_strain', name: 'Low back strain', severity: 'common', description: 'Mechanical back pain after activity' },
    { condition_id: 'neck_strain', name: 'Neck strain', severity: 'common', description: 'Neck pain/stiffness after posture or activity' },
    { condition_id: 'shoulder_strain', name: 'Shoulder strain', severity: 'common', description: 'Shoulder pain after activity or overuse' },
    { condition_id: 'sprain_strain_minor_injury', name: 'Minor sprain/strain', severity: 'common', description: 'Localized pain after minor injury' },
    { condition_id: 'contact_dermatitis', name: 'Contact dermatitis', severity: 'common', description: 'Rash after exposure/irritant' },
    { condition_id: 'urticaria_hives', name: 'Urticaria (hives)', severity: 'common', description: 'Itchy welts often due to allergic triggers' },
    { condition_id: 'cellulitis_possible', name: 'Cellulitis possible', severity: 'common', description: 'Spreading redness/warmth suggesting skin infection' },
    { condition_id: 'benign_vertigo_possible', name: 'Benign vertigo possible', severity: 'common', description: 'Positional dizziness without neuro red flags' },
    { condition_id: 'tension_dizziness', name: 'Tension-related dizziness', severity: 'common', description: 'Lightheadedness associated with stress or dehydration' },
    { condition_id: 'anxiety_related_symptoms', name: 'Anxiety-related symptoms', severity: 'common', description: 'Symptoms such as palpitations, sweating, worry' },
    { condition_id: 'panic_attack_possible', name: 'Panic attack possible', severity: 'common', description: 'Acute episodes of fear with physical symptoms' },
    { condition_id: 'sleep_disorder_possible', name: 'Sleep disorder possible', severity: 'common', description: 'Poor sleep quality with daytime impairment' },
    { condition_id: 'stress_related_symptoms', name: 'Stress-related symptoms', severity: 'common', description: 'Somatic symptoms associated with high stress' },
    { condition_id: 'hypertension_risk', name: 'Hypertension risk', severity: 'common', description: 'Elevated BP readings without emergency criteria' },
    { condition_id: 'hypertensive_urgency_risk', name: 'Hypertensive urgency risk', severity: 'serious_bucket', description: 'Very high BP requiring prompt evaluation' },
    { condition_id: 'hyperglycemia_risk_prediabetes_diabetes', name: 'Hyperglycemia risk', severity: 'serious_bucket', description: 'Symptoms suggesting elevated blood glucose' },
    { condition_id: 'respiratory_compromise_risk', name: 'Respiratory compromise risk', severity: 'serious_bucket', description: 'Low oxygen or significant breathing difficulty risk' },
    { condition_id: 'dehydration_risk', name: 'Dehydration risk', severity: 'serious_bucket', description: 'Fluid loss risk with signs of hemodynamic stress' },
    { condition_id: 'infection_risk_systemic', name: 'Systemic infection risk', severity: 'serious_bucket', description: 'Concerning infection pattern requiring evaluation' },
    { condition_id: 'neurologic_warning_risk', name: 'Neurologic warning risk', severity: 'serious_bucket', description: 'Possible neurologic emergency pattern' },
    { condition_id: 'cardiac_warning_risk', name: 'Cardiac warning risk', severity: 'serious_bucket', description: 'Possible cardiac emergency pattern' },
  ];
  
  // ============= RED FLAGS (nodes_redflag) =============
  export interface RedFlag {
    redflag_id: string;
    name: string;
    urgency: 'ER_now' | 'same_day_urgent_eval';
  }
  
  export const RED_FLAGS: RedFlag[] = [
    { redflag_id: 'redflag_chest_pain', name: 'Chest pain', urgency: 'ER_now' },
    { redflag_id: 'redflag_severe_shortness_of_breath', name: 'Severe shortness of breath', urgency: 'ER_now' },
    { redflag_id: 'redflag_spo2_low', name: 'Low oxygen saturation', urgency: 'ER_now' },
    { redflag_id: 'redflag_bp_very_high', name: 'Very high blood pressure', urgency: 'same_day_urgent_eval' },
    { redflag_id: 'redflag_fainting_syncope', name: 'Fainting/syncope', urgency: 'ER_now' },
    { redflag_id: 'redflag_new_neuro_deficit', name: 'New neurologic deficit', urgency: 'ER_now' },
    { redflag_id: 'redflag_severe_headache_sudden', name: 'Sudden severe headache', urgency: 'ER_now' },
    { redflag_id: 'redflag_high_fever_persistent', name: 'High fever persistent', urgency: 'same_day_urgent_eval' },
    { redflag_id: 'redflag_neck_stiffness_photophobia', name: 'Neck stiffness with photophobia', urgency: 'ER_now' },
    { redflag_id: 'redflag_severe_dehydration', name: 'Severe dehydration signs', urgency: 'same_day_urgent_eval' },
    { redflag_id: 'redflag_bloody_stool_or_vomit', name: 'Blood in stool or vomit', urgency: 'ER_now' },
    { redflag_id: 'redflag_severe_abdominal_pain', name: 'Severe abdominal pain', urgency: 'ER_now' },
    { redflag_id: 'redflag_severe_allergic_reaction', name: 'Severe allergic reaction symptoms', urgency: 'ER_now' },
    { redflag_id: 'redflag_uncontrolled_hyperglycemia', name: 'Concerning hyperglycemia symptoms', urgency: 'same_day_urgent_eval' },
    { redflag_id: 'redflag_possible_sepsis', name: 'Possible sepsis pattern', urgency: 'ER_now' },
    { redflag_id: 'redflag_acute_confusion', name: 'Acute confusion', urgency: 'ER_now' },
    { redflag_id: 'redflag_uncontrolled_pain', name: 'Uncontrolled severe pain', urgency: 'ER_now' },
    { redflag_id: 'redflag_pregnancy_complication', name: 'Possible pregnancy complication', urgency: 'ER_now' },
  ];
  
  // ============= SYMPTOMS (nodes_symptom) =============
  export interface Symptom {
    symptom_id: string;
    name: string;
    category: 'systemic' | 'respiratory' | 'allergy' | 'neuro' | 'gi' | 'gu' | 'skin' | 'metabolic' | 'lifestyle' | 'sleep' | 'cardio' | 'psych' | 'msk' | 'other';
  }
  
  export const SYMPTOMS: Symptom[] = [
    { symptom_id: 'fever', name: 'Fever', category: 'systemic' },
    { symptom_id: 'cough', name: 'Cough', category: 'respiratory' },
    { symptom_id: 'sore_throat', name: 'Sore throat', category: 'respiratory' },
    { symptom_id: 'runny_nose', name: 'Runny nose', category: 'respiratory' },
    { symptom_id: 'nasal_congestion', name: 'Nasal congestion', category: 'respiratory' },
    { symptom_id: 'sneezing', name: 'Sneezing', category: 'allergy' },
    { symptom_id: 'itchy_eyes', name: 'Itchy eyes', category: 'allergy' },
    { symptom_id: 'body_aches', name: 'Body aches', category: 'systemic' },
    { symptom_id: 'fatigue', name: 'Fatigue', category: 'systemic' },
    { symptom_id: 'headache', name: 'Headache', category: 'neuro' },
    { symptom_id: 'dizziness', name: 'Dizziness', category: 'neuro' },
    { symptom_id: 'shortness_of_breath', name: 'Shortness of breath', category: 'respiratory' },
    { symptom_id: 'wheezing', name: 'Wheezing', category: 'respiratory' },
    { symptom_id: 'chest_pain', name: 'Chest pain', category: 'other' },
    { symptom_id: 'chest_tightness', name: 'Chest tightness', category: 'respiratory' },
    { symptom_id: 'nausea', name: 'Nausea', category: 'gi' },
    { symptom_id: 'vomiting', name: 'Vomiting', category: 'gi' },
    { symptom_id: 'diarrhea', name: 'Diarrhea', category: 'gi' },
    { symptom_id: 'abdominal_pain', name: 'Abdominal pain', category: 'gi' },
    { symptom_id: 'heartburn', name: 'Heartburn', category: 'gi' },
    { symptom_id: 'blood_in_stool', name: 'Blood in stool', category: 'gi' },
    { symptom_id: 'blood_in_vomit', name: 'Blood in vomit', category: 'gi' },
    { symptom_id: 'flank_pain', name: 'Flank pain', category: 'gu' },
    { symptom_id: 'painful_urination', name: 'Painful urination', category: 'gu' },
    { symptom_id: 'urinary_frequency', name: 'Urinary frequency', category: 'gu' },
    { symptom_id: 'rash', name: 'Rash', category: 'skin' },
    { symptom_id: 'hives', name: 'Hives', category: 'skin' },
    { symptom_id: 'skin_redness_warmth', name: 'Skin redness/warmth', category: 'skin' },
    { symptom_id: 'rash_spreading', name: 'Rash spreading', category: 'skin' },
    { symptom_id: 'skin_pain', name: 'Skin pain', category: 'skin' },
    { symptom_id: 'polyuria', name: 'Frequent urination', category: 'metabolic' },
    { symptom_id: 'polydipsia', name: 'Increased thirst', category: 'metabolic' },
    { symptom_id: 'blurred_vision', name: 'Blurred vision', category: 'metabolic' },
    { symptom_id: 'polyphagia', name: 'Increased appetite', category: 'metabolic' },
    { symptom_id: 'poor_wound_healing', name: 'Poor wound healing', category: 'metabolic' },
    { symptom_id: 'neck_stiffness', name: 'Neck stiffness', category: 'neuro' },
    { symptom_id: 'photophobia', name: 'Light sensitivity', category: 'neuro' },
    { symptom_id: 'sound_sensitivity', name: 'Sound sensitivity', category: 'neuro' },
    { symptom_id: 'new_weakness', name: 'New weakness', category: 'neuro' },
    { symptom_id: 'confusion', name: 'Confusion', category: 'neuro' },
    { symptom_id: 'tingling', name: 'Tingling', category: 'neuro' },
    { symptom_id: 'numbness', name: 'Numbness', category: 'neuro' },
    { symptom_id: 'balance_issues', name: 'Balance issues', category: 'neuro' },
    { symptom_id: 'double_vision', name: 'Double vision', category: 'neuro' },
    { symptom_id: 'eye_strain', name: 'Eye strain', category: 'neuro' },
    { symptom_id: 'screen_overuse', name: 'Prolonged screen use', category: 'lifestyle' },
    { symptom_id: 'poor_posture', name: 'Poor posture', category: 'lifestyle' },
    { symptom_id: 'sleep_loss', name: 'Sleep loss', category: 'lifestyle' },
    { symptom_id: 'snoring', name: 'Snoring', category: 'sleep' },
    { symptom_id: 'daytime_sleepiness', name: 'Daytime sleepiness', category: 'sleep' },
    { symptom_id: 'palpitations', name: 'Palpitations', category: 'cardio' },
    { symptom_id: 'tremor', name: 'Tremor', category: 'neuro' },
    { symptom_id: 'sweating', name: 'Sweating', category: 'systemic' },
    { symptom_id: 'anxiety', name: 'Anxiety', category: 'psych' },
    { symptom_id: 'panic', name: 'Panic episode', category: 'psych' },
    { symptom_id: 'upper_back_pain', name: 'Upper back pain', category: 'msk' },
    { symptom_id: 'neck_pain', name: 'Neck pain', category: 'msk' },
    { symptom_id: 'shoulder_pain', name: 'Shoulder pain', category: 'msk' },
    { symptom_id: 'low_back_pain', name: 'Low back pain', category: 'msk' },
    { symptom_id: 'joint_swelling', name: 'Joint swelling', category: 'msk' },
    { symptom_id: 'joint_stiffness', name: 'Joint stiffness', category: 'msk' },
    { symptom_id: 'chills', name: 'Chills', category: 'systemic' },
    { symptom_id: 'weight_loss', name: 'Weight loss', category: 'systemic' },
    { symptom_id: 'weight_gain', name: 'Weight gain', category: 'systemic' },
    { symptom_id: 'night_sweats', name: 'Night sweats', category: 'systemic' },
    { symptom_id: 'leg_swelling', name: 'Leg swelling', category: 'cardio' },
    { symptom_id: 'urinary_urgency', name: 'Urinary urgency', category: 'gu' },
    { symptom_id: 'blood_in_urine', name: 'Blood in urine', category: 'gu' },
    { symptom_id: 'itching', name: 'Itching', category: 'skin' },
    { symptom_id: 'joint_pain', name: 'Joint pain', category: 'msk' },
    { symptom_id: 'muscle_pain', name: 'Muscle pain', category: 'msk' },
    { symptom_id: 'fainting_syncope', name: 'Fainting or near-fainting', category: 'neuro' },
    { symptom_id: 'constipation', name: 'Constipation', category: 'gi' },
  ];
  
  // ============= VITAL RULES (nodes_vital_rule) =============
  export interface VitalRule {
    rule_id: string;
    name: string;
    vital: string;
    operator: '<' | '<=' | '>=' | '>';
    threshold: number;
    unit: string;
  }
  
  export const VITAL_RULES: VitalRule[] = [
    { rule_id: 'spo2_critical', name: 'SpO2 critical low', vital: 'spo2', operator: '<', threshold: 90, unit: '%' },
    { rule_id: 'spo2_low', name: 'Low oxygen saturation', vital: 'spo2', operator: '<', threshold: 92, unit: '%' },
    { rule_id: 'spo2_borderline', name: 'Borderline oxygen saturation', vital: 'spo2', operator: '<=', threshold: 94, unit: '%' },
    { rule_id: 'bp_stage2_sys', name: 'High systolic BP (stage 2)', vital: 'bp_systolic', operator: '>=', threshold: 160, unit: 'mmHg' },
    { rule_id: 'bp_urgency_sys', name: 'Very high systolic BP', vital: 'bp_systolic', operator: '>=', threshold: 180, unit: 'mmHg' },
    { rule_id: 'bp_urgency_dia', name: 'Very high diastolic BP', vital: 'bp_diastolic', operator: '>=', threshold: 120, unit: 'mmHg' },
    { rule_id: 'hr_tachy', name: 'Tachycardia', vital: 'heart_rate', operator: '>=', threshold: 120, unit: 'bpm' },
    { rule_id: 'hr_brady', name: 'Bradycardia', vital: 'heart_rate', operator: '<=', threshold: 45, unit: 'bpm' },
    { rule_id: 'temp_high', name: 'High fever', vital: 'temperature_c', operator: '>=', threshold: 39, unit: 'C' },
    { rule_id: 'temp_moderate', name: 'Fever', vital: 'temperature_c', operator: '>=', threshold: 38, unit: 'C' },
    { rule_id: 'temp_low', name: 'Low temperature', vital: 'temperature_c', operator: '<=', threshold: 35, unit: 'C' },
  ];
  
  // ============= LABS (nodes_lab) =============
  export interface Lab {
    lab_id: string;
    name: string;
  }
  
  export const LABS: Lab[] = [
    { lab_id: 'cbc', name: 'Complete blood count (CBC)' },
    { lab_id: 'cmp_bmp', name: 'Metabolic panel (BMP/CMP)' },
    { lab_id: 'hba1c', name: 'Hemoglobin A1c' },
    { lab_id: 'fasting_glucose', name: 'Fasting plasma glucose' },
    { lab_id: 'urinalysis', name: 'Urinalysis' },
    { lab_id: 'ekg', name: 'Electrocardiogram (EKG)' },
    { lab_id: 'troponin', name: 'Troponin' },
    { lab_id: 'chest_xray', name: 'Chest X-ray' },
    { lab_id: 'flu_test', name: 'Influenza test' },
    { lab_id: 'covid_test', name: 'COVID test' },
    { lab_id: 'strep_test', name: 'Rapid strep test' },
    { lab_id: 'viral_panel', name: 'Respiratory viral panel' },
    { lab_id: 'd_dimer', name: 'D-dimer (if indicated)' },
  ];
  
  // ============= SPECIALISTS (nodes_specialist) =============
  export interface Specialist {
    specialist_id: string;
    name: string;
  }
  
  export const SPECIALISTS: Specialist[] = [
    { specialist_id: 'primary_care', name: 'Primary care' },
    { specialist_id: 'urgent_care', name: 'Urgent care' },
    { specialist_id: 'emergency_department', name: 'Emergency department' },
    { specialist_id: 'cardiology', name: 'Cardiology' },
    { specialist_id: 'neurology', name: 'Neurology' },
    { specialist_id: 'endocrinology', name: 'Endocrinology' },
    { specialist_id: 'pulmonology', name: 'Pulmonology' },
    { specialist_id: 'allergy_immunology', name: 'Allergy/Immunology' },
    { specialist_id: 'dermatology', name: 'Dermatology' },
    { specialist_id: 'gastroenterology', name: 'Gastroenterology' },
    { specialist_id: 'urology', name: 'Urology' },
    { specialist_id: 'orthopedics', name: 'Orthopedics' },
    { specialist_id: 'physical_therapy', name: 'Physical therapy' },
  ];
  
  // ============= MEDICATIONS (nodes_medication_option) =============
  export interface MedicationOption {
    med_id: string;
    name: string;
    category: 'OTC' | 'supportive' | 'clinician_discussion';
    notes: string;
  }
  
  export const MEDICATION_OPTIONS: MedicationOption[] = [
    { med_id: 'acetaminophen_category', name: 'Acetaminophen category', category: 'OTC', notes: 'Fever/pain relief category; clinician review required' },
    { med_id: 'nsaid_category', name: 'NSAID category', category: 'OTC', notes: 'Pain/inflammation relief category; clinician review required' },
    { med_id: 'antihistamine_nondrowsy', name: 'Non-drowsy antihistamine', category: 'OTC', notes: 'Allergy symptom relief category' },
    { med_id: 'intranasal_steroid', name: 'Intranasal steroid spray', category: 'OTC', notes: 'Allergy/congestion category' },
    { med_id: 'saline_rinse', name: 'Saline nasal rinse', category: 'supportive', notes: 'Supportive congestion relief' },
    { med_id: 'antacid_category', name: 'Antacid category', category: 'OTC', notes: 'Reflux symptom relief category' },
    { med_id: 'acid_reducer_h2', name: 'Acid reducer (H2 blocker)', category: 'OTC', notes: 'Reflux symptom relief category' },
    { med_id: 'oral_rehydration', name: 'Oral rehydration solution', category: 'supportive', notes: 'Hydration support category' },
    { med_id: 'antiemetic_category', name: 'Antiemetic category', category: 'clinician_discussion', notes: 'Discuss nausea management options' },
    { med_id: 'topical_steroid_low', name: 'Topical anti-itch steroid (low potency)', category: 'OTC', notes: 'Itch relief category' },
    { med_id: 'topical_antifungal', name: 'Topical antifungal category', category: 'OTC', notes: 'Discuss if fungal rash suspected' },
    { med_id: 'bronchodilator_category', name: 'Bronchodilator category', category: 'clinician_discussion', notes: 'Discuss if wheeze/airway symptoms present' },
    { med_id: 'nasal_decongestant', name: 'Nasal decongestant category', category: 'OTC', notes: 'Congestion relief category; clinician review required' },
    { med_id: 'sleep_aid_nonprescription', name: 'Non-prescription sleep aid category', category: 'OTC', notes: 'Short-term sleep support category; clinician review required' },
    { med_id: 'muscle_relaxant_discussion', name: 'Muscle relaxant discussion', category: 'clinician_discussion', notes: 'Discuss if muscle spasm suspected' },
  ];
  
  // ============= ACTIONS (nodes_action) =============
  export interface Action {
    action_id: string;
    name: string;
    category: 'supportive' | 'lifestyle' | 'exercise' | 'safety' | 'follow_up';
    notes: string;
  }
  
  export const ACTIONS: Action[] = [
    { action_id: 'action_hydration', name: 'Hydration', category: 'supportive', notes: 'Encourage adequate fluids if appropriate' },
    { action_id: 'action_rest', name: 'Rest', category: 'supportive', notes: 'Rest as needed' },
    { action_id: 'action_sleep_hygiene', name: 'Sleep hygiene', category: 'lifestyle', notes: 'Maintain consistent sleep routine' },
    { action_id: 'action_reduce_screen_time', name: 'Reduce screen time', category: 'lifestyle', notes: 'Reduce eye strain triggers if relevant' },
    { action_id: 'action_ergonomic_adjustments', name: 'Ergonomic adjustments', category: 'lifestyle', notes: 'Adjust desk/monitor/phone position' },
    { action_id: 'action_posture_correction', name: 'Posture correction', category: 'lifestyle', notes: 'Posture awareness and breaks' },
    { action_id: 'action_neck_stretches', name: 'Neck stretches', category: 'exercise', notes: 'Gentle stretching as tolerated' },
    { action_id: 'action_shoulder_mobility', name: 'Shoulder mobility', category: 'exercise', notes: 'Gentle range-of-motion as tolerated' },
    { action_id: 'action_gentle_activity', name: 'Gentle activity', category: 'supportive', notes: 'Movement as tolerated' },
    { action_id: 'action_activity_modification', name: 'Activity modification', category: 'lifestyle', notes: 'Avoid aggravating activities temporarily' },
    { action_id: 'action_avoid_triggers', name: 'Avoid triggers', category: 'lifestyle', notes: 'Avoid suspected triggers where possible' },
    { action_id: 'action_dietary_adjustments', name: 'Dietary adjustments', category: 'lifestyle', notes: 'Supportive diet modifications as appropriate' },
    { action_id: 'action_limit_alcohol', name: 'Limit alcohol', category: 'lifestyle', notes: 'Reduce alcohol intake if relevant' },
    { action_id: 'action_avoid_vaping', name: 'Avoid vaping', category: 'lifestyle', notes: 'Reduce airway irritant exposure if relevant' },
    { action_id: 'action_stress_management', name: 'Stress management', category: 'lifestyle', notes: 'Relaxation and coping strategies' },
    { action_id: 'action_breathing_exercises', name: 'Breathing exercises', category: 'supportive', notes: 'Breathing techniques if anxiety/stress' },
    { action_id: 'action_return_precautions', name: 'Return precautions', category: 'safety', notes: 'Seek care if symptoms worsen or red flags develop' },
    { action_id: 'action_symptom_monitoring', name: 'Symptom monitoring', category: 'follow_up', notes: 'Track symptom changes' },
    { action_id: 'action_bp_self_monitoring', name: 'BP self-monitoring', category: 'follow_up', notes: 'Home BP checks if clinician recommends' },
    { action_id: 'action_glucose_followup', name: 'Glucose follow-up plan', category: 'follow_up', notes: 'Follow-up evaluation for hyperglycemia' },
    { action_id: 'action_followup_primary_care', name: 'Follow-up with primary care', category: 'follow_up', notes: 'Schedule follow-up visit' },
    { action_id: 'action_followup_specialist', name: 'Follow-up with specialist', category: 'follow_up', notes: 'Schedule specialist visit if referred' },
  ];
  
  // ============= ASSISTANT ACTIONS (nodes_assistant_action) =============
  export interface AssistantAction {
    assistant_action_id: string;
    name: string;
    category: 'data_collection' | 'clarification' | 'follow_up';
    notes: string;
  }
  
  export const ASSISTANT_ACTIONS: AssistantAction[] = [
    { assistant_action_id: 'collect_spo2', name: 'Measure oxygen saturation (SpO2)', category: 'data_collection', notes: 'Needed to assess respiratory risk and red flags' },
    { assistant_action_id: 'collect_bp', name: 'Measure blood pressure', category: 'data_collection', notes: 'Needed to assess hypertension risk and red flags' },
    { assistant_action_id: 'collect_temperature', name: 'Measure temperature', category: 'data_collection', notes: 'Helps assess infection risk and severity' },
    { assistant_action_id: 'collect_heart_rate', name: 'Measure heart rate', category: 'data_collection', notes: 'Helps assess systemic stress and severity' },
    { assistant_action_id: 'collect_respiratory_rate', name: 'Measure respiratory rate', category: 'data_collection', notes: 'Supports respiratory severity assessment' },
    { assistant_action_id: 'collect_repeat_measurements', name: 'Repeat key measurements', category: 'data_collection', notes: 'Confirm abnormal vitals before disposition' },
    { assistant_action_id: 'clarify_symptom_severity', name: 'Clarify symptom severity', category: 'clarification', notes: 'Severity can change triage and urgency' },
    { assistant_action_id: 'clarify_symptom_duration', name: 'Clarify symptom duration', category: 'clarification', notes: 'Duration affects differential confidence' },
    { assistant_action_id: 'clarify_functional_impact', name: 'Clarify functional impact', category: 'clarification', notes: 'Functional limitation may affect urgency' },
    { assistant_action_id: 'clarify_posture_and_ergonomics', name: 'Clarify posture/ergonomics', category: 'follow_up', notes: 'Supports posture-related headache/strain assessment' },
    { assistant_action_id: 'clarify_screen_time', name: 'Clarify screen time', category: 'follow_up', notes: 'Supports eye strain and posture assessment' },
    { assistant_action_id: 'clarify_sleep_pattern', name: 'Clarify sleep pattern', category: 'follow_up', notes: 'Supports sleep-related symptoms assessment' },
    { assistant_action_id: 'clarify_stress_level', name: 'Clarify stress level', category: 'follow_up', notes: 'Supports stress-related symptoms assessment' },
    { assistant_action_id: 'clarify_substance_timing', name: 'Clarify timing relative to substances', category: 'follow_up', notes: 'Context may affect symptom interpretation' },
    { assistant_action_id: 'clarify_exposure_history', name: 'Clarify exposures (travel/sick contacts/new meds)', category: 'follow_up', notes: 'Exposure context may shift likely causes' },
    { assistant_action_id: 'clarify_neuro_symptoms', name: 'Screen for neurologic warning signs', category: 'follow_up', notes: 'Helps assess neurologic red flags' },
    { assistant_action_id: 'clarify_hydration_status', name: 'Clarify hydration status', category: 'follow_up', notes: 'Helps assess dehydration severity' },
    { assistant_action_id: 'clarify_pain_character', name: 'Clarify pain character/location', category: 'follow_up', notes: 'Supports abdominal pain/headache interpretation' },
  ];
  
  // ============= ASSISTANT ACTION UI MAP =============
  export interface AssistantActionUIMap {
    assistant_action_id: string;
    ui_control: 'number' | 'two_number' | 'dropdown' | 'textarea' | 'yes_no';
    field_keys: string;
    min_value?: number;
    max_value?: number;
    unit_label?: string;
    dropdown_options?: string;
    placeholder_text: string;
  }
  
  export const ASSISTANT_ACTION_UI_MAP: AssistantActionUIMap[] = [
    { assistant_action_id: 'collect_spo2', ui_control: 'number', field_keys: 'spo2', min_value: 50, max_value: 100, unit_label: '%', placeholder_text: 'Enter oxygen saturation' },
    { assistant_action_id: 'collect_bp', ui_control: 'two_number', field_keys: 'bp_systolic,bp_diastolic', min_value: 50, max_value: 250, unit_label: 'mmHg', placeholder_text: 'Enter blood pressure' },
    { assistant_action_id: 'collect_temperature', ui_control: 'number', field_keys: 'temperature_c', min_value: 30, max_value: 45, unit_label: 'C', placeholder_text: 'Enter temperature' },
    { assistant_action_id: 'collect_heart_rate', ui_control: 'number', field_keys: 'heart_rate', min_value: 30, max_value: 220, unit_label: 'bpm', placeholder_text: 'Enter heart rate' },
    { assistant_action_id: 'collect_respiratory_rate', ui_control: 'number', field_keys: 'respiratory_rate', min_value: 5, max_value: 60, unit_label: 'breaths/min', placeholder_text: 'Enter respiratory rate' },
    { assistant_action_id: 'collect_repeat_measurements', ui_control: 'dropdown', field_keys: 'repeat_measurement_type', dropdown_options: 'bp,spo2,temperature,heart_rate,respiratory_rate', placeholder_text: 'Choose measurement to repeat' },
    { assistant_action_id: 'clarify_symptom_severity', ui_control: 'dropdown', field_keys: 'symptom_severity', dropdown_options: 'mild,moderate,severe', placeholder_text: 'Select severity' },
    { assistant_action_id: 'clarify_symptom_duration', ui_control: 'dropdown', field_keys: 'symptom_duration', dropdown_options: 'today,days,weeks,months', placeholder_text: 'Select duration' },
    { assistant_action_id: 'clarify_functional_impact', ui_control: 'dropdown', field_keys: 'functional_impact', dropdown_options: 'none,mild,moderate,severe', placeholder_text: 'Select impact' },
    { assistant_action_id: 'clarify_posture_and_ergonomics', ui_control: 'textarea', field_keys: 'posture_notes', placeholder_text: 'Add posture and ergonomics details' },
    { assistant_action_id: 'clarify_screen_time', ui_control: 'dropdown', field_keys: 'screen_time_level', dropdown_options: 'low,moderate,high', placeholder_text: 'Select screen time level' },
    { assistant_action_id: 'clarify_sleep_pattern', ui_control: 'dropdown', field_keys: 'sleep_quality', dropdown_options: 'good,fair,poor,irregular', placeholder_text: 'Select sleep quality' },
    { assistant_action_id: 'clarify_stress_level', ui_control: 'dropdown', field_keys: 'stress_level', dropdown_options: 'low,moderate,high', placeholder_text: 'Select stress level' },
    { assistant_action_id: 'clarify_substance_timing', ui_control: 'textarea', field_keys: 'substance_timing_notes', placeholder_text: 'Add timing details (optional)' },
    { assistant_action_id: 'clarify_exposure_history', ui_control: 'textarea', field_keys: 'exposure_notes', placeholder_text: 'Add exposure details (optional)' },
    { assistant_action_id: 'clarify_neuro_symptoms', ui_control: 'yes_no', field_keys: 'neuro_red_flags_present', placeholder_text: 'Any new weakness, facial droop, or speech trouble?' },
    { assistant_action_id: 'clarify_hydration_status', ui_control: 'dropdown', field_keys: 'hydration_status', dropdown_options: 'adequate,possibly_low,low', placeholder_text: 'Select hydration status' },
    { assistant_action_id: 'clarify_pain_character', ui_control: 'textarea', field_keys: 'pain_character_notes', placeholder_text: 'Describe pain character/location' },
  ];
  
  // ============= PATIENT GUIDES (nodes_patient_guide) =============
  export interface PatientGuide {
    guide_id: string;
    title: string;
    filename: string;
    category: 'ergonomics' | 'exercise' | 'education' | 'followup' | 'safety';
    description: string;
  }
  
  export const PATIENT_GUIDES: PatientGuide[] = [
    { guide_id: 'guide_posture_ergonomics', title: 'Posture and ergonomics guide', filename: 'posture_ergonomics.pdf', category: 'ergonomics', description: 'Tips for computer and phone posture' },
    { guide_id: 'guide_computer_phone_posture', title: 'Computer and phone posture', filename: 'computer_phone_posture.pdf', category: 'ergonomics', description: 'Reducing strain from device use' },
    { guide_id: 'guide_neck_stretches', title: 'Neck stretches and mobility', filename: 'neck_stretches.pdf', category: 'exercise', description: 'Gentle exercises for neck strain' },
    { guide_id: 'guide_shoulder_mobility', title: 'Shoulder mobility exercises', filename: 'shoulder_mobility.pdf', category: 'exercise', description: 'Gentle exercises for shoulder strain' },
    { guide_id: 'guide_migraine_selfcare', title: 'Migraine self-care guide', filename: 'migraine_selfcare.pdf', category: 'education', description: 'Triggers and supportive steps' },
    { guide_id: 'guide_sleep_hygiene', title: 'Sleep hygiene guide', filename: 'sleep_hygiene.pdf', category: 'education', description: 'Sleep routine tips' },
    { guide_id: 'guide_hydration', title: 'Hydration guide', filename: 'hydration.pdf', category: 'education', description: 'Hydration and dehydration signs' },
    { guide_id: 'guide_stress_management', title: 'Stress management guide', filename: 'stress_management.pdf', category: 'education', description: 'Coping strategies' },
    { guide_id: 'guide_breathing_exercises', title: 'Breathing exercises', filename: 'breathing_exercises.pdf', category: 'exercise', description: 'Simple breathing techniques' },
    { guide_id: 'guide_bp_monitoring', title: 'Blood pressure monitoring', filename: 'bp_monitoring.pdf', category: 'followup', description: 'Home BP measurement tips' },
    { guide_id: 'guide_glucose_followup', title: 'Glucose follow-up info', filename: 'glucose_followup.pdf', category: 'followup', description: 'Follow-up steps for glucose evaluation' },
    { guide_id: 'guide_return_precautions', title: 'Return precautions', filename: 'return_precautions.pdf', category: 'safety', description: 'When to seek urgent care' },
    { guide_id: 'guide_when_urgent', title: 'When to seek urgent care', filename: 'when_to_seek_urgent_care.pdf', category: 'safety', description: 'Urgent warning signs' },
    { guide_id: 'guide_allergy_avoidance', title: 'Allergy trigger avoidance', filename: 'allergy_avoidance.pdf', category: 'education', description: 'Avoiding common allergens' },
    { guide_id: 'guide_gi_diet', title: 'Diet tips for GI symptoms', filename: 'diet_gi_symptoms.pdf', category: 'education', description: 'Supportive diet guidance' },
    { guide_id: 'guide_exercise_safety', title: 'Exercise safety', filename: 'exercise_safety.pdf', category: 'education', description: 'Safe movement guidance' },
    { guide_id: 'guide_workplace_ergonomics', title: 'Workplace ergonomics', filename: 'workplace_ergonomics.pdf', category: 'ergonomics', description: 'Desk setup guidance' },
    { guide_id: 'guide_substance_health', title: 'Substance use and health', filename: 'substance_health_info.pdf', category: 'education', description: 'Non-judgmental health information' },
  ];
  
  // ============= MESSAGE TEMPLATES (nodes_message_template) =============
  export interface MessageTemplate {
    template_id: string;
    name: string;
    subject_template: string;
    body_template: string;
  }
  
  export const MESSAGE_TEMPLATES: MessageTemplate[] = [
    {
      template_id: 'tmpl_general',
      name: 'General visit summary',
      subject_template: 'Your visit summary and next steps',
      body_template: `Hello {patient_name},
  
  Thank you for completing your visit today.
  
  Summary:
  {plan_summary}
  
  Follow-up:
  {followup_instructions}
  
  Important:
  {return_precautions}
  
  Best regards,
  {clinic_name}`,
    },
    {
      template_id: 'tmpl_posture_headache',
      name: 'Posture-related headache guidance',
      subject_template: 'Your visit summary and posture-related headache guidance',
      body_template: `Hello {patient_name},
  
  Your clinician reviewed your visit and discussed that your symptoms may be related to posture and muscle strain.
  
  Plan:
  {plan_summary}
  
  Attachments:
  - Posture and ergonomics guidance
  - Exercises as appropriate
  
  Follow-up:
  {followup_instructions}
  
  Important:
  {return_precautions}
  
  {clinic_name}`,
    },
    {
      template_id: 'tmpl_urgent',
      name: 'Urgent follow-up',
      subject_template: 'Important follow-up from your visit',
      body_template: `Hello {patient_name},
  
  Your care team identified findings that require prompt evaluation.
  
  Next steps:
  {plan_summary}
  
  If symptoms worsen or urgent warning signs develop, seek care promptly.
  
  {clinic_name}`,
    },
  ];
  
  // ============= INTAKE QUESTIONNAIRE (intake_questionnaire) =============
  export interface IntakeQuestion {
    question_id: string;
    section: string;
    question_text: string;
    question_type: 'checkbox' | 'date' | 'free_text' | 'ui_component' | 'numeric' | 'radio' | 'yes_no' | 'multi_select' | 'numeric_or_unknown' | 'two_number_or_unknown' | 'structured';
    required: boolean;
    tier: 1 | 2 | 3;
    maps_to: string;
    notes?: string;
  }
  
  export const INTAKE_QUESTIONNAIRE: IntakeQuestion[] = [
    // Consent
    { question_id: 'consent_ack', section: 'Consent', question_text: 'I understand this tool is not a diagnosis and a clinician will review.', question_type: 'checkbox', required: true, tier: 1, maps_to: 'consent.accepted' },
    { question_id: 'disclaimer_med_use', section: 'Consent', question_text: 'I understand my answers are used only for medical care.', question_type: 'checkbox', required: true, tier: 1, maps_to: 'consent.medical_use_only' },
    { question_id: 'disclaimer_no_prosecution', section: 'Consent', question_text: 'I understand answers are not shared for law enforcement purposes.', question_type: 'checkbox', required: true, tier: 1, maps_to: 'consent.no_law_enforcement' },
    
    // Demographics
    { question_id: 'demo_birthdate', section: 'Demographics', question_text: 'Birthdate', question_type: 'date', required: true, tier: 1, maps_to: 'patient.birthdate' },
    { question_id: 'demo_language', section: 'Demographics', question_text: 'Preferred language (optional)', question_type: 'free_text', required: false, tier: 3, maps_to: 'patient.preferred_language' },
    
    // Chief Concern
    { question_id: 'cc_open', section: 'Chief Concern', question_text: 'What brings you in today?', question_type: 'free_text', required: true, tier: 1, maps_to: 'context.chief_concern' },
    
    // Body Map
    { question_id: 'bodymap_select', section: 'Body Map', question_text: 'Select areas of concern on the body map (front/back).', question_type: 'ui_component', required: false, tier: 1, maps_to: 'issues[].body_region_id', notes: 'Creates issue cards' },
    
    // Issue Card
    { question_id: 'issue_desc', section: 'Issue Card', question_text: 'Describe what\'s wrong in this area.', question_type: 'free_text', required: true, tier: 1, maps_to: 'issues[].description' },
    { question_id: 'issue_pain', section: 'Issue Card', question_text: 'Pain severity (0–10)', question_type: 'numeric', required: true, tier: 1, maps_to: 'issues[].pain_score_0_10' },
    { question_id: 'issue_function', section: 'Issue Card', question_text: 'Functional impact', question_type: 'radio', required: true, tier: 1, maps_to: 'issues[].functional_impact', notes: 'none/mild/moderate/severe' },
    { question_id: 'issue_onset', section: 'Issue Card', question_text: 'When did it start?', question_type: 'radio', required: true, tier: 1, maps_to: 'issues[].onset', notes: 'today/days/weeks/months' },
    { question_id: 'issue_course', section: 'Issue Card', question_text: 'Has it been improving, worsening, or unchanged?', question_type: 'radio', required: true, tier: 1, maps_to: 'issues[].course' },
    { question_id: 'issue_triggers', section: 'Issue Card', question_text: 'Any triggers? (optional)', question_type: 'free_text', required: false, tier: 3, maps_to: 'issues[].triggers' },
    { question_id: 'issue_relief', section: 'Issue Card', question_text: 'What makes it better? (optional)', question_type: 'free_text', required: false, tier: 3, maps_to: 'issues[].relief_factors' },
    
    // Red Flags
    { question_id: 'rf_chest_pain', section: 'Red Flags', question_text: 'Chest pain or pressure', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.chest_pain' },
    { question_id: 'rf_severe_sob', section: 'Red Flags', question_text: 'Severe shortness of breath', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.severe_shortness_of_breath' },
    { question_id: 'rf_faint_confuse', section: 'Red Flags', question_text: 'Fainting or confusion', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.fainting_or_confusion' },
    { question_id: 'rf_new_neuro', section: 'Red Flags', question_text: 'New weakness, facial droop, or trouble speaking', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.new_neuro_deficit' },
    { question_id: 'rf_thunder_headache', section: 'Red Flags', question_text: 'Sudden severe headache', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.sudden_severe_headache' },
    { question_id: 'rf_fever_neck', section: 'Red Flags', question_text: 'High fever with stiff neck', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.fever_with_neck_stiffness' },
    { question_id: 'rf_blood_vomit_stool', section: 'Red Flags', question_text: 'Blood in vomit or stool', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.blood_in_vomit_or_stool' },
    { question_id: 'rf_severe_abd', section: 'Red Flags', question_text: 'Severe abdominal pain', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.severe_abdominal_pain' },
    { question_id: 'rf_preg_comp', section: 'Red Flags', question_text: 'Pregnancy-related bleeding or severe pain (if applicable)', question_type: 'yes_no', required: true, tier: 1, maps_to: 'red_flags.pregnancy_complication' },
    
    // Vitals
    { question_id: 'v_temp', section: 'Vitals', question_text: 'Temperature', question_type: 'numeric_or_unknown', required: true, tier: 1, maps_to: 'vitals.temperature_c', notes: 'Unknown allowed' },
    { question_id: 'v_bp', section: 'Vitals', question_text: 'Blood pressure (systolic/diastolic)', question_type: 'two_number_or_unknown', required: true, tier: 1, maps_to: 'vitals.bp', notes: 'Unknown allowed' },
    { question_id: 'v_hr', section: 'Vitals', question_text: 'Heart rate', question_type: 'numeric_or_unknown', required: true, tier: 1, maps_to: 'vitals.heart_rate', notes: 'Unknown allowed' },
    { question_id: 'v_spo2', section: 'Vitals', question_text: 'Oxygen saturation (SpO₂)', question_type: 'numeric_or_unknown', required: true, tier: 1, maps_to: 'vitals.spo2', notes: 'Unknown allowed' },
  ];
  
  // ============= TELEHEALTH QUESTIONNAIRE (telehealth_questionnaire) =============
  export const TELEHEALTH_QUESTIONNAIRE: IntakeQuestion[] = [
    { question_id: 'tele_cc_open', section: 'Chief Concern', question_text: 'What brings you in today?', question_type: 'free_text', required: true, tier: 1, maps_to: 'context.chief_concern' },
    { question_id: 'tele_symptoms_core', section: 'Symptoms', question_text: 'Select symptoms (condensed checklist)', question_type: 'ui_component', required: true, tier: 1, maps_to: 'symptoms[]', notes: 'Use same symptom IDs as full intake' },
    { question_id: 'tele_redflags', section: 'Red Flags', question_text: 'Answer red-flag screening questions', question_type: 'ui_component', required: true, tier: 1, maps_to: 'red_flags', notes: 'Same as full red flags' },
    { question_id: 'tele_meds', section: 'Medications', question_text: 'List medications/supplements', question_type: 'free_text', required: true, tier: 1, maps_to: 'history.medications_free_text' },
    { question_id: 'tele_allergies', section: 'Allergies', question_text: 'List drug allergies and reactions', question_type: 'free_text', required: true, tier: 1, maps_to: 'history.allergies_drug_text', notes: 'Allow "none"' },
    { question_id: 'tele_pmh', section: 'Medical History', question_text: 'Select chronic conditions', question_type: 'multi_select', required: false, tier: 2, maps_to: 'history.conditions' },
    { question_id: 'tele_vitals', section: 'Vitals', question_text: 'Enter vitals if known (unknown allowed)', question_type: 'ui_component', required: true, tier: 1, maps_to: 'vitals', notes: 'Unknown triggers assistant actions' },
    { question_id: 'tele_social_short', section: 'Social History', question_text: 'Tobacco/vape and alcohol (short)', question_type: 'ui_component', required: false, tier: 2, maps_to: 'history.social', notes: 'Prefer not to say allowed' },
    { question_id: 'tele_ros_other', section: 'Other', question_text: 'Anything else you want to add?', question_type: 'free_text', required: false, tier: 3, maps_to: 'context.ros_other' },
  ];
  
  // ============= SYMPTOM CONDITION SUPPORTS (edges_supports) =============
  export interface SymptomConditionSupport {
    from_type: 'Symptom' | 'VitalRule';
    from_id: string;
    condition_id: string;
    weight: number;
  }
  
  export const SYMPTOM_CONDITION_SUPPORTS: SymptomConditionSupport[] = [
    { from_type: 'Symptom', from_id: 'poor_posture', condition_id: 'posture_related_headache', weight: 4 },
    { from_type: 'Symptom', from_id: 'screen_overuse', condition_id: 'eye_strain_headache', weight: 4 },
    { from_type: 'Symptom', from_id: 'eye_strain', condition_id: 'eye_strain_headache', weight: 4 },
    { from_type: 'Symptom', from_id: 'sleep_loss', condition_id: 'sleep_deprivation_headache', weight: 4 },
    { from_type: 'Symptom', from_id: 'headache', condition_id: 'tension_headache', weight: 3 },
    { from_type: 'Symptom', from_id: 'photophobia', condition_id: 'migraine_possible', weight: 4 },
    { from_type: 'Symptom', from_id: 'sound_sensitivity', condition_id: 'migraine_possible', weight: 4 },
    { from_type: 'Symptom', from_id: 'nausea', condition_id: 'migraine_possible', weight: 2 },
    { from_type: 'Symptom', from_id: 'neck_pain', condition_id: 'neck_strain', weight: 4 },
    { from_type: 'Symptom', from_id: 'neck_stiffness', condition_id: 'neck_strain', weight: 4 },
    { from_type: 'Symptom', from_id: 'upper_back_pain', condition_id: 'posture_related_headache', weight: 3 },
    { from_type: 'Symptom', from_id: 'shoulder_pain', condition_id: 'shoulder_strain', weight: 4 },
    { from_type: 'Symptom', from_id: 'palpitations', condition_id: 'anxiety_related_symptoms', weight: 3 },
    { from_type: 'Symptom', from_id: 'panic', condition_id: 'panic_attack_possible', weight: 4 },
    { from_type: 'Symptom', from_id: 'anxiety', condition_id: 'anxiety_related_symptoms', weight: 4 },
    { from_type: 'Symptom', from_id: 'dizziness', condition_id: 'tension_dizziness', weight: 2 },
    { from_type: 'Symptom', from_id: 'dizziness', condition_id: 'benign_vertigo_possible', weight: 3 },
    { from_type: 'Symptom', from_id: 'balance_issues', condition_id: 'benign_vertigo_possible', weight: 3 },
    { from_type: 'Symptom', from_id: 'itchy_eyes', condition_id: 'allergic_rhinitis', weight: 5 },
    { from_type: 'Symptom', from_id: 'sneezing', condition_id: 'allergic_rhinitis', weight: 4 },
    { from_type: 'Symptom', from_id: 'runny_nose', condition_id: 'allergic_rhinitis', weight: 3 },
    { from_type: 'Symptom', from_id: 'nasal_congestion', condition_id: 'allergic_rhinitis', weight: 3 },
    { from_type: 'Symptom', from_id: 'runny_nose', condition_id: 'viral_uri', weight: 3 },
    { from_type: 'Symptom', from_id: 'sore_throat', condition_id: 'viral_uri', weight: 2 },
    { from_type: 'Symptom', from_id: 'cough', condition_id: 'viral_uri', weight: 2 },
    { from_type: 'Symptom', from_id: 'fever', condition_id: 'influenza_like_illness', weight: 4 },
    { from_type: 'Symptom', from_id: 'body_aches', condition_id: 'influenza_like_illness', weight: 4 },
    { from_type: 'Symptom', from_id: 'cough', condition_id: 'influenza_like_illness', weight: 2 },
    { from_type: 'Symptom', from_id: 'fever', condition_id: 'covid_like_illness', weight: 3 },
    { from_type: 'Symptom', from_id: 'cough', condition_id: 'covid_like_illness', weight: 3 },
    { from_type: 'Symptom', from_id: 'shortness_of_breath', condition_id: 'covid_like_illness', weight: 2 },
    { from_type: 'Symptom', from_id: 'nasal_congestion', condition_id: 'acute_sinusitis', weight: 3 },
    { from_type: 'Symptom', from_id: 'headache', condition_id: 'acute_sinusitis', weight: 2 },
    { from_type: 'Symptom', from_id: 'sore_throat', condition_id: 'acute_pharyngitis', weight: 4 },
    { from_type: 'Symptom', from_id: 'fever', condition_id: 'acute_pharyngitis', weight: 2 },
    { from_type: 'Symptom', from_id: 'cough', condition_id: 'acute_bronchitis', weight: 4 },
    { from_type: 'Symptom', from_id: 'wheezing', condition_id: 'asthma_exacerbation', weight: 4 },
    { from_type: 'Symptom', from_id: 'shortness_of_breath', condition_id: 'asthma_exacerbation', weight: 3 },
    { from_type: 'Symptom', from_id: 'wheezing', condition_id: 'copd_exacerbation', weight: 3 },
    { from_type: 'Symptom', from_id: 'shortness_of_breath', condition_id: 'copd_exacerbation', weight: 3 },
    { from_type: 'Symptom', from_id: 'diarrhea', condition_id: 'acute_gastroenteritis', weight: 4 },
    { from_type: 'Symptom', from_id: 'vomiting', condition_id: 'acute_gastroenteritis', weight: 4 },
    { from_type: 'Symptom', from_id: 'nausea', condition_id: 'acute_gastroenteritis', weight: 3 },
    { from_type: 'Symptom', from_id: 'heartburn', condition_id: 'gerd', weight: 5 },
    { from_type: 'Symptom', from_id: 'abdominal_pain', condition_id: 'gastritis_peptic_ulcer_possible', weight: 3 },
    { from_type: 'Symptom', from_id: 'blood_in_vomit', condition_id: 'gastritis_peptic_ulcer_possible', weight: 4 },
    { from_type: 'Symptom', from_id: 'blood_in_stool', condition_id: 'gastritis_peptic_ulcer_possible', weight: 4 },
    { from_type: 'Symptom', from_id: 'constipation', condition_id: 'constipation', weight: 5 },
    { from_type: 'Symptom', from_id: 'abdominal_pain', condition_id: 'ibs_possible', weight: 2 },
    { from_type: 'Symptom', from_id: 'painful_urination', condition_id: 'uti_uncomplicated', weight: 5 },
    { from_type: 'Symptom', from_id: 'urinary_frequency', condition_id: 'uti_uncomplicated', weight: 3 },
    { from_type: 'Symptom', from_id: 'flank_pain', condition_id: 'kidney_stone_possible', weight: 5 },
    { from_type: 'Symptom', from_id: 'rash', condition_id: 'contact_dermatitis', weight: 4 },
    { from_type: 'Symptom', from_id: 'hives', condition_id: 'urticaria_hives', weight: 5 },
    { from_type: 'Symptom', from_id: 'skin_redness_warmth', condition_id: 'cellulitis_possible', weight: 5 },
    { from_type: 'Symptom', from_id: 'rash_spreading', condition_id: 'cellulitis_possible', weight: 4 },
    { from_type: 'Symptom', from_id: 'polyuria', condition_id: 'hyperglycemia_risk_prediabetes_diabetes', weight: 4 },
    { from_type: 'Symptom', from_id: 'polydipsia', condition_id: 'hyperglycemia_risk_prediabetes_diabetes', weight: 4 },
    { from_type: 'Symptom', from_id: 'blurred_vision', condition_id: 'hyperglycemia_risk_prediabetes_diabetes', weight: 2 },
    { from_type: 'Symptom', from_id: 'poor_wound_healing', condition_id: 'hyperglycemia_risk_prediabetes_diabetes', weight: 3 },
    { from_type: 'VitalRule', from_id: 'bp_stage2_sys', condition_id: 'hypertension_risk', weight: 4 },
    { from_type: 'VitalRule', from_id: 'bp_urgency_sys', condition_id: 'hypertensive_urgency_risk', weight: 5 },
    { from_type: 'VitalRule', from_id: 'bp_urgency_dia', condition_id: 'hypertensive_urgency_risk', weight: 5 },
    { from_type: 'VitalRule', from_id: 'spo2_low', condition_id: 'respiratory_compromise_risk', weight: 5 },
    { from_type: 'VitalRule', from_id: 'spo2_critical', condition_id: 'respiratory_compromise_risk', weight: 5 },
    { from_type: 'VitalRule', from_id: 'temp_high', condition_id: 'infection_risk_systemic', weight: 4 },
    { from_type: 'VitalRule', from_id: 'hr_tachy', condition_id: 'infection_risk_systemic', weight: 2 },
    { from_type: 'Symptom', from_id: 'fever', condition_id: 'infection_risk_systemic', weight: 3 },
    { from_type: 'Symptom', from_id: 'confusion', condition_id: 'neurologic_warning_risk', weight: 4 },
    { from_type: 'Symptom', from_id: 'new_weakness', condition_id: 'neurologic_warning_risk', weight: 5 },
    { from_type: 'Symptom', from_id: 'double_vision', condition_id: 'neurologic_warning_risk', weight: 4 },
    { from_type: 'Symptom', from_id: 'chest_pain', condition_id: 'cardiac_warning_risk', weight: 5 },
    { from_type: 'Symptom', from_id: 'palpitations', condition_id: 'cardiac_warning_risk', weight: 2 },
    { from_type: 'Symptom', from_id: 'shortness_of_breath', condition_id: 'respiratory_compromise_risk', weight: 4 },
    { from_type: 'Symptom', from_id: 'fatigue', condition_id: 'sleep_disorder_possible', weight: 2 },
    { from_type: 'Symptom', from_id: 'daytime_sleepiness', condition_id: 'sleep_disorder_possible', weight: 4 },
    { from_type: 'Symptom', from_id: 'snoring', condition_id: 'sleep_disorder_possible', weight: 3 },
    { from_type: 'Symptom', from_id: 'sleep_loss', condition_id: 'sleep_disorder_possible', weight: 3 },
  ];
  
  // Helper functions
  export const getConditionById = (id: string): Condition | undefined => 
    CONDITIONS.find(c => c.condition_id === id);
  
  export const getSymptomById = (id: string): Symptom | undefined =>
    SYMPTOMS.find(s => s.symptom_id === id);
  
  export const getSymptomsByCategory = (category: string): Symptom[] =>
    SYMPTOMS.filter(s => s.category === category);
  
  export const getGuidesForCondition = (conditionId: string): PatientGuide[] => {
    // Simple mapping - can be enhanced with edges_condition_guide
    const guideMap: Record<string, string[]> = {
      'posture_related_headache': ['guide_posture_ergonomics', 'guide_neck_stretches', 'guide_return_precautions'],
      'tension_headache': ['guide_stress_management', 'guide_return_precautions'],
      'migraine_possible': ['guide_migraine_selfcare', 'guide_return_precautions'],
      'eye_strain_headache': ['guide_computer_phone_posture', 'guide_return_precautions'],
      'sleep_deprivation_headache': ['guide_sleep_hygiene', 'guide_return_precautions'],
      'hypertension_risk': ['guide_bp_monitoring', 'guide_return_precautions'],
      'hyperglycemia_risk_prediabetes_diabetes': ['guide_glucose_followup', 'guide_return_precautions'],
    };
    
    const guideIds = guideMap[conditionId] || ['guide_return_precautions'];
    return guideIds.map(id => PATIENT_GUIDES.find(g => g.guide_id === id)).filter(Boolean) as PatientGuide[];
  };
  
  export const getTemplateForCondition = (conditionId: string): MessageTemplate => {
    if (conditionId.includes('posture') || conditionId.includes('headache')) {
      return MESSAGE_TEMPLATES.find(t => t.template_id === 'tmpl_posture_headache') || MESSAGE_TEMPLATES[0];
    }
    if (conditionId.includes('urgency') || conditionId.includes('warning') || conditionId.includes('risk')) {
      return MESSAGE_TEMPLATES.find(t => t.template_id === 'tmpl_urgent') || MESSAGE_TEMPLATES[0];
    }
    return MESSAGE_TEMPLATES[0];
  };
  