"use client";

import { useState } from "react";
import { Asset, AssetType, Criticality } from "../types/grc";
import { storage } from "../lib/storage";
import InfoTooltip from "./InfoTooltip";

const ASSET_TYPES: AssetType[] = ["Hardware", "Software", "Data", "People"];

const CRITICALITY_LABELS: Record<Criticality, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

const CRITICALITY_CLASSES: Record<Criticality, string> = {
  1: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  2: "bg-amber-50 text-amber-700 border border-amber-200",
  3: "bg-red-50 text-red-700 border border-red-200",
};

const TYPE_CLASSES: Record<AssetType, string> = {
  Hardware: "bg-blue-50 text-blue-700 border border-blue-200",
  Software: "bg-violet-50 text-violet-700 border border-violet-200",
  Data:     "bg-orange-50 text-orange-700 border border-orange-200",
  People:   "bg-teal-50 text-teal-700 border border-teal-200",
};

const EMPTY_FORM = { name: "", type: "Hardware" as AssetType, criticality: 2 as Criticality };

type AssetInventoryProps = {
  assets: Asset[];
  onChange: (assets: Asset[]) => void;
};

export default function AssetInventory({ assets, onChange }: AssetInventoryProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Asset name is required.";
    if (form.name.trim().length > 80) e.name = "Asset name must be 80 characters or fewer.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      type: form.type,
      criticality: form.criticality,
      createdAt: new Date().toISOString(),
    };

    const updated = [...assets, newAsset];
    onChange(updated);
    storage.setAssets(updated);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const updated = assets.filter((a) => a.id !== id);
    onChange(updated);
    storage.setAssets(updated);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Asset Inventory</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Register all information assets subject to risk assessment.
            <InfoTooltip
              term="Information Asset (ISO 27005)"
              definition="Anything of value to the organization that needs to be protected. Assets are the starting point of the ISO 27005 risk identification process."
            />
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700
                     text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          {showForm ? "Cancel" : "Add Asset"}
        </button>
      </div>

      {/* Add Asset Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            New Asset
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Asset Name */}
            <div className="md:col-span-1 space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Asset Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Active Directory Server"
                maxLength={80}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-transparent"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Asset Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Asset Type
                <InfoTooltip
                  term="Asset Type"
                  definition="ISO 27005 categorizes assets as: Hardware (physical devices), Software (applications/OS), Data (information), or People (personnel with privileged access)."
                />
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AssetType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {ASSET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Criticality */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Criticality
                <InfoTooltip
                  term="Asset Criticality"
                  definition="Reflects the business value of the asset. High-criticality assets that are compromised cause severe operational, financial, or reputational damage."
                />
              </label>
              <select
                value={form.criticality}
                onChange={(e) => setForm({ ...form, criticality: Number(e.target.value) as Criticality })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2
                           text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                <option value={1}>1 – Low</option>
                <option value={2}>2 – Medium</option>
                <option value={3}>3 – High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm
                         font-medium rounded-lg transition-colors"
            >
              Save Asset
            </button>
          </div>
        </form>
      )}

      {/* Asset Table */}
      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-12 h-12 mb-3 opacity-40">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-.75m16.5-13.5v.75A2.25 2.25 0 0118 6.75H6A2.25 2.25 0 013.75 4.5V3.75" />
          </svg>
          <p className="text-sm">No assets registered yet.</p>
          <p className="text-xs mt-1">Add your first asset to begin the risk identification process.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Criticality</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-900 font-medium">{asset.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${TYPE_CLASSES[asset.type]}`}>
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${CRITICALITY_CLASSES[asset.criticality]}`}>
                      {CRITICALITY_LABELS[asset.criticality]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(asset.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-slate-500 hover:text-red-600 transition-colors text-xs"
                      aria-label={`Delete asset ${asset.name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
