/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";

const SubmissionThankYou: React.FC = () => {
  return (
    <div className="submission-thankyou-container">
      <h2>Thank you.</h2>
      <p>
        Your health questionnaire has been submitted.<br />
        Please return this device to the clinic staff.
      </p>
      <footer className="patient-footer">
        Powered by igotnowifi, LLC
      </footer>
    </div>
  );
};

export default SubmissionThankYou;