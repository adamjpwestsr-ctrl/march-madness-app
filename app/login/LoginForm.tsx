"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyAdminCode } from "./actions";

type LoginFormProps = {
  onClose?: () => void; // optional: close modal after login
};

export default function LoginForm({ onClose }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      if (!email.trim() || !adminCode.trim()) {
        setError("Please enter both email and admin code.");
        return;
      }

      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("adminCode", adminCode.trim());

      const res = await verifyAdminCode(formData);

      if (res.status === "invalidAdminCode") {
        setError("Invalid admin code.");
        return;
      }

      if (res.status === "notAdmin") {
        setError("This email is not an admin.");
        return;
      }

      if (res.status === "success") {
        // Admin login success
        if (onClose) onClose();
        router.push("/admin/dashboard"); // CHANGE THIS TO YOUR ADMIN PAGE
        return;
      }

      setError("Something went wrong.");
    });
  };

  return (
    <form onSubmit={handleAdminLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Admin Email"
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

      <input
        type="text"
        placeholder="Admin Code"
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
        {isPending ? "Verifying..." : "Login as Admin"}
      </button>
    </form>
  );
}
