/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

export interface PatientCheckInRequest {
    first_name: string;
    last_name: string;
    dob: string; // ISO date string
    patient_id?: string; // optional existing
  }
  
  export interface PatientCheckInResponse {
    case_id: string;
    patient_id: string;
    checked_in_at: string; // ISO datetime string
    status: string;
    audit_event_id: string;
  }