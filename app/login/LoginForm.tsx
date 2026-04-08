"use client";

import { useState, useTransition } from "react";
import { loginWithEmail, verifyAdminCode } from "./actions";

type LoginFormProps = {
  onStepChange?: (step: string) => void;
};

export default function LoginForm({ onStepChange }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [needsAdminCode, setNeedsAdminCode] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);

      const res = await loginWithEmail(formData);

      if (res.status === "needsAdminCode") {
        setNeedsAdminCode(true);
        onStepChange?.("admin");
        return;
      }

      if (res.status === "magicLinkSent") {
        setError("Magic link sent! Check your email.");
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
      const formData = new FormData();
      formData.append("email", email);
      formData.append("adminCode", adminCode);

      const res = await verifyAdminCode(formData);

      if (res.status === "success") {
        window.location.href = "/admin";
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

  return (
    <div className="space-y-4">
      {!needsAdminCode ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {/* EMAIL INPUT */}
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

          {/* CONTINUE BUTTON */}
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
      ) : (
        <form onSubmit={handleAdminCodeSubmit} className="space-y-4">
          {/* ADMIN CODE INPUT */}
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

          {/* VERIFY BUTTON */}
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

          {/* BACK BUTTON */}
          <button
            type="button"
            className="w-full text-sm text-gray-400 underline"
            onClick={() => {
              setNeedsAdminCode(false);
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
