"use client";

import { useState, useTransition } from "react";
import { loginWithEmail, verifyAdminCode } from "./actions";

export default function LoginForm({ onStepChange }) {
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
          <input
            type="email"
            placeholder="Email address"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
          >
            {isPending ? "Loading..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleAdminCodeSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter admin code"
            className="w-full border rounded px-3 py-2"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            disabled={isPending}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
          >
            {isPending ? "Verifying..." : "Verify Code"}
          </button>

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
