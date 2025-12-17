/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";
import PatientCheckInFlow from "../pages/PatientCheckInFlow";

const CheckInScreen: React.FC = () => {
  return (
    <div className="checkin-screen">
      <h1>Welcome to Clinic Check-In</h1>
      <PatientCheckInFlow />
    </div>
  );
};

export default CheckInScreen;