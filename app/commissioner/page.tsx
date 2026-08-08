"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export default function CommissionerPage() {
  const supabase = createSupabaseBrowserClient();

  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  // Fetch pending users
  useEffect(() => {
    async function loadPending() {
      const { data, error } = await supabase
        .from("pending_users")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data) {
        setPending(data);
      }

      setLoading(false);
    }

    loadPending();
  }, []);

  async function approve(email: string) {
    setMessage("");

    startTransition(async () => {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (json.status === "success") {
        setPending((prev) => prev.filter((u) => u.email !== email));
        setMessage(`Approved: ${email}`);
      } else {
        setMessage(`Error approving ${email}: ${json.message}`);
      }
    });
  }

  async function deny(email: string) {
    setMessage("");

    startTransition(async () => {
      const { error } = await supabase
        .from("pending_users")
        .delete()
        .eq("email", email);

      if (!error) {
        setPending((prev) => prev.filter((u) => u.email !== email));
        setMessage(`Denied: ${email}`);
      } else {
        setMessage(`Error denying ${email}`);
      }
    });
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Commissioner Dashboard
      </h1>

      <p className="text-slate-400 text-center mb-10">
        Approve or deny new user access requests.
      </p>

      {message && (
        <div className="text-center mb-6 text-emerald-400 font-semibold">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-400">Loading pending users...</p>
      ) : pending.length === 0 ? (
        <p className="text-center text-slate-400">
          No pending approval requests.
        </p>
      ) : (
        <div className="space-y-4 max-w-xl mx-auto">
          {pending.map((user) => (
            <div
              key={user.email}
              className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-slate-400 text-sm">
                  Requested: {new Date(user.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => approve(user.email)}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg text-sm"
                >
                  Approve
                </button>

                <button
                  onClick={() => deny(user.email)}
                  disabled={isPending}
                  className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-sm"
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <a
          href="/home"
          className="text-emerald-400 hover:text-emerald-300 underline"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
