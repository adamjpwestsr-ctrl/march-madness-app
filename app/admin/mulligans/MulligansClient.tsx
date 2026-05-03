"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type MulliganRequest = {
  id: number;
  user_id: string;
  bracket_id: number;
  game_id: number;
  original_team: string | null;
  replacement_team: string;
  status: "pending" | "approved" | "denied";
  created_at: string;
};

type Game = {
  game_id: number;
  source_game1: number | null;
  source_game2: number | null;
};

export default function MulligansClient() {
  const [requests, setRequests] = useState<MulliganRequest[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const { data: reqRows } = await supabase
      .from("mulligan_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(reqRows ?? []);

    const { data: gameRows } = await supabase
      .from("games")
      .select("game_id, source_game1, source_game2");

    setGames(gameRows ?? []);

    const { data: userRows } = await supabase
      .from("users")
      .select("id, email");

    const userMap: Record<string, string> = {};
    (userRows ?? []).forEach((u) => (userMap[u.id] = u.email));
    setUsers(userMap);

    setLoading(false);
  };

  const propagateReplacement = (
    bracketId: number,
    gameId: number,
    replacementTeam: string
  ) => {
    const affectedGames = games.filter(
      (g) => g.source_game1 === gameId || g.source_game2 === gameId
    );

    return affectedGames.map((g) => ({
      bracket_id: bracketId,
      game_id: g.game_id,
      selected_team: replacementTeam,
    }));
  };

  const approveRequest = async (req: MulliganRequest) => {
    if (!confirm("Approve this mulligan?")) return;

    // 1. Update the pick for the original game
    const basePick = {
      bracket_id: req.bracket_id,
      game_id: req.game_id,
      selected_team: req.replacement_team,
    };

    // 2. Propagate to future rounds
    const propagated = propagateReplacement(
      req.bracket_id,
      req.game_id,
      req.replacement_team
    );

    const allPicks = [basePick, ...propagated];

    await supabase.from("picks").upsert(allPicks, {
      onConflict: "bracket_id,game_id",
    });

    // 3. Mark request as approved
    await supabase
      .from("mulligan_requests")
      .update({ status: "approved" })
      .eq("id", req.id);

    alert("Mulligan approved.");
    loadData();
  };

  const denyRequest = async (req: MulliganRequest) => {
    if (!confirm("Deny this mulligan?")) return;

    await supabase
      .from("mulligan_requests")
      .update({ status: "denied" })
      .eq("id", req.id);

    alert("Mulligan denied.");
    loadData();
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
        Admin · Mulligan Approvals
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
        {requests.map((req) => {
          const email = users[req.user_id] ?? "Unknown";

          return (
            <div
              key={req.id}
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
                    Bracket #{req.bracket_id}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    User: {email}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>
                    Requested: {new Date(req.created_at).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13 }}>
                    Game: <strong>{req.game_id}</strong>
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Replace:{" "}
                    <strong>{req.original_team ?? "Unknown"}</strong>
                  </div>
                  <div style={{ fontSize: 13 }}>
                    With:{" "}
                    <strong style={{ color: "#16A34A" }}>
                      {req.replacement_team}
                    </strong>
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
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => approveRequest(req)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "#16A34A",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => denyRequest(req)}
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
                      Deny
                    </button>
                  </>
                )}

                {req.status !== "pending" && (
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      opacity: 0.8,
                    }}
                  >
                    Status:{" "}
                    <span
                      style={{
                        color:
                          req.status === "approved"
                            ? "#16A34A"
                            : "#dc2626",
                      }}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {requests.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              opacity: 0.8,
              marginTop: 40,
            }}
          >
            No mulligan requests found.
          </div>
        )}
      </div>
    </div>
  );
}
