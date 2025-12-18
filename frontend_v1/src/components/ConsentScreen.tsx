/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";

interface ConsentScreenProps {
  consentAcknowledged: boolean;
  onAcknowledge: () => void;
  onDecline: () => void;
}

const ConsentScreen: React.FC<ConsentScreenProps> = ({
  consentAcknowledged,
  onAcknowledge,
  onDecline,
}) => {
  return (
    <div className="consent-screen">
      <h2>Consent and Acknowledgment</h2>
      <div className="consent-content">
        <p>
          By proceeding, you acknowledge that you have read and understood the 
          privacy policy and consent to the collection and use of your health information 
          for the purposes of providing medical care.
        </p>
        <p>
          Please review the terms and conditions before proceeding.
        </p>
      </div>
      <div className="consent-actions">
        <button
          type="button"
          onClick={onAcknowledge}
          className="consent-acknowledge-btn"
          disabled={consentAcknowledged}
        >
          I Acknowledge and Consent
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="consent-decline-btn"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default ConsentScreen;
