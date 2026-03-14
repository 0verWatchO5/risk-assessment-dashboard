"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import AssetInventory from "./components/AssetInventory";
import RiskRegister from "./components/RiskRegister";
import Settings from "./components/Settings";
import { storage } from "./lib/storage";
import { AppSettings, Asset, DEFAULT_SETTINGS, RiskEntry } from "./types/grc";
import { demoAssets, demoRisks, demoSettings } from "./lib/demoData";

type ViewId = "overview" | "assets" | "risks" | "settings";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [risks, setRisks] = useState<RiskEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setAssets(storage.getAssets());
    setRisks(storage.getRisks());
    setSettings(storage.getSettings());
  }, []);

  const riskAppetite = useMemo(() => settings.riskAppetite || 15, [settings.riskAppetite]);

  function handleAssetsChange(nextAssets: Asset[]) {
    setAssets(nextAssets);
  }

  function handleRisksChange(nextRisks: RiskEntry[]) {
    setRisks(nextRisks);
  }

  function handleSettingsChange(nextSettings: AppSettings) {
    setSettings(nextSettings);
    storage.setSettings(nextSettings);
  }

  function handleLoadDemoData() {
    setAssets(demoAssets);
    setRisks(demoRisks);
    setSettings(demoSettings);
    storage.setAssets(demoAssets);
    storage.setRisks(demoRisks);
    storage.setSettings(demoSettings);
    setActiveView("overview");
  }

  function handleResetAllData() {
    storage.clearAll();
    setAssets([]);
    setRisks([]);
    setSettings(DEFAULT_SETTINGS);
    setActiveView("overview");
  }

  return (
    <div className="min-h-screen bg-app-gradient text-slate-100">
      <div className="flex md:flex-row flex-col min-h-screen">
        <Sidebar active={activeView} onNavigate={(id) => setActiveView(id as ViewId)} />

        <main className="flex-1 overflow-auto">
          {activeView === "overview" && (
            <Overview
              assets={assets}
              risks={risks}
              riskAppetite={riskAppetite}
              orgName={settings.orgName || "My Organization"}
            />
          )}

          {activeView === "assets" && (
            <AssetInventory assets={assets} onChange={handleAssetsChange} />
          )}

          {activeView === "risks" && (
            <RiskRegister
              assets={assets}
              risks={risks}
              onChange={handleRisksChange}
              riskAppetite={riskAppetite}
            />
          )}

          {activeView === "settings" && (
            <Settings
              settings={settings}
              onChange={handleSettingsChange}
              onLoadDemo={handleLoadDemoData}
              onClearData={handleResetAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
