"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "../lib/storage";

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "riskguard123";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (storage.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username !== DEFAULT_USERNAME || password !== DEFAULT_PASSWORD) {
      setError("Invalid credentials. Try admin / riskguard123");
      return;
    }

    storage.login(username);
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-app-gradient text-slate-900 grid place-items-center px-4">
      <section className="w-full max-w-md bg-white/90 backdrop-blur-md border border-sky-100 rounded-3xl p-7 shadow-[0_24px_80px_rgba(148,163,184,0.22)]">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-600">Protected Access</p>
        <h1 className="text-2xl font-semibold mt-2 text-slate-900">RiskGuard Sign In</h1>
        <p className="text-sm text-slate-600 mt-2">
          Sign in to access the risk assessment dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-xs text-slate-600 uppercase tracking-wide">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              autoComplete="username"
              className="mt-1.5 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-300/70"
              placeholder="Enter username"
            />
          </label>

          <label className="block">
            <span className="text-xs text-slate-600 uppercase tracking-wide">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-300/70"
              placeholder="Enter password"
            />
          </label>

          {error && (
            <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 transition-colors"
          >
            Login
          </button>
        </form>
      </section>
    </div>
  );
}
