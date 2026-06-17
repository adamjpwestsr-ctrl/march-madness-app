"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // 👈 forces Node runtime instead of Edge

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function WelcomeNamePage() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  const [name, setName] = useState("");

  const saveName = async () => {
    await fetch("/api/save-name", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    });

    router.push("/home");
  };

  const skip = () => {
    router.push("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-slate-900 p-8 rounded-xl border border-slate-700 w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold">What should we call you?</h1>

        <p className="text-slate-400">
          This is how your name will appear on leaderboards and your profile.
        </p>

        <input
          type="text"
          placeholder="Your name"
          className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={saveName}
          className="w-full bg-emerald-600 py-2 rounded-lg hover:bg-emerald-500"
        >
          Continue
        </button>

        <button
          onClick={skip}
          className="w-full text-slate-400 underline text-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
