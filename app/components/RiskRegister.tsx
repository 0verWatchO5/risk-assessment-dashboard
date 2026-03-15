"use client";

import { useState } from "react";
import {
  Asset,
  RiskEntry,
  TreatmentStrategy,
  getRiskLevel,
  getRiskBgClass,
} from "../types/grc";
import { storage } from "../lib/storage";
import InfoTooltip from "./InfoTooltip";

type LikelihoodImpact = 1 | 2 | 3 | 4 | 5;

const TREATMENT_STRATEGIES: TreatmentStrategy[] = ["Mitigate", "Accept", "Transfer", "Avoid"];

const TREATMENT_CLASSES: Record<TreatmentStrategy, string> = {
  Mitigate:  "bg-blue-50 text-blue-700 border border-blue-200",
  Accept:    "bg-slate-100 text-slate-700 border border-slate-200",
  Transfer:  "bg-violet-50 text-violet-700 border border-violet-200",
  Avoid:     "bg-orange-50 text-orange-700 border border-orange-200",
};

const TREATMENT_DESCRIPTIONS: Record<TreatmentStrategy, string> = {
  Mitigate:  "Implement controls to reduce the risk to an acceptable level.",
  Accept:    "Formally acknowledge the risk with no further action taken.",
  Transfer:  "Shift the risk to a third party (e.g., cyber insurance, outsourcing).",
  Avoid:     "Eliminate the risk by removing the activity or asset that causes it.",
};

type RiskRegisterProps = {
  assets: Asset[];
  risks: RiskEntry[];
  onChange: (risks: RiskEntry[]) => void;
  riskAppetite: number;
};

const SCORE_OPTIONS: LikelihoodImpact[] = [1, 2, 3, 4, 5];

function emptyForm(assets: Asset[]) {
  return {
    assetId: assets[0]?.id ?? "",
    threat: "",
    vulnerability: "",
    likelihood: 3 as LikelihoodImpact,
    impact: 3 as LikelihoodImpact,
    treatmentStrategy: "Mitigate" as TreatmentStrategy,
    control: "",
    residualLikelihood: 2 as LikelihoodImpact,
    residualImpact: 2 as LikelihoodImpact,
  };
}

