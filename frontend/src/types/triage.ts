/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

export interface ConditionProbability {
    condition_id: string;
    condition_name: string;
    probability: number;
    confidence_label: 'high' | 'medium' | 'low';
    triggered_red_flag?: boolean;
    suppressed_due_to_red_flag?: boolean;
    notes?: string;
  }
  
  export interface AssistantAction {
    action_id: string;
    description: string;
    completed: boolean;
    triggered_by: string;
    ui_component?: string;
  }
  
  export interface FollowUpQuestion {
    question_id: string;
    description: string;
    field_type: string;
    answer?: any;
    required: boolean;
  }
  
  export interface TriageSummary {
    acuity: 'urgent' | 'routine' | 'deferred' | 'followup';
    summary: string;
    red_flags: string[];
    major_anomalies: string[];
  }
  
  export interface SuggestionItem {
    suggestion_type: 'labs' | 'referrals' | 'meds' | 'actions' | 'guides' | string;
    suggestion_id: string;
    description: string;
    relevant_condition_id?: string;
  }
  
  export interface TriageResult {
    intake_session_token: string;
    triage_id: string;
    timestamp: string;
    top_5_conditions: ConditionProbability[];
  
    assistant_actions: AssistantAction[];
    followup_questions: FollowUpQuestion[];
    triage_summary: TriageSummary;
    suggestions: SuggestionItem[];
    wrapup?: { [key: string]: any };
    patient_communication_draft?: string;
    audit_event_id?: string;
  }