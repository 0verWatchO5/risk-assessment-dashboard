"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { storage } from "./lib/storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (storage.isAuthenticated()) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-app-gradient text-slate-900 grid place-items-center">
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  );
}
