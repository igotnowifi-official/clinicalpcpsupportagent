/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

// Core React and Router
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Patient-facing pages
import CheckInScreen from "./components/CheckInScreen";
import PatientCheckInFlow from "./pages/PatientCheckInFlow";
import QuestionnaireSession from "./pages/QuestionnaireSession";
import IntakeCompleteScreen from "./components/IntakeCompleteScreen";

// Staff/MA-facing pages
import StaffDashboard from "./pages/StaffDashboard";
import StaffIssueQuestionnaire from "./pages/StaffIssueQuestionnaire";

// Clinician pages
import ClinicianPortal from "./pages/ClinicianPortal";
import ClinicianDashboard from "./components/ClinicianDashboard";
import ClinicianReviewPage from "./pages/ClinicianReviewPage";

// Utility screens
import NotFoundPage from "./pages/NotFoundPage";

// Brand/UI footer per workflow
const PATIENT_FOOTER = (
  <footer className="power-by-footer">Powered by igotnowifi, LLC</footer>
);
const CLINICIAN_FOOTER = (
  <footer className="clinician-footer">
    © 2025 igotnowifi, LLC · Proprietary Clinical Software
  </footer>
);

function App() {
  return (
    <Router>
      <div className="main-app">
        <Routes>
          {/* PATIENT: Check-in and Intake Flow */}
          <Route
            path="/"
            element={<Navigate to="/checkin" />}
          />
          <Route
            path="/checkin"
            element={
              <>
                <CheckInScreen />
                {PATIENT_FOOTER}
              </>
            }
          />
          <Route
            path="/patientcheckin"
            element={
              <>
                <PatientCheckInFlow />
                {PATIENT_FOOTER}
              </>
            }
          />
          <Route
            path="/q/:session_token"
            element={
              <>
                <QuestionnaireSession />
                {PATIENT_FOOTER}
              </>
            }
          />
          <Route
            path="/intake/complete"
            element={
              <>
                <IntakeCompleteScreen />
                {PATIENT_FOOTER}
              </>
            }
          />

          {/* STAFF: Dashboard and Issue Questionnaire */}
          <Route
            path="/staff/dashboard"
            element={
              <>
                <StaffDashboard />
                {CLINICIAN_FOOTER}
              </>
            }
          />
          <Route
            path="/staff/issue"
            element={
              <>
                <StaffIssueQuestionnaire />
                {CLINICIAN_FOOTER}
              </>
            }
          />

          {/* CLINICIAN: Portal and workflow */}
          <Route
            path="/clinician/*"
            element={<ClinicianPortal />}
          />
          <Route
            path="/clinician/dashboard"
            element={
              <>
                <ClinicianDashboard />
                {CLINICIAN_FOOTER}
              </>
            }
          />
          <Route
            path="/clinician/review/:session_token"
            element={
              <>
                <ClinicianReviewPage />
                {CLINICIAN_FOOTER}
              </>
            }
          />
          {/* Add additional routes for assistant actions, wrapup, messaging, etc., if these are direct top-level screens */}
          {/* Example: */}
          {/* <Route path="/clinician/wrapup/:session_token" element={<ClinicalWrapUpPage />} /> */}

          {/* NOT FOUND */}
          <Route
            path="*"
            element={
              <>
                <NotFoundPage />
                {PATIENT_FOOTER}
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;