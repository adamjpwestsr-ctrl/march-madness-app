"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

type UserRow = {
  user_id: number;
  name: string | null;
  email: string | null;
  is_admin: boolean | null;
  admin_code: string | null;
};

type Bracket = {
  bracket_id: string;
  user_id: number;
  bracket_name: string;
  created_at: string | null;
};

type MulliganRequest = {
  id: number;
  user_id: number;
  bracket_id: string | null;
  game_id: number;
  replacement_team: string;
  status: string;
  created_at: string;
};

export default function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [brackets, setBrackets] = useState<Record<number, Bracket[]>>({});
  const [mulligans, setMulligans] = useState<
    Record<number, MulliganRequest[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);

    // Load users
    const { data: userRows, error: userErr } = await supabase
      .from("users")
      .select("user_id, name, email, is_admin, admin_code")
      .order("user_id", { ascending: true });

    if (userErr) console.error("Users load error:", userErr);
    setUsers(userRows ?? []);

    // Load brackets
    const { data: bracketRows, error: bracketErr } = await supabase
      .from("brackets")
      .select("bracket_id, user_id, bracket_name, created_at");

    if (bracketErr) console.error("Brackets load error:", bracketErr);

    const bracketMap: Record<number, Bracket[]> = {};
    (bracketRows ?? []).forEach((b) => {
      if (!bracketMap[b.user_id]) bracketMap[b.user_id] = [];
      bracketMap[b.user_id].push(b);
    });
    setBrackets(bracketMap);

    // Load mulligans
    const { data: mulliganRows, error: mulliganErr } = await supabase
      .from("mulligan_requests")
      .select("*");

    if (mulliganErr) console.error("Mulligans load error:", mulliganErr);

    const mulliganMap: Record<number, MulliganRequest[]> = {};
    (mulliganRows ?? []).forEach((m) => {
      if (!mulliganMap[m.user_id]) mulliganMap[m.user_id] = [];
      mulliganMap[m.user_id].push(m);
    });
    setMulligans(mulliganMap);

    setLoading(false);
  };

  const toggleExpand = (userId: number) => {
    setExpandedUser((prev) => (prev === userId ? null : userId));
  };

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
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Admin · User Management
      </h1>

      {loading && (
        <div style={{ textAlign: "center", opacity: 0.8 }}>Loading…</div>
      )}

      <div
        style={{
          display: "grid",
          gap: 16,
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {users.map((u) => {
          const userBrackets = brackets[u.user_id] ?? [];
          const userMulligans = mulligans[u.user_id] ?? [];

          return (
            <div
              key={u.user_id}
              style={{
                background: "rgba(30,41,59,0.9)",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.35)",
                padding: 16,
                boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {u.name || u.email || `User #${u.user_id}`}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    {u.email ?? "No email"}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Admin: {u.is_admin ? "Yes" : "No"}
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(u.user_id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#1D4ED8",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 13,
                    height: 36,
                  }}
                >
                  {expandedUser === u.user_id ? "Hide" : "View"}
                </button>
              </div>

              {/* SUMMARY */}
              <div
                style={{
                  fontSize: 13,
                  opacity: 0.85,
                  marginBottom: expandedUser === u.user_id ? 12 : 0,
                }}
              >
                Brackets: <strong>{userBrackets.length}</strong> · Mulligans:{" "}
                <strong>{userMulligans.length}</strong>
              </div>

              {/* EXPANDED DETAILS */}
              {expandedUser === u.user_id && (
                <div
                  style={{
                    marginTop: 10,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(148,163,184,0.35)",
                  }}
                >
                  {/* BRACKETS */}
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Brackets
                  </h3>

                  {userBrackets.length === 0 && (
                    <div style={{ opacity: 0.7, fontSize: 13 }}>
                      No brackets.
                    </div>
                  )}

                  {userBrackets.map((b) => (
                    <div
                      key={b.bracket_id}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(148,163,184,0.25)",
                        marginBottom: 6,
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {b.bracket_name} ({b.bracket_id})
                      </div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>
                        Created:{" "}
                        {b.created_at
                          ? new Date(b.created_at).toLocaleString()
                          : "Unknown"}
                      </div>

                      <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                        <Link
                          href={`/admin/brackets`}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "#1D4ED8",
                            color: "white",
                            fontSize: 12,
                            textDecoration: "none",
                          }}
                        >
                          Manage Brackets
                        </Link>
                      </div>
                    </div>
                  ))}

                  {/* MULLIGANS */}
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                    }}
                  >
                    Mulligan Requests
                  </h3>

                  {userMulligans.length === 0 && (
                    <div style={{ opacity: 0.7, fontSize: 13 }}>
                      No mulligan requests.
                    </div>
                  )}

                  {userMulligans.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(148,163,184,0.25)",
                        marginBottom: 6,
                        fontSize: 13,
                      }}
                    >
                      <div>
                        Game {m.game_id}:{" "}
                        <strong>{m.replacement_team}</strong>
                      </div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>
                        Status: {m.status.toUpperCase()}
                      </div>
                      <div style={{ opacity: 0.7, fontSize: 12 }}>
                        {new Date(m.created_at).toLocaleString()}
                      </div>

                      <div style={{ marginTop: 6 }}>
                        <Link
                          href={`/admin/mulligans`}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 6,
                            background: "#1D4ED8",
                            color: "white",
                            fontSize: 12,
                            textDecoration: "none",
                          }}
                        >
                          Manage Mulligans
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {users.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              opacity: 0.8,
              marginTop: 40,
            }}
          >
            No users found.
          </div>
        )}
      </div>
    </div>
  );
}
