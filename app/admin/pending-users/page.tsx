// app/admin/pending-users/page.tsx
import { createClient } from "@supabase/supabase-js";
import { approveUser, denyUser } from "./actions";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function PendingUsersPage() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: pending, error } = await supabase
    .from("pending_users")
    .select("*")
    .order("requested_at", { ascending: true });

  if (error) {
    console.error("Error loading pending users:", error);
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

      {pending?.length === 0 && (
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
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        {pending?.map((p) => (
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
              <form action={approveUser} style={{ flex: 1 }}>
                <input type="hidden" name="email" value={p.email} />
                <button
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
              </form>

              <form action={denyUser} style={{ flex: 1 }}>
                <input type="hidden" name="email" value={p.email} />
                <button
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
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
