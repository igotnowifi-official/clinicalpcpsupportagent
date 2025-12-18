/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h2>Page Not Found</h2>
      <p>
        The page you are looking for could not be found.<br />
        Please check the URL or return to the clinic check-in or dashboard.
      </p>
      <div className="notfound-actions">
        <button type="button" onClick={() => navigate("/checkin")}>
          Go to Patient Check-In
        </button>
        <button type="button" onClick={() => navigate("/staff/dashboard")}>
          Go to Staff Dashboard
        </button>
        <button type="button" onClick={() => navigate("/clinician/dashboard")}>
          Go to Clinician Dashboard
        </button>
      </div>
      <footer className="power-by-footer">
        Powered by igotnowifi, LLC
      </footer>
    </div>
  );
};

export default NotFoundPage;