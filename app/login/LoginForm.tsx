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
    "email" | "choice" | "admin" | "requested" | "error"
  >("email");

  useEffect(() => {
    if (onStepChange) onStepChange(step);
  }, [step, onStepChange]);

  const handleEmailSubmit = async () => {
    if (!email) return;

    const { data, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error(error);
      setStep("error");
      return;
    }

    // ⭐ UNKNOWN USER → ADD TO pending_users
    if (!data) {
      await supabase.from("pending_users").upsert({
        email: email.toLowerCase(),
        status: "pending",
      });

      setStep("requested");
      return;
    }

    // Save admin flag
    setIsAdmin(data.is_admin);

    // BOTH admins and regular users go to the choice screen
    setStep("choice");
  };

  const handleAdminVerify = () => {
    if (adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE) {
      window.location.href = "/admin";
    } else {
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

      {/* CHOICE SCREEN */}
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
            type="text"
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
            onClick={() => setStep("choice")}
            className="mt-3 w-full text-slate-400 underline hover:text-slate-300"
          >
            Back
          </button>
        </>
      )}

      {/* REQUESTED APPROVAL */}
      {step === "requested" && (
        <p className="text-center text-slate-300 mt-4">
          Your email has been sent to the commissioners for approval.
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
