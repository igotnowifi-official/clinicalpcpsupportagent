/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React from "react";
import { IssueCard as IssueCardType } from "../types/intake";

interface IssueCardProps {
  issue: IssueCardType;
  onChange: (issue: IssueCardType) => void;
  onRemove: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onChange, onRemove }) => {
  const handleInputChange = (field: keyof IssueCardType, value: any) => {
    onChange({
      ...issue,
      [field]: value,
    });
  };

  return (
    <div className="issue-card">
      <div className="issue-card-header">
        <span>
          <b>Region:</b> {issue.region_id.charAt(0).toUpperCase() + issue.region_id.slice(1)}
        </span>
        <button
          type="button"
          className="remove-issue-btn"
          onClick={onRemove}
          aria-label="Remove issue"
        >
          ×
        </button>
      </div>

      <label>
        Description/Concern
        <input
          type="text"
          value={issue.description}
          maxLength={80}
          required
          onChange={e => handleInputChange("description", e.target.value)}
        />
      </label>

      <label>
        Pain Score (0–10)
        <input
          type="number"
          min={0}
          max={10}
          required
          value={issue.pain_score ?? ""}
          onChange={e => handleInputChange("pain_score", Number(e.target.value))}
        />
      </label>

      <label>
        Functional Impact
        <select
          value={issue.functional_impact}
          onChange={e => handleInputChange("functional_impact", e.target.value)}
          required
        >
          <option value="">Select...</option>
          <option value="none">None</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </select>
      </label>

      <label>
        Onset
        <select
          value={issue.onset}
          onChange={e => handleInputChange("onset", e.target.value)}
          required
        >
          <option value="">Select...</option>
          <option value="today">Today</option>
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
        </select>
      </label>

      <label>
        Course
        <select
          value={issue.course}
          onChange={e => handleInputChange("course", e.target.value)}
          required
        >
          <option value="">Select...</option>
          <option value="improving">Improving</option>
          <option value="worsening">Worsening</option>
          <option value="unchanged">Unchanged</option>
        </select>
      </label>

      <label>
        Triggers (optional)
        <input
          type="text"
          value={issue.triggers || ""}
          maxLength={80}
          onChange={e => handleInputChange("triggers", e.target.value)}
        />
      </label>

      <label>
        Relief Factors (optional)
        <input
          type="text"
          value={issue.relief_factors || ""}
          maxLength={80}
          onChange={e => handleInputChange("relief_factors", e.target.value)}
        />
      </label>
    </div>
  );
};

export default IssueCard;