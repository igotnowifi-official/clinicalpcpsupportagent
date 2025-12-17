/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

import React, { useRef } from "react";
import bodyFront from "../assets/body_front.svg";
import bodyBack from "../assets/body_back.svg";

type BodyMapView = "front" | "back";
export type BodyRegionId =
  | "head"
  | "neck"
  | "chest"
  | "abdomen"
  | "pelvis"
  | "left_shoulder"
  | "right_shoulder"
  | "left_arm"
  | "right_arm"
  | "left_hand"
  | "right_hand"
  | "left_leg"
  | "right_leg"
  | "left_foot"
  | "right_foot"
  | "upper_back"
  | "lower_back";

interface BodyMapProps {
  view: BodyMapView;
  onSelectRegion: (regionId: BodyRegionId) => void;
  selectedRegions?: BodyRegionId[];
}

const regionNames: Record<BodyRegionId, string> = {
  head: "Head",
  neck: "Neck",
  chest: "Chest",
  abdomen: "Abdomen",
  pelvis: "Pelvis",
  left_shoulder: "Left Shoulder",
  right_shoulder: "Right Shoulder",
  left_arm: "Left Arm",
  right_arm: "Right Arm",
  left_hand: "Left Hand",
  right_hand: "Right Hand",
  left_leg: "Left Leg",
  right_leg: "Right Leg",
  left_foot: "Left Foot",
  right_foot: "Right Foot",
  upper_back: "Upper Back",
  lower_back: "Lower Back",
};

const regionIdsFront: BodyRegionId[] = [
  "head", "neck", "chest", "abdomen", "pelvis",
  "left_shoulder", "right_shoulder",
  "left_arm", "right_arm",
  "left_hand", "right_hand",
  "left_leg", "right_leg",
  "left_foot", "right_foot"
];

const regionIdsBack: BodyRegionId[] = [
  "head", "neck", "upper_back", "lower_back", "pelvis",
  "left_shoulder", "right_shoulder",
  "left_arm", "right_arm",
  "left_hand", "right_hand",
  "left_leg", "right_leg",
  "left_foot", "right_foot"
];

const BodyMap: React.FC<BodyMapProps> = ({ view, onSelectRegion, selectedRegions }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleRegionClick = (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    const target = event.target as SVGElement;
    const regionId = target.id as BodyRegionId;
    if (
      (view === "front" && regionIdsFront.includes(regionId)) ||
      (view === "back" && regionIdsBack.includes(regionId))
    ) {
      onSelectRegion(regionId);
    }
  };

  // Dynamically embed the SVG and assign clickable handlers to ids
  const getBodyMapSVG = () => {
    // Using dangerouslySetInnerHTML in MVP for dynamic region binding
    const svgAsset = view === "front" ? bodyFront : bodyBack;
    return (
      <div className="bodymap-svg-container">
        <object
          type="image/svg+xml"
          data={svgAsset}
          className="bodymap-svg-object"
          aria-label={`${view === "front" ? "Body Front" : "Body Back"} Map`}
          onLoad={(e) => {
            const svgDoc = (e.target as any).contentDocument;
            const regionList = view === "front" ? regionIdsFront : regionIdsBack;
            regionList.forEach((regionId) => {
              const regionEl = svgDoc && svgDoc.getElementById(regionId);
              if (regionEl) {
                regionEl.style.cursor = "pointer";
                regionEl.onclick = () => onSelectRegion(regionId);
                if (
                  selectedRegions &&
                  selectedRegions.includes(regionId)
                ) {
                  regionEl.style.stroke = "#3b84de";
                  regionEl.style.strokeWidth = "4px";
                } else {
                  regionEl.style.stroke = "#46546b";
                  regionEl.style.strokeWidth = "2px";
                }
              }
            });
          }}
          width={256}
          height={512}
        />
      </div>
    );
  };

  // For accessibility/fallback: a list of regions
  const renderFallbackRegionList = () => (
    <div className="bodymap-fallback-list">
      <h4>{view === "front" ? "Front Body Regions" : "Back Body Regions"}</h4>
      <ul>
        {(view === "front" ? regionIdsFront : regionIdsBack).map((region) => (
          <li key={region}>
            <button
              type="button"
              className={`bodymap-region-btn${selectedRegions && selectedRegions.includes(region) ? " selected" : ""}`}
              onClick={() => onSelectRegion(region)}
            >
              {regionNames[region]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bodymap-component">
      {getBodyMapSVG()}
      <div className="bodymap-toggle-row">
        <span>
          <b>Switch View: </b>
        </span>
        <button
          type="button"
          disabled={view === "front"}
          onClick={() => onSelectRegion("head")} // prompt parent to set view
        >
          Front
        </button>
        <button
          type="button"
          disabled={view === "back"}
          onClick={() => onSelectRegion("upper_back")} // prompt parent to set view
        >
          Back
        </button>
      </div>
      <div className="bodymap-fallback">{renderFallbackRegionList()}</div>
    </div>
  );
};

export default BodyMap;