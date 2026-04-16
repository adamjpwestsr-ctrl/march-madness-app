"use client";

import { useState, useTransition } from "react";
import { loginWithEmail, verifyAdminCode } from "./actions";

type LoginFormProps = {
  onStepChange?: (step: string) => void;
};

export default function LoginForm({ onStepChange }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [step, setStep] = useState<"email" | "admin" | "options">("email");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // -----------------------------
  // STEP 1 — EMAIL SUBMIT
  // -----------------------------
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);

      const res = await loginWithEmail(formData);

      if (res.status === "needsAdminCode") {
        setStep("admin");
        onStepChange?.("admin");
        return;
      }

      if (res.status === "magicLinkSent") {
        // Instead of showing "magic link sent", we now move to the options screen
        setStep("options");
        onStepChange?.("options");
        return;
      }

      if (res.status === "missingEmail") {
        setError("Please enter your email.");
        return;
      }

      setError("Something went wrong.");
    });
  };

  // -----------------------------
  // STEP 2 — ADMIN CODE SUBMIT
  // -----------------------------
  const handleAdminCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("adminCode", adminCode);

      const res = await verifyAdminCode(formData);

      if (res.status === "success") {
        window.location.href = "/login/admin-options";
        return;
      }

      if (res.status === "invalidAdminCode") {
        setError("Invalid admin code.");
        return;
      }

      if (res.status === "notAdmin") {
        setError("This email is not an admin.");
        return;
      }

      setError("Something went wrong.");
    });
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="space-y-4">

      {/* STEP 1 — EMAIL */}
      {step === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="
              w-full px-3 py-2 rounded-lg 
              bg-slate-800 text-white placeholder-slate-400 
              border border-slate-600 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              transition-all duration-200
            "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="
              w-full bg-emerald-600 text-white py-2 rounded-lg
              hover:bg-emerald-500 hover:shadow-lg
              transition-all duration-200 disabled:opacity-50
            "
          >
            {isPending ? "Loading..." : "Continue"}
          </button>
        </form>
      )}

      {/* STEP 2 — ADMIN CODE */}
      {step === "admin" && (
        <form onSubmit={handleAdminCodeSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter admin code"
            className={`
              w-full px-3 py-2 rounded-lg 
              bg-slate-800 text-white placeholder-slate-400 
              border border-slate-600 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
              transition-all duration-200
              ${error === "Invalid admin code." ? "animate-shake" : ""}
            `}
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            disabled={isPending}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="
              w-full bg-emerald-600 text-white py-2 rounded-lg
              hover:bg-emerald-500 hover:shadow-lg
              transition-all duration-200 disabled:opacity-50
            "
          >
            {isPending ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            className="w-full text-sm text-gray-400 underline"
            onClick={() => {
              setStep("email");
              setAdminCode("");
              onStepChange?.("email");
            }}
          >
            Back
          </button>
        </form>
      )}

      {/* STEP 3 — OPTIONS */}
      {step === "options" && (
        <div className="space-y-4 mt-6">

          <button
            onClick={() => (window.location.href = "/bracket")}
            className="
              w-full bg-emerald-600 text-white py-2 rounded-lg
              hover:bg-emerald-500 hover:shadow-lg
              transition-all duration-200
            "
          >
            Brackets (March Madness)
          </button>

          <button
            onClick={() => (window.location.href = "/leaderboard")}
            className="
              w-full bg-white/10 border border-white/20 text-white py-2 rounded-lg
              hover:bg-white/20 transition-all duration-200
            "
          >
            Leaderboard
          </button>

          <button
            onClick={() => (window.location.href = "/sports")}
            className="
              w-full bg-white/10 border border-white/20 text-white py-2 rounded-lg
              hover:bg-white/20 transition-all duration-200
            "
          >
            Other Sports
          </button>

          <button
            onClick={() => {
              setStep("email");
              onStepChange?.("email");
            }}
            className="w-full text-sm text-gray-400 underline"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
