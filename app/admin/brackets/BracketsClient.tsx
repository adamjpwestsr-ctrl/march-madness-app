"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Bracket = {
  id: number;
  user_id: string;
  bracket_name: string;
  created_at: string;
};

type Submission = {
  bracket_id: number;
  tiebreaker: number | null;
  submitted_at: string | null;
};

type Pick = {
  game_id: number;
  selected_team: string;
};

export default function BracketsClient() {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, Submission>>({});
  const [users, setUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [viewingBracket, setViewingBracket] = useState<number | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loadingPicks, setLoadingPicks] = useState(false);

  useEffect(() => {
    loadBrackets();
  }, []);

  const loadBrackets = async () => {
    setLoading(true);

    const { data: bracketRows } = await supabase
      .from("brackets")
      .select("*")
      .order("created_at", { ascending: false });

    setBrackets(bracketRows ?? []);

    // Load submissions
    const { data: submissionRows } = await supabase
      .from("bracket_submissions")
      .select("*");

    const submissionMap: Record<number, Submission> = {};
    (submissionRows ?? []).forEach((s) => {
      submissionMap[s.bracket_id] = s;
    });
    setSubmissions(submissionMap);

    // Load user emails
    const { data: userRows } = await supabase
      .from("users")
      .select("id, email");

    const userMap: Record<string, string> = {};
    (userRows ?? []).forEach((u) => {
      userMap[u.id] = u.email;
    });
    setUsers(userMap);

    setLoading(false);
  };

  const loadBracketPicks = async (bracketId: number) => {
    setLoadingPicks(true);

    const { data } = await supabase
      .from("picks")
      .select("game_id, selected_team")
      .eq("bracket_id", bracketId)
      .order("game_id");

    setPicks(data ?? []);
    setLoadingPicks(false);
  };

  const deleteBracket = async (bracketId: number) => {
    if (!confirm("Delete this bracket?")) return;

    await supabase.from("picks").delete().eq("bracket_id", bracketId);
    await supabase.from("bracket_submissions").delete().eq("bracket_id", bracketId);
    await supabase.from("brackets").delete().eq("id", bracketId);

    alert("Bracket deleted.");
    loadBrackets();
  };

  const resetBracket = async (bracketId: number) => {
    if (!confirm("Reset all picks for this bracket?")) return;

    await supabase.from("picks").delete().eq("bracket_id", bracketId);
    await supabase.from("bracket_submissions").delete().eq("bracket_id", bracketId);

    alert("Bracket reset.");
    loadBrackets();
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
        Admin · Bracket Management
      </h1>

      {loading && (
        <div style={{ textAlign: "center", opacity: 0.8 }}>Loading…</div>
      )}

      <div
        style={{
          display: "grid",
          gap: 16,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {brackets.map((b) => {
          const sub = submissions[b.id];
          const email = users[b.user_id] ?? "Unknown";

          return (
            <div
              key={b.id}
              style={{
                background: "rgba(30,41,59,0.9)",
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.35)",
                padding: 16,
                boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {b.bracket_name}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    User: {email}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    Created: {new Date(b.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13 }}>
                    Submitted:{" "}
                    {sub?.submitted_at
                      ? new Date(sub.submitted_at).toLocaleString()
                      : "No"}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Tiebreaker: {sub?.tiebreaker ?? "—"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <button
                  onClick={() => {
                    setViewingBracket(b.id);
                    loadBracketPicks(b.id);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#1D4ED8",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  View Picks
                </button>

                <button
                  onClick={() => resetBracket(b.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#64748b",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Reset
                </button>

                <button
                  onClick={() => deleteBracket(b.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "none",
                    background: "#dc2626",
                    color: "white",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PICKS MODAL */}
      {viewingBracket !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 9999,
          }}
          onClick={() => setViewingBracket(null)}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.96)",
              padding: 20,
              borderRadius: 12,
              border: "1px solid rgba(148,163,184,0.35)",
              width: "100%",
              maxWidth: 600,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Picks for Bracket #{viewingBracket}
            </h2>

            {loadingPicks && (
              <div style={{ textAlign: "center", opacity: 0.8 }}>
                Loading picks…
              </div>
            )}

            {!loadingPicks && picks.length === 0 && (
              <div style={{ textAlign: "center", opacity: 0.8 }}>
                No picks found.
              </div>
            )}

            {!loadingPicks &&
              picks.map((p) => (
                <div
                  key={p.game_id}
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid rgba(148,163,184,0.25)",
                    fontSize: 14,
                  }}
                >
                  Game {p.game_id}: <strong>{p.selected_team}</strong>
                </div>
              ))}

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button
                onClick={() => setViewingBracket(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#1D4ED8",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
