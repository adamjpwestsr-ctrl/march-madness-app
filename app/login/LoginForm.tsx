"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type LoginFormProps = {
  onStepChange?: (step: string) => void;
};

export default function LoginForm({ onStepChange }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [step, setStep] = useState<"email" | "admin" | "requested" | "error">("email");

  useEffect(() => {
    if (onStepChange) onStepChange(step);
  }, [step, onStepChange]);

  const handleEmailSubmit = async () => {
    if (!email) return;

    const { data, error } = await supabase
      .from("players")
      .select("is_admin")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error(error);
      setStep("error");
      return;
    }

    if (!data) {
      setStep("requested");
      return;
    }

    if (data.is_admin) {
      setStep("admin");
      return;
    }

    window.location.href = "/brackets";
  };

  const handleAdminVerify = async () => {
    if (adminCode === process.env.NEXT_PUBLIC_ADMIN_CODE) {
      window.location.href = "/admin";
    } else {
      setStep("error");
    }
  };

  return (
    <div className="w-full">
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
        </>
      )}

      {step === "requested" && (
        <p className="text-center text-slate-300 mt-4">
          Your email has been sent to the admin for approval.
        </p>
      )}

      {step === "error" && (
        <p className="text-center text-red-400 mt-4">
          Something went wrong. Try again.
        </p>
      )}
    </div>
  );
}
