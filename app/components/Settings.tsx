"use client";

import { AppSettings } from "../types/grc";
import InfoTooltip from "./InfoTooltip";

type SettingsProps = {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onLoadDemo: () => void;
  onClearData: () => void;
};

export default function Settings({ settings, onChange, onLoadDemo, onClearData }: SettingsProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-600 mt-0.5">Governance profile and risk configuration.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 max-w-2xl shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Organization Name</label>
          <input
            type="text"
            value={settings.orgName}
            onChange={(e) => onChange({ ...settings, orgName: e.target.value })}
            maxLength={80}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900
                       placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Risk Appetite Threshold (1-25)
            <InfoTooltip
              term="Risk Appetite Threshold"
              definition="Any inherent risk score above this value is flagged as Exceeding Appetite. Typical governance policy uses this threshold to trigger mandatory treatment and escalation."
            />
          </label>
          <input
            type="number"
            min={1}
            max={25}
            value={settings.riskAppetite}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isNaN(value)) return;
              onChange({ ...settings, riskAppetite: Math.min(25, Math.max(1, value)) });
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <p className="text-xs text-slate-500">Current policy: Scores above {settings.riskAppetite} are considered out of appetite.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Framework</label>
          <input
            type="text"
            value={settings.framework}
            onChange={(e) => onChange({ ...settings, framework: e.target.value || "ISO 27005" })}
            maxLength={40}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>

        <div className="pt-2 border-t border-slate-200 space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Presentation Mode</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onLoadDemo}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium transition-colors"
            >
              Load Demo Dataset
            </button>
            <button
              type="button"
              onClick={onClearData}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              Reset All Data
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Load a recruiter-ready sample with pre-populated assets, risks, controls, and treatment outcomes.
          </p>
        </div>
      </div>
    </div>
  );
}