export default function RiskRegister({ assets, risks, onChange, riskAppetite }: RiskRegisterProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => emptyForm(assets));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const inherentRisk = form.likelihood * form.impact;
  const residualRisk = form.residualLikelihood * form.residualImpact;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.assetId) e.assetId = "Select an asset.";
    if (!form.threat.trim()) e.threat = "Threat description is required.";
    if (form.threat.trim().length > 120) e.threat = "Max 120 characters.";
    if (!form.vulnerability.trim()) e.vulnerability = "Vulnerability description is required.";
    if (form.vulnerability.trim().length > 120) e.vulnerability = "Max 120 characters.";
    if (form.treatmentStrategy === "Mitigate" && !form.control.trim())
      e.control = "Specify a control for Mitigate strategy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const newRisk: RiskEntry = {
      id: crypto.randomUUID(),
      assetId: form.assetId,
      threat: form.threat.trim(),
      vulnerability: form.vulnerability.trim(),
      likelihood: form.likelihood,
      impact: form.impact,
      inherentRisk,
      treatmentStrategy: form.treatmentStrategy,
      ...(form.treatmentStrategy === "Mitigate" && {
        control: form.control.trim(),
        residualLikelihood: form.residualLikelihood,
        residualImpact: form.residualImpact,
        residualRisk,
      }),
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    const updated = [...risks, newRisk];
    onChange(updated);
    storage.setRisks(updated);
    setForm(emptyForm(assets));
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const updated = risks.filter((r) => r.id !== id);
    onChange(updated);
    storage.setRisks(updated);
  }

  function getAssetName(id: string) {
    return assets.find((a) => a.id === id)?.name ?? "Unknown Asset";
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Risk Register</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Identify, analyze, and treat information security risks per ISO 27005.
            <InfoTooltip
              term="Risk Register (ISO 27005)"
              definition="A structured record of all identified risks, their assessments, and treatment decisions. It is the central artifact of any ISO 27005 risk management program."
            />
          </p>
        </div>
        <button
          onClick={() => { setShowForm((s) => !s); setForm(emptyForm(assets)); }}
          disabled={assets.length === 0}
          title={assets.length === 0 ? "Add an asset first" : undefined}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700
                     text-white text-sm font-medium rounded-lg transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg leading-none">+</span>
          {showForm ? "Cancel" : "Log Risk"}
        </button>
      </div>

      {assets.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
          Register at least one asset in the Asset Inventory before logging risks.
        </div>
      )}

      {/* Risk Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">New Risk Entry</h3>

          {/* Row 1: Asset + Threat + Vulnerability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Affected Asset
              </label>
              <select
                value={form.assetId}
                onChange={(e) => setForm({ ...form, assetId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {errors.assetId && <p className="text-xs text-red-400">{errors.assetId}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Threat
                <InfoTooltip
                  term="Threat (ISO 27005)"
                  definition="A potential cause of an unwanted incident. Examples: Ransomware, Insider Threat, Phishing, Natural Disaster."
                />
              </label>
              <input
                type="text"
                value={form.threat}
                onChange={(e) => setForm({ ...form, threat: e.target.value })}
                maxLength={120}
                placeholder="e.g. Ransomware Attack"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              {errors.threat && <p className="text-xs text-red-400">{errors.threat}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Vulnerability
                <InfoTooltip
                  term="Vulnerability (ISO 27005)"
                  definition="A weakness in an asset or control that could be exploited by a threat. Examples: Unpatched OS, Weak Passwords, No MFA."
                />
              </label>
              <input
                type="text"
                value={form.vulnerability}
                onChange={(e) => setForm({ ...form, vulnerability: e.target.value })}
                maxLength={120}
                placeholder="e.g. Unpatched Operating System"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
              {errors.vulnerability && <p className="text-xs text-red-400">{errors.vulnerability}</p>}
            </div>
          </div>

          {/* Row 2: Likelihood + Impact + Inherent Risk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Likelihood (1–5)
                <InfoTooltip
                  term="Likelihood"
                  definition="The probability that the threat will exploit the vulnerability. 1 = Rare, 2 = Unlikely, 3 = Possible, 4 = Likely, 5 = Almost Certain."
                />
              </label>
              <select
                value={form.likelihood}
                onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) as LikelihoodImpact })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {SCORE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Impact (1–5)
                <InfoTooltip
                  term="Impact"
                  definition="The magnitude of harm if the risk event occurs. 1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Significant, 5 = Catastrophic."
                />
              </label>
              <select
                value={form.impact}
                onChange={(e) => setForm({ ...form, impact: Number(e.target.value) as LikelihoodImpact })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {SCORE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Live Inherent Risk preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  Inherent Risk
                  <InfoTooltip
                    term="Inherent Risk"
                    definition="The raw risk score before any controls are applied. Formula: Likelihood × Impact. Scores above your Risk Appetite indicate action is required."
                  />
                </p>
                <p className={`text-2xl font-bold mt-0.5 ${inherentRisk > riskAppetite ? "text-red-700" : "text-slate-900"}`}>
                  {inherentRisk}
                  <span className="text-xs font-normal text-slate-500 ml-1">/ 25</span>
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskBgClass(inherentRisk, riskAppetite)}`}>
                {getRiskLevel(inherentRisk, riskAppetite)}
              </span>
            </div>
          </div>

          {/* Row 3: Treatment Strategy */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Treatment Strategy
              <InfoTooltip
                term="Risk Treatment (ISO 27005)"
                definition="The decision on how to handle a risk. ISO 27005 defines four options: Mitigate (reduce), Accept (tolerate), Transfer (share), Avoid (eliminate)."
              />
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TREATMENT_STRATEGIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, treatmentStrategy: s })}
                  className={`
                    p-3 rounded-lg border text-sm font-medium text-left transition-all
                    ${form.treatmentStrategy === s
                      ? "border-sky-300 bg-sky-50 text-sky-800"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }
                  `}
                >
                  <span className="font-semibold block">{s}</span>
                  <span className="text-xs opacity-70 block mt-0.5">{TREATMENT_DESCRIPTIONS[s]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Control + Residual Risk (Mitigate only) */}
          {form.treatmentStrategy === "Mitigate" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-sky-50 border border-sky-200 rounded-2xl">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Control Implemented
                  <InfoTooltip
                    term="Security Control (ISO 27001 Annex A)"
                    definition="A safeguard designed to reduce likelihood or impact. Examples: Firewall, MFA, Encryption, Patch Management, Employee Training."
                  />
                </label>
                <input
                  type="text"
                  value={form.control}
                  onChange={(e) => setForm({ ...form, control: e.target.value })}
                  placeholder="e.g. Endpoint Detection & Response (EDR)"
                  maxLength={100}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2
                             text-sm text-slate-900 placeholder:text-slate-400
                             focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
                {errors.control && <p className="text-xs text-red-400">{errors.control}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Residual Likelihood</label>
                <select
                  value={form.residualLikelihood}
                  onChange={(e) => setForm({ ...form, residualLikelihood: Number(e.target.value) as LikelihoodImpact })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2
                             text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  {SCORE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Residual Impact</label>
                <select
                  value={form.residualImpact}
                  onChange={(e) => setForm({ ...form, residualImpact: Number(e.target.value) as LikelihoodImpact })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2
                             text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                  {SCORE_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="md:col-span-4 flex items-center gap-3 pt-1">
                <span className="text-xs text-slate-600">
                  Residual Risk Score:
                  <InfoTooltip
                    term="Residual Risk (ISO 27005)"
                    definition="The risk remaining after controls have been applied. Residual Risk = Residual Likelihood × Residual Impact. This should be within the organization's Risk Appetite."
                  />
                </span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getRiskBgClass(residualRisk, riskAppetite)}`}>
                  {residualRisk} / 25 — {getRiskLevel(residualRisk, riskAppetite)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm
                         font-medium rounded-lg transition-colors"
            >
              Save Risk Entry
            </button>
          </div>
        </form>
      )}

      {/* Risk Table */}
      {risks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
          </svg>
          <p className="text-sm">Risk Register is empty.</p>
          <p className="text-xs mt-1">Log your first risk to begin the assessment cycle.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {risks.map((risk) => {
            const isExpanded = expandedId === risk.id;
            const riskLevel = getRiskLevel(risk.inherentRisk, riskAppetite);
            const exceedsAppetite = risk.inherentRisk > riskAppetite;

            return (
              <div
                key={risk.id}
                className={`rounded-xl border transition-all ${
                  exceedsAppetite ? "border-red-200 bg-red-50" : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                {/* Row summary */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : risk.id)}
                >
                  {exceedsAppetite && (
                    <span className="flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 uppercase tracking-wider">
                      Exceeds Appetite
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{risk.threat}</p>
                    <p className="text-xs text-slate-500 truncate">{getAssetName(risk.assetId)} · {risk.vulnerability}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${getRiskBgClass(risk.inherentRisk, riskAppetite)}`}>
                    {risk.inherentRisk} / 25
                  </span>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${TREATMENT_CLASSES[risk.treatmentStrategy]}`}>
                    {risk.treatmentStrategy}
                  </span>
                  <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200 pt-3 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <p className="text-slate-500 uppercase tracking-wider mb-1">Likelihood</p>
                        <p className="text-slate-900 font-semibold text-base">{risk.likelihood} / 5</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <p className="text-slate-500 uppercase tracking-wider mb-1">Impact</p>
                        <p className="text-slate-900 font-semibold text-base">{risk.impact} / 5</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <p className="text-slate-500 uppercase tracking-wider mb-1">Inherent Risk</p>
                        <p className={`font-bold text-base ${exceedsAppetite ? "text-red-700" : "text-slate-900"}`}>
                          {risk.inherentRisk} — {riskLevel}
                        </p>
                      </div>
                      {risk.treatmentStrategy === "Mitigate" && risk.residualRisk !== undefined && (
                        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                          <p className="text-slate-500 uppercase tracking-wider mb-1">Residual Risk</p>
                          <p className="text-sky-700 font-bold text-base">
                            {risk.residualRisk} — {getRiskLevel(risk.residualRisk, riskAppetite)}
                          </p>
                        </div>
                      )}
                    </div>

                    {risk.control && (
                      <p className="text-xs text-slate-600">
                        <span className="text-slate-500 uppercase tracking-wider">Control: </span>
                        {risk.control}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(risk.id); }}
                        className="text-xs text-slate-500 hover:text-red-700 transition-colors"
                      >
                        Remove Entry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
