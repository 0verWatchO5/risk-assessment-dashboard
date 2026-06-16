"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Asset, RiskEntry, getRiskLevel } from "../types/grc";
import RiskHeatMap from "./RiskHeatMap";
import InfoTooltip from "./InfoTooltip";
import { useTheme } from "./ThemeProvider";

ChartJS.register(ArcElement, Tooltip, Legend);

type OverviewProps = {
  assets: Asset[];
  risks: RiskEntry[];
  riskAppetite: number;
  orgName: string;
};

type CostEstimate = {
  riskId: string;
  threat: string;
  treatmentStrategy: RiskEntry["treatmentStrategy"];
  oneTimeFixCost: number;
  annualMaintenanceCost: number;
  annualExposureWithoutTreatment: number;
  annualExposureAfterTreatment: number;
  annualRiskReductionValue: number;
};

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatMoney(value: number) {
  return CURRENCY.format(Math.max(0, value));
}

function getAssetValueByCriticality(criticality: Asset["criticality"]) {
  switch (criticality) {
    case 3:
      return 300000;
    case 2:
      return 120000;
    default:
      return 40000;
  }
}

function estimateRiskCost(risk: RiskEntry, assets: Asset[]): CostEstimate {
  const asset = assets.find((a) => a.id === risk.assetId);
  const assetValue = getAssetValueByCriticality(asset?.criticality ?? 1);
  const inherentFactor = risk.inherentRisk / 25;
  const annualExposureWithoutTreatment = assetValue * inherentFactor * 0.4;

  let oneTimeFixCost = 0;
  let annualMaintenanceCost = 0;
  let postTreatmentScore = risk.residualRisk ?? risk.inherentRisk;

  switch (risk.treatmentStrategy) {
    case "Mitigate":
      oneTimeFixCost = 12000 + risk.inherentRisk * 1500;
      annualMaintenanceCost = 3500 + risk.inherentRisk * 450;
      postTreatmentScore = risk.residualRisk ?? Math.max(3, risk.inherentRisk - 7);
      break;
    case "Transfer":
      oneTimeFixCost = 8000 + risk.inherentRisk * 700;
      annualMaintenanceCost = 5000 + risk.inherentRisk * 280;
      postTreatmentScore = Math.max(4, Math.round(risk.inherentRisk * 0.5));
      break;
    case "Avoid":
      oneTimeFixCost = 18000 + risk.inherentRisk * 1200;
      annualMaintenanceCost = 2000 + risk.inherentRisk * 120;
      postTreatmentScore = Math.max(1, Math.round(risk.inherentRisk * 0.2));
      break;
    case "Accept":
      oneTimeFixCost = 2000 + risk.inherentRisk * 200;
      annualMaintenanceCost = 3000 + risk.inherentRisk * 300;
      postTreatmentScore = Math.max(8, Math.round(risk.inherentRisk * 0.9));
      break;
  }

  const annualExposureAfterTreatment = assetValue * (postTreatmentScore / 25) * 0.4;
  const annualRiskReductionValue = Math.max(
    0,
    annualExposureWithoutTreatment - annualExposureAfterTreatment
  );

  return {
    riskId: risk.id,
    threat: risk.threat,
    treatmentStrategy: risk.treatmentStrategy,
    oneTimeFixCost,
    annualMaintenanceCost,
    annualExposureWithoutTreatment,
    annualExposureAfterTreatment,
    annualRiskReductionValue,
  };
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={`bg-white border rounded-2xl px-5 py-4 shadow-sm ${accent ?? "border-slate-200"}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? "text-red-700" : "text-slate-900"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Overview({ assets, risks, riskAppetite, orgName }: OverviewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ── KPI calculations ───────────────────────────────────────────────────
  const totalRisks = risks.length;
  const exceedingAppetite = risks.filter((r) => r.inherentRisk > riskAppetite).length;
  const mitigated = risks.filter((r) => r.treatmentStrategy === "Mitigate").length;
  const accepted  = risks.filter((r) => r.treatmentStrategy === "Accept").length;
  const transferred = risks.filter((r) => r.treatmentStrategy === "Transfer").length;
  const avoided   = risks.filter((r) => r.treatmentStrategy === "Avoid").length;
  const pending   = risks.filter((r) => r.status === "Open").length;

  // Level distribution
  const critical = risks.filter((r) => getRiskLevel(r.inherentRisk, riskAppetite) === "Critical").length;
  const high     = risks.filter((r) => getRiskLevel(r.inherentRisk, riskAppetite) === "High").length;
  const medium   = risks.filter((r) => getRiskLevel(r.inherentRisk, riskAppetite) === "Medium").length;
  const low      = risks.filter((r) => getRiskLevel(r.inherentRisk, riskAppetite) === "Low").length;

  // Average inherent risk score
  const avgRisk = totalRisks > 0 ? (risks.reduce((s, r) => s + r.inherentRisk, 0) / totalRisks).toFixed(1) : "N/A";
  const appetiteMarker = Math.min(100, Math.max(0, (riskAppetite / 25) * 100));

  const estimatedCosts = risks.map((risk) => estimateRiskCost(risk, assets));
  const oneTimeFixBudget = estimatedCosts.reduce((sum, cost) => sum + cost.oneTimeFixCost, 0);
  const annualMaintenanceBudget = estimatedCosts.reduce(
    (sum, cost) => sum + cost.annualMaintenanceCost,
    0
  );
  const annualExposureNoAction = estimatedCosts.reduce(
    (sum, cost) => sum + cost.annualExposureWithoutTreatment,
    0
  );
  const annualExposureAfterTreatment = estimatedCosts.reduce(
    (sum, cost) => sum + cost.annualExposureAfterTreatment,
    0
  );
  const annualRiskReductionValue = estimatedCosts.reduce(
    (sum, cost) => sum + cost.annualRiskReductionValue,
    0
  );
  const threeYearProgramCost = oneTimeFixBudget + annualMaintenanceBudget * 3;
  const threeYearDoNothingCost = annualExposureNoAction * 3;
  const threeYearNetSavings = threeYearDoNothingCost - threeYearProgramCost;
  const yearlyNetBenefit = annualRiskReductionValue - annualMaintenanceBudget;
  const paybackMonths =
    oneTimeFixBudget > 0 && yearlyNetBenefit > 0
      ? Math.ceil((oneTimeFixBudget / yearlyNetBenefit) * 12)
      : null;

  // ── Donut chart: Treatment Strategy breakdown ──────────────────────────
  const treatmentData = {
    labels: ["Mitigate", "Accept", "Transfer", "Avoid"],
    datasets: [
      {
        data: [mitigated, accepted, transferred, avoided],
        backgroundColor: ["#6366f1", "#64748b", "#a855f7", "#f97316"],
        borderColor: ["#4f46e5", "#475569", "#9333ea", "#ea580c"],
        borderWidth: 1,
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: isDark ? "#cbd5e1" : "#64748b",
          font: { size: 11 },
          padding: 14,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        borderColor: isDark ? "#334155" : "#cbd5e1",
        borderWidth: 1,
        titleColor: isDark ? "#f8fafc" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#475569",
        callbacks: {
          label: (ctx: { label?: string; parsed: number }) => {
            const pct = totalRisks > 0 ? Math.round((ctx.parsed / totalRisks) * 100) : 0;
            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
    cutout: "72%",
  };

  // ── Risk level donut ───────────────────────────────────────────────────
  const levelData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        data: [critical, high, medium, low],
        backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e"],
        borderColor: ["#dc2626", "#ea580c", "#ca8a04", "#16a34a"],
        borderWidth: 1,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Executive Overview</h2>
          <p className="text-sm text-slate-600 mt-0.5">{orgName} · ISO 27005 Risk Dashboard</p>
        </div>
        {exceedingAppetite > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold text-red-700">
              {exceedingAppetite} risk{exceedingAppetite > 1 ? "s" : ""} exceeding appetite
            </span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Assets" value={assets.length} sub="Registered information assets" />
        <StatCard label="Total Risks" value={totalRisks} sub={`Avg. score: ${avgRisk}`} />
        <StatCard label="Open Risks" value={pending} sub="Awaiting treatment" />
        <StatCard
          label="Exceeding Appetite"
          value={exceedingAppetite}
          sub={`Threshold: >${riskAppetite}`}
          accent={exceedingAppetite > 0 ? "border-red-200 bg-red-50" : undefined}
        />
      </div>

      {/* Cost summary for executive reporting */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Financial Impact Snapshot
              <InfoTooltip
                term="Cost Model"
                definition="Estimated planning values based on risk score, treatment strategy, and asset criticality. Use for executive budgeting and prioritization, not accounting close."
              />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Demonstrates fix budget, recurring maintenance, and cost of inaction over a 3-year horizon.
            </p>
          </div>
          {paybackMonths !== null && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Estimated payback: {paybackMonths} months
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">One-Time Fix Budget</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatMoney(oneTimeFixBudget)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Annual Maintenance</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatMoney(annualMaintenanceBudget)}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-red-700 font-semibold">3-Year Cost If Ignored</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{formatMoney(threeYearDoNothingCost)}</p>
          </div>
          <div
            className={`rounded-xl border px-4 py-3 ${
              threeYearNetSavings >= 0
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p
              className={`text-[11px] uppercase tracking-wider font-semibold ${
                threeYearNetSavings >= 0 ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              3-Year Net {threeYearNetSavings >= 0 ? "Savings" : "Funding Gap"}
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${
                threeYearNetSavings >= 0 ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {formatMoney(Math.abs(threeYearNetSavings))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <span className="text-slate-500">Annual exposure without treatment:</span>
            <span className="font-semibold text-slate-900 ml-1">{formatMoney(annualExposureNoAction)}</span>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <span className="text-slate-500">Annual exposure after treatment:</span>
            <span className="font-semibold text-slate-900 ml-1">{formatMoney(annualExposureAfterTreatment)}</span>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
            <span className="text-slate-500">Annual risk-reduction value:</span>
            <span className="font-semibold text-slate-900 ml-1">{formatMoney(annualRiskReductionValue)}</span>
          </div>
        </div>
      </div>

      {/* Risk Appetite Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Risk Appetite Indicator
            <InfoTooltip
              term="Risk Appetite"
              definition="The amount of risk an organization is willing to accept in pursuit of its objectives. Scores above this threshold require mandatory treatment per governance policy."
            />
          </p>
          <span className="text-xs text-slate-500">Threshold: {riskAppetite} / 25</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            style={{ width: "100%" }}
          />
        </div>
        <div className="relative mt-2 h-8">
          <div
            className="absolute -top-5 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${appetiteMarker}%` }}
          >
            <div className="w-px h-5 bg-slate-400" />
            <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">
              Appetite ({riskAppetite})
            </span>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>1 — Minimal</span>
          <span>25 — Maximum</span>
        </div>
      </div>

      {/* Charts + Heatmap row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treatment Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-1 mb-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Treatment Status</h3>
            <InfoTooltip
              term="Treatment Status"
              definition="Breakdown of how logged risks are being handled across the four ISO 27005 treatment options: Mitigate, Accept, Transfer, and Avoid."
            />
          </div>
          {totalRisks === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <div className="h-52">
              <Doughnut data={treatmentData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-1 mb-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Risk Levels</h3>
          </div>
          {totalRisks === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <>
              <div className="h-52">
                <Doughnut data={levelData} options={chartOptions} />
              </div>
            </>
          )}
        </div>

        {/* Heat Map */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <RiskHeatMap risks={risks} riskAppetite={riskAppetite} />
        </div>
      </div>

      {/* Top Risks table */}
      {risks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Top Risks by Inherent Score
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Threat</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Inherent Risk</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Treatment</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Residual Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[...risks]
                  .sort((a, b) => b.inherentRisk - a.inherentRisk)
                  .slice(0, 5)
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-900">{r.threat}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          r.inherentRisk > riskAppetite
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : r.inherentRisk >= 12
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                            : r.inherentRisk >= 6
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                            : "bg-green-500/20 text-green-400 border border-green-500/40"
                        }`}>
                          {r.inherentRisk}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{r.treatmentStrategy}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">
                        {r.residualRisk !== undefined ? r.residualRisk : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {estimatedCosts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
              Highest-Cost Risk Treatments
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Threat</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Strategy</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Fix Cost</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Annual Opex</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Annual Value Preserved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[...estimatedCosts]
                  .sort((a, b) => b.oneTimeFixCost + b.annualMaintenanceCost - (a.oneTimeFixCost + a.annualMaintenanceCost))
                  .slice(0, 5)
                  .map((cost) => (
                    <tr key={cost.riskId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 text-slate-900">{cost.threat}</td>
                      <td className="px-5 py-3 text-slate-700">{cost.treatmentStrategy}</td>
                      <td className="px-5 py-3 text-slate-900 font-medium">{formatMoney(cost.oneTimeFixCost)}</td>
                      <td className="px-5 py-3 text-slate-700">{formatMoney(cost.annualMaintenanceCost)}</td>
                      <td className="px-5 py-3 text-emerald-700 font-medium">
                        {formatMoney(cost.annualRiskReductionValue)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
