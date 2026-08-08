// app/admin/pending-users/page.tsx

"use client";

import { useEffect, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export default function PendingUsersPage() {
  const supabase = createSupabaseBrowserClient();

  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  // Load pending users
  useEffect(() => {
    async function loadPending() {
      const { data, error } = await supabase
        .from("pending_users")
        .select("*")
        .order("requested_at", { ascending: true });

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
    <div
      style={{
        padding: 30,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#0f172a",
        minHeight: "100vh",
        color: "#e5e7eb",
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 20,
          textAlign: "center",
          letterSpacing: 0.5,
        }}
      >
        Pending User Approvals
      </h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: 30,
          opacity: 0.8,
          fontSize: 14,
        }}
      >
        Approve or deny new player access requests.
      </p>

      {message && (
        <p
          style={{
            textAlign: "center",
            marginBottom: 20,
            color: "#34d399",
            fontWeight: 600,
          }}
        >
          {message}
        </p>
      )}

      {loading ? (
        <p
          style={{
            textAlign: "center",
            opacity: 0.7,
            fontSize: 16,
            marginTop: 40,
          }}
        >
          Loading pending users...
        </p>
      ) : pending.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            opacity: 0.7,
            fontSize: 16,
            marginTop: 40,
          }}
        >
          No pending users.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          {pending.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 20,
                background: "rgba(30,41,59,0.9)",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.35)",
                boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
              }}
            >
              <p style={{ fontSize: 18, fontWeight: 600 }}>{p.email}</p>

              <p
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 6,
                  marginBottom: 20,
                }}
              >
                Requested: {new Date(p.requested_at).toLocaleString()}
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => approve(p.email)}
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "#059669",
                    borderRadius: 8,
                    border: "none",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() => deny(p.email)}
                  disabled={isPending}
                  style={{
                    width: "100%",
                    padding: "10px 0",
                    background: "#dc2626",
                    borderRadius: 8,
                    border: "none",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
