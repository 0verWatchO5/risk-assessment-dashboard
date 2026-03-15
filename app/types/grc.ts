// ISO 27005-aligned GRC Data Models

export type AssetType = "Hardware" | "Software" | "Data" | "People";
export type Criticality = 1 | 2 | 3;

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  criticality: Criticality; // 1=Low, 2=Medium, 3=High
  createdAt: string;
}

export type TreatmentStrategy = "Mitigate" | "Accept" | "Transfer" | "Avoid";
export type RiskStatus = "Open" | "In Treatment" | "Closed";

export interface RiskEntry {
  id: string;
  assetId: string;
  threat: string;           // e.g. "Ransomware Attack"
  vulnerability: string;    // e.g. "Unpatched OS"
  likelihood: 1 | 2 | 3 | 4 | 5;  // ISO 27005: Probability
  impact: 1 | 2 | 3 | 4 | 5;      // ISO 27005: Consequence
  inherentRisk: number;     // likelihood × impact (1–25)
  treatmentStrategy: TreatmentStrategy;
  control?: string;         // e.g. "MFA", "Firewall" — only for Mitigate
  residualLikelihood?: 1 | 2 | 3 | 4 | 5;
  residualImpact?: 1 | 2 | 3 | 4 | 5;
  residualRisk?: number;    // residualLikelihood × residualImpact
  status: RiskStatus;
  createdAt: string;
}

export interface AppSettings {
  orgName: string;
  riskAppetite: number;     // Default 15 — scores above this are "Exceeding Appetite"
  framework: string;        // e.g. "ISO 27005"
}

export const DEFAULT_SETTINGS: AppSettings = {
  orgName: "My Organization",
  riskAppetite: 15,
  framework: "ISO 27005",
};

// Helpers
export function getRiskLevel(score: number, appetite: number): "Critical" | "High" | "Medium" | "Low" {
  if (score > appetite) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

export function getRiskColor(level: "Critical" | "High" | "Medium" | "Low"): string {
  switch (level) {
    case "Critical": return "#ef4444"; // red-500
    case "High":     return "#f97316"; // orange-500
    case "Medium":   return "#eab308"; // yellow-500
    case "Low":      return "#22c55e"; // green-500
  }
}

export function getRiskBgClass(score: number, appetite: number): string {
  const level = getRiskLevel(score, appetite);
  switch (level) {
    case "Critical": return "bg-red-50 text-red-700 border border-red-200";
    case "High":     return "bg-orange-50 text-orange-700 border border-orange-200";
    case "Medium":   return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Low":      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
}
