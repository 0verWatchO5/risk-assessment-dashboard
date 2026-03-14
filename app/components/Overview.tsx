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

ChartJS.register(ArcElement, Tooltip, Legend);

type OverviewProps = {
  assets: Asset[];
  risks: RiskEntry[];
  riskAppetite: number;
  orgName: string;
};

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
    <div className={`bg-slate-800/50 border rounded-xl px-5 py-4 ${accent ?? "border-slate-700"}`}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${accent ? "text-red-400" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Overview({ assets, risks, riskAppetite, orgName }: OverviewProps) {
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
          color: "#94a3b8",
          font: { size: 11 },
          padding: 14,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        borderWidth: 1,
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
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
          <h2 className="text-xl font-semibold text-white">Executive Overview</h2>
          <p className="text-sm text-slate-400 mt-0.5">{orgName} · ISO 27005 Risk Dashboard</p>
        </div>
        {exceedingAppetite > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/40 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm font-semibold text-red-400">
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
          accent={exceedingAppetite > 0 ? "border-red-500/40 bg-red-500/5" : undefined}
        />
      </div>

      {/* Risk Appetite Banner */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Risk Appetite Indicator
            <InfoTooltip
              term="Risk Appetite"
              definition="The amount of risk an organization is willing to accept in pursuit of its objectives. Scores above this threshold require mandatory treatment per governance policy."
            />
          </p>
          <span className="text-xs text-slate-500">Threshold: {riskAppetite} / 25</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
            style={{ width: "100%" }}
          />
        </div>
        <div
          className="relative mt-1"
          style={{ paddingLeft: `${(riskAppetite / 25) * 100}%` }}
        >
          <div className="absolute -top-4 left-0 -translate-x-1/2 flex flex-col items-center">
            <div className="w-px h-4 bg-white/60" />
            <span className="text-[10px] text-white/60 whitespace-nowrap mt-0.5">Appetite ({riskAppetite})</span>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600 mt-4">
          <span>1 — Minimal</span>
          <span>25 — Maximum</span>
        </div>
      </div>

      {/* Charts + Heatmap row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treatment Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-1 mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Treatment Status</h3>
            <InfoTooltip
              term="Treatment Status"
              definition="Breakdown of how logged risks are being handled across the four ISO 27005 treatment options: Mitigate, Accept, Transfer, and Avoid."
            />
          </div>
          {totalRisks === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <div className="h-52">
              <Doughnut data={treatmentData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-1 mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Risk Levels</h3>
          </div>
          {totalRisks === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data yet</div>
          ) : (
            <>
              <div className="h-52">
                <Doughnut data={levelData} options={chartOptions} />
              </div>
            </>
          )}
        </div>

        {/* Heat Map */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <RiskHeatMap risks={risks} riskAppetite={riskAppetite} />
        </div>
      </div>

      {/* Top Risks table */}
      {risks.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Top Risks by Inherent Score
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Threat</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Inherent Risk</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Treatment</th>
                  <th className="text-left px-5 py-2.5 text-xs text-slate-500 uppercase">Residual Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {[...risks]
                  .sort((a, b) => b.inherentRisk - a.inherentRisk)
                  .slice(0, 5)
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 text-white">{r.threat}</td>
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
                      <td className="px-5 py-3 text-slate-300">{r.treatmentStrategy}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">
                        {r.residualRisk !== undefined ? r.residualRisk : "—"}
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
