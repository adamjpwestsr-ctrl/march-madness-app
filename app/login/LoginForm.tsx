"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, verifyAdminCode } from "./actions";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";   // ⭐ NEW

type LoginFormProps = {
  onStepChange?: (step: "email" | "admin") => void;
  onEmailChange?: (email: string) => void;
};

export default function LoginForm({ onStepChange, onEmailChange }: LoginFormProps) {
  const supabase = createSupabaseBrowserClient();   // ⭐ NEW

  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [step, setStep] = useState<"email" | "admin">("email");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      // ⭐ CRITICAL: Clear stale Supabase session BEFORE login
      await supabase.auth.signOut();

      const formData = new FormData();
      formData.append("email", email);

      const res = await loginWithEmail(formData);

      if (res.status === "needsAdminCode") {
        setStep("admin");
        onStepChange?.("admin");
        return;
      }

      if (res.status === "needsName") {
        router.push(`/welcome-name?email=${encodeURIComponent(email)}`);
        return;
      }

      if (res.status === "success") {
        router.push("/home");
        return;
      }

      if (res.status === "missingEmail") {
        setError("Please enter your email.");
        return;
      }

      setError("Something went wrong.");
    });
  };

  const handleAdminCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      // ⭐ CRITICAL: Clear stale Supabase session BEFORE admin login
      await supabase.auth.signOut();

      const formData = new FormData();
      formData.append("email", email);
      formData.append("adminCode", adminCode);

      const res = await verifyAdminCode(formData);

      if (res.status === "success") {
        router.push("/home");
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

      if (res.status === "invalidCredentials") {
        setError("Invalid admin credentials.");
        return;
      }

      setError("Something went wrong.");
    });
  };

  return (
    /* ⭐ Your UI stays exactly the same */
    /* ⭐ No changes below this line */
    <div className="space-y-4">
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
            onChange={(e) => {
              setEmail(e.target.value);
              onEmailChange?.(e.target.value);
            }}
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
    </div>
  );
}
