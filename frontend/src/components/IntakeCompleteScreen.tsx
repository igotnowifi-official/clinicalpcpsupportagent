/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";

interface IntakeCompleteScreenProps {
  onReturnDevice?: () => void;
  showFooter?: boolean;
}

const IntakeCompleteScreen: React.FC<IntakeCompleteScreenProps> = ({
  onReturnDevice,
  showFooter = true,
}) => {
  return (
    <div className="intake-complete-container">
      <h2>Thank you.</h2>
      <p>
        Your check-in and health questionnaire have been submitted.<br />
        Please return this device to the staff.
      </p>
      {onReturnDevice && (
        <button type="button" className="return-device-btn" onClick={onReturnDevice}>
          Device returned to staff
        </button>
      )}
      {showFooter && (
        <footer className="patient-footer">
          Powered by igotnowifi, LLC
        </footer>
      )}
    </div>
  );
};

export default IntakeCompleteScreen;