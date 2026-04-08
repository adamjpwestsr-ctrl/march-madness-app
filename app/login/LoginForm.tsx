"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type LoginFormProps = {
  onStepChange?: (step: string) => void;
};

export default function LoginForm({ onStepChange }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [step, setStep] = useState<
    "email" | "choice" | "admin" | "pending" | "magicSent" | "error"
  >("email");

  useEffect(() => {
    if (onStepChange) onStepChange(step);
  }, [step, onStepChange]);

  const handleEmailSubmit = async () => {
    if (!email) return;

    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.status === "pending") {
        setStep("pending");
        return;
      }

      if (data.status === "magicLinkSent") {
        setStep("magicSent");
        return;
      }

      if (data.status === "admin") {
        setIsAdmin(true);
        setStep("admin");
        return;
      }

      setStep("error");
    } catch (e) {
      console.error(e);
      setStep("error");
    }
  };

  // Admins: skip magic link, use admin code as password
  const handleAdminVerify = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: adminCode,
      });

      if (error || !data.session) {
        console.error(error);
        setStep("error");
        return;
      }

      // Supabase session is now active
      window.location.href = "/admin";
    } catch (e) {
      console.error(e);
      setStep("error");
    }
  };

  return (
    <div className="w-full">
      {/* EMAIL STEP */}
      {step === "email" && (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <button
            onClick={handleEmailSubmit}
            className="mt-6 w-full bg-emerald-500 py-3 rounded-lg text-white font-bold hover:bg-emerald-400 transition"
          >
            Continue
          </button>
        </>
      )}

      {/* CHOICE SCREEN (you can reuse later if needed) */}
      {step === "choice" && (
        <div className="flex flex-col space-y-4 mt-4">
          <button
            onClick={() => (window.location.href = "/bracket")}
            className="w-full bg-emerald-500 py-3 rounded-lg text-white font-bold hover:bg-emerald-400 transition"
          >
            Enter Brackets
          </button>

          <button
            onClick={() => (window.location.href = "/leaderboard")}
            className="w-full bg-slate-700 py-3 rounded-lg text-white font-bold hover:bg-slate-600 transition"
          >
            View Leaderboard
          </button>

          {isAdmin && (
            <button
              onClick={() => setStep("admin")}
              className="w-full bg-indigo-500 py-3 rounded-lg text-white font-bold hover:bg-indigo-400 transition"
            >
              Admin Portal
            </button>
          )}
        </div>
      )}

      {/* ADMIN CODE STEP */}
      {step === "admin" && (
        <>
          <input
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder="Enter admin code"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <button
            onClick={handleAdminVerify}
            className="mt-6 w-full bg-emerald-500 py-3 rounded-lg text-white font-bold hover:bg-emerald-400 transition"
          >
            Verify
          </button>

          <button
            onClick={() => setStep("email")}
            className="mt-3 w-full text-slate-400 underline hover:text-slate-300"
          >
            Back
          </button>
        </>
      )}

      {/* PENDING APPROVAL */}
      {step === "pending" && (
        <p className="text-center text-slate-300 mt-4">
          Your email has been sent to the commissioners for approval.
        </p>
      )}

      {/* MAGIC LINK SENT */}
      {step === "magicSent" && (
        <p className="text-center text-emerald-300 mt-4">
          Check your email for a magic link to sign in.
        </p>
      )}

      {/* ERROR */}
      {step === "error" && (
        <p className="text-center text-red-400 mt-4">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}
