"use client";

import { useState } from "react";

type Props = {
  onComplete: (opts: {
    email: string;
    mode: "GLOBAL" | "GROUP";
    groupCode?: string;
  }) => void;
};

export default function ChallengeEntry({ onComplete }: Props) {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"GLOBAL" | "GROUP" | null>(null);
  const [groupCode, setGroupCode] = useState("");

  const handleContinue = () => {
    if (!email || !mode) return;

    // store cookie for NCAAF identity
    document.cookie = `ncaaf_user=${encodeURIComponent(
      JSON.stringify({ email })
    )}; path=/; max-age=${60 * 60 * 24 * 365}`;

    onComplete({
      email,
      mode,
      groupCode: mode === "GROUP" ? groupCode : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[var(--bb-slate-light)] rounded-xl p-6 w-full max-w-md space-y-4 border border-[var(--bb-green)]">
        <h2 className="text-lg font-semibold text-white">
          Join NCAAF Weekly Pick’em
        </h2>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-[var(--bb-green)] bg-[var(--bb-slate)] px-3 py-2 text-sm text-white"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300">
            How do you want to play?
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMode("GLOBAL")}
              className={`flex-1 px-3 py-2 rounded border text-sm ${
                mode === "GLOBAL"
                  ? "border-[var(--bb-gold)] bg-[var(--bb-green)]/30"
                  : "border-[var(--bb-green)] bg-[var(--bb-slate)]"
              }`}
            >
              Global Leaderboard
            </button>
            <button
              type="button"
              onClick={() => setMode("GROUP")}
              className={`flex-1 px-3 py-2 rounded border text-sm ${
                mode === "GROUP"
                  ? "border-[var(--bb-gold)] bg-[var(--bb-green)]/30"
                  : "border-[var(--bb-green)] bg-[var(--bb-slate)]"
              }`}
            >
              Private Group
            </button>
          </div>
        </div>

        {mode === "GROUP" && (
          <div className="space-y-2">
            <label className="text-sm text-slate-300">
              Enter group passcode
            </label>
            <input
              type="text"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              maxLength={5}
              className="w-full rounded border border-[var(--bb-green)] bg-[var(--bb-slate)] px-3 py-2 text-sm text-white tracking-[0.4em] text-center"
              placeholder="12345"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          className="w-full mt-2 px-4 py-2 rounded bg-[var(--bb-green)] text-white text-sm disabled:opacity-50"
          disabled={
            !email ||
            !mode ||
            (mode === "GROUP" && groupCode.length !== 5)
          }
        >
          Continue
        </button>
      </div>
    </div>
  );
}
