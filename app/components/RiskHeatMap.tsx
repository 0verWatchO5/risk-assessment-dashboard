"use client";

import { RiskEntry } from "../types/grc";
import InfoTooltip from "./InfoTooltip";

type RiskHeatMapProps = {
  risks: RiskEntry[];
  riskAppetite: number;
};

// Pre-computed cell colors for the 5x5 matrix (impact = col 1-5, likelihood = row 5-1)
function getCellColor(likelihood: number, impact: number, appetite: number): string {
  const score = likelihood * impact;
  if (score > appetite)      return "bg-red-500/30 border-red-500/50";
  if (score >= 12)           return "bg-orange-500/30 border-orange-500/50";
  if (score >= 6)            return "bg-yellow-500/30 border-yellow-500/50";
  return "bg-green-500/30 border-green-500/50";
}

function getCellTextColor(likelihood: number, impact: number, appetite: number): string {
  const score = likelihood * impact;
  if (score > appetite) return "text-red-300";
  if (score >= 12)      return "text-orange-300";
  if (score >= 6)       return "text-yellow-300";
  return "text-green-300";
}

export default function RiskHeatMap({ risks, riskAppetite }: RiskHeatMapProps) {
  // Build a lookup: [likelihood][impact] -> array of risk IDs
  const cellRisks: Record<string, RiskEntry[]> = {};
  for (const risk of risks) {
    const key = `${risk.likelihood}-${risk.impact}`;
    if (!cellRisks[key]) cellRisks[key] = [];
    cellRisks[key].push(risk);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">5×5 Risk Heat Map</h3>
        <InfoTooltip
          term="Risk Heat Map (ISO 27005)"
          definition="A visual matrix plotting Likelihood (Y-axis) against Impact (X-axis). Each cell colour represents the risk level. Cells with dots contain logged risks. Red cells exceed the Risk Appetite threshold."
        />
      </div>

      {/* Y-axis label */}
      <div className="flex gap-3">
        <div className="flex items-center justify-center w-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest -rotate-90 whitespace-nowrap">
            Likelihood →
          </p>
        </div>

        <div className="flex-1 space-y-1">
          {/* Grid rows: likelihood 5 down to 1 */}
          {[5, 4, 3, 2, 1].map((lh) => (
            <div key={lh} className="flex gap-1 items-center">
              <span className="text-[10px] text-slate-500 w-4 text-right flex-shrink-0">{lh}</span>
              {[1, 2, 3, 4, 5].map((imp) => {
                const key = `${lh}-${imp}`;
                const count = cellRisks[key]?.length ?? 0;
                const score = lh * imp;
                return (
                  <div
                    key={imp}
                    className={`
                      flex-1 aspect-square min-h-[44px] rounded border
                      flex flex-col items-center justify-center
                      transition-all duration-150 relative group
                      ${getCellColor(lh, imp, riskAppetite)}
                    `}
                    title={`L${lh} × I${imp} = ${score}${count > 0 ? ` · ${count} risk(s)` : ""}`}
                  >
                    <span className={`text-[10px] font-semibold ${getCellTextColor(lh, imp, riskAppetite)}`}>
                      {score}
                    </span>
                    {count > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/20 text-white text-[9px] font-bold flex items-center justify-center">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* X-axis labels */}
          <div className="flex gap-1 items-center mt-1">
            <span className="w-4" />
            {[1, 2, 3, 4, 5].map((v) => (
              <span key={v} className="flex-1 text-center text-[10px] text-slate-500">{v}</span>
            ))}
          </div>
          <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
            ← Impact
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {[
          { label: "Low", color: "bg-green-500/30 border-green-500/50" },
          { label: "Medium", color: "bg-yellow-500/30 border-yellow-500/50" },
          { label: "High", color: "bg-orange-500/30 border-orange-500/50" },
          { label: "Critical (>Appetite)", color: "bg-red-500/30 border-red-500/50" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded border ${item.color}`} />
            <span className="text-[10px] text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
