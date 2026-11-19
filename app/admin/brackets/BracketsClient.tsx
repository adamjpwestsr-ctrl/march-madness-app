
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Bracket = {
  bracket_id: string;
  user_id: number;
  bracket_name: string;
  created_at: string | null;
  tiebreaker_score: number | null;
};

type UserRecord = {
  user_id: number;
  email: string | null;
};

type Pick = {
  bracket_id: string;
  game_id: string;
  picked_team: string | null;
  winner_team_id: string | null;
  round: number | null;
  region: string | null;
};

type BracketSummary = Bracket & {
  email: string;
  completedPicks: number;
  totalRows: number;
  remainingPicks: number;
  status: "Complete" | "Incomplete" | "Review";
};

type FilterType = "all" | "complete" | "incomplete";

const REQUIRED_PICKS = 75;
const PICK_PAGE_SIZE = 1000;

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1250,
    margin: "0 auto",
    padding: "22px 18px 40px",
    color: "#e5e7eb",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  panel: {
    background: "rgba(30,41,59,0.85)",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: 10,
    padding: 14,
  },
  button: {
    border: "none",
    borderRadius: 7,
    padding: "8px 12px",
    color: "white",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    maxWidth: 340,
    background: "#0f172a",
    border: "1px solid #475569",
    borderRadius: 7,
    color: "white",
    padding: "9px 11px",
    fontSize: 13,
    outline: "none",
  },
};

function formatDate(value: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleString();
}

export default function BracketsClient() {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [users, setUsers] = useState<Record<number, string>>({});

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const loadBrackets = async () => {
    if (!supabase) {
      setMessage("Supabase is not available.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const [
        { data: bracketRows, error: bracketError },
        { data: userRows, error: userError },
      ] = await Promise.all([
        supabase
          .from("brackets")
          .select(
            "bracket_id, user_id, bracket_name, created_at, tiebreaker_score"
          )
          .order("created_at", { ascending: false }),

        supabase.from("users").select("user_id, email"),
      ]);

      if (bracketError) throw bracketError;
      if (userError) throw userError;

      // Retrieve all bracket picks in pages so Supabase's row limit
      // cannot silently cause inaccurate completion counts.
      const allPicks: Pick[] = [];
      let offset = 0;

      while (true) {
        const { data, error } = await supabase
          .from("bracket_picks")
          .select(
            "bracket_id, game_id, picked_team, winner_team_id, round, region"
          )
          .order("bracket_id", { ascending: true })
          .order("game_id", { ascending: true })
          .range(offset, offset + PICK_PAGE_SIZE - 1);

        if (error) throw error;

        const page = (data ?? []) as Pick[];
        allPicks.push(...page);

        if (page.length < PICK_PAGE_SIZE) break;

        offset += PICK_PAGE_SIZE;
      }

      setBrackets((bracketRows ?? []) as Bracket[]);
      setPicks(allPicks);

      const userMap: Record<number, string> = {};

      ((userRows ?? []) as UserRecord[]).forEach((user) => {
        userMap[user.user_id] =
          user.email?.trim() || `User #${user.user_id}`;
      });

      setUsers(userMap);
    } catch (error) {
      console.error("Bracket management load error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load bracket information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrackets();
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaries = useMemo<BracketSummary[]>(() => {
    return brackets.map((bracket) => {
      const bracketPicks = picks.filter(
        (pick) => pick.bracket_id === bracket.bracket_id
      );

      const completedPicks = bracketPicks.filter(
        (pick) => pick.picked_team !== null
      ).length;

      const totalRows = bracketPicks.length;

      let status: BracketSummary["status"] = "Incomplete";

      if (completedPicks === REQUIRED_PICKS) {
        status = "Complete";
      } else if (completedPicks > REQUIRED_PICKS) {
        status = "Review";
      }

      return {
        ...bracket,
        email: users[bracket.user_id] ?? "",
        completedPicks,
        totalRows,
        remainingPicks: Math.max(
          0,
          REQUIRED_PICKS - completedPicks
        ),
        status,
      };
    });
  }, [brackets, picks, users]);

  const incompleteBrackets = useMemo(
    () => summaries.filter((bracket) => bracket.status === "Incomplete"),
    [summaries]
  );

  const completeCount = summaries.filter(
    (bracket) => bracket.status === "Complete"
  ).length;

  const incompleteCount = incompleteBrackets.length;

  const reviewCount = summaries.filter(
    (bracket) => bracket.status === "Review"
  ).length;

  const filteredBrackets = useMemo(() => {
    return summaries
      .filter((bracket) => {
        if (filter === "complete") return bracket.status === "Complete";
        if (filter === "incomplete") return bracket.status === "Incomplete";
        return true;
      })
      .filter((bracket) => {
        const term = search.trim().toLowerCase();

        if (!term) return true;

        return (
          bracket.bracket_name.toLowerCase().includes(term) ||
          bracket.email.toLowerCase().includes(term) ||
          String(bracket.user_id).includes(term)
        );
      })
      .sort((a, b) => {
        // Incomplete brackets first in the All view.
        if (filter === "all") {
          if (a.status === "Incomplete" && b.status !== "Incomplete") {
            return -1;
          }

          if (b.status === "Incomplete" && a.status !== "Incomplete") {
            return 1;
          }
        }

        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
      });
  }, [summaries, filter, search]);

  const resetBracket = async (bracketId: string) => {
    if (
      !confirm(
        "Reset all saved picks for this bracket? This cannot be undone."
      )
    ) {
      return;
    }

    if (!supabase) return;

    const { error } = await supabase
      .from("bracket_picks")
      .delete()
      .eq("bracket_id", bracketId);

    if (error) {
      alert(`Unable to reset bracket: ${error.message}`);
      return;
    }

    alert("Bracket picks have been reset.");
    await loadBrackets();
  };

  const deleteBracket = async (bracketId: string) => {
    if (
      !confirm(
        "Permanently delete this bracket and all of its saved picks? This cannot be undone."
      )
    ) {
      return;
    }

    if (!supabase) return;

    // Delete picks explicitly, then delete the bracket.
    const { error: picksError } = await supabase
      .from("bracket_picks")
      .delete()
      .eq("bracket_id", bracketId);

    if (picksError) {
      alert(`Unable to delete bracket picks: ${picksError.message}`);
      return;
    }

    const { error: bracketError } = await supabase
      .from("brackets")
      .delete()
      .eq("bracket_id", bracketId);

    if (bracketError) {
      alert(`Unable to delete bracket: ${bracketError.message}`);
      return;
    }

    alert("Bracket deleted.");
    await loadBrackets();
  };

  const getIncompleteEmails = () => {
    return Array.from(
      new Set(
        incompleteBrackets
          .map((bracket) => bracket.email.trim())
          .filter(
            (email) =>
              email &&
              email !== "Unknown" &&
              email.includes("@")
          )
      )
    );
  };

  const copyIncompleteEmails = async () => {
    const emails = getIncompleteEmails();

    if (emails.length === 0) {
      alert("No valid email addresses found for incomplete brackets.");
      return;
    }

    try {
      await navigator.clipboard.writeText(emails.join("; "));
      setMessage(
        `Copied ${emails.length} incomplete participant email address(es).`
      );
    } catch (error) {
      console.error("Clipboard error:", error);
      alert(
        "Unable to copy emails. Please check browser clipboard permissions."
      );
    }
  };
 
  const openIncompleteEmail = () => {
    const emails = getIncompleteEmails();

    if (emails.length === 0) {
      alert("No valid email addresses found for incomplete brackets.");
      return;
    }

    const subject =
      "🏀 Your Bracket Isn't Finished... And There's Money on the Line!";

    const body =
      "Hey BracketBoss!\n\n" +
      "Your March Madness bracket is still incomplete!\n\n" +
      "Here's the deal: You can't win the money if you don't complete your bracket! 💰\n\n" +
      "Don't sit on the sidelines while everyone else battles it out. Head back to BracketBoss, finish your picks, and give yourself a shot at the prize!\n\n" +
      "https://bracketboss-theta.vercel.app/sports/march-madness-v2\n\n" +
      "The clock is ticking. Get those picks in!\n\n" +
      "Good luck, and may your bracket survive the madness!\n\n" +
      "The BracketBoss Team 🏆";

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1` +
      `&bcc=${encodeURIComponent(emails.join(","))}` +
      `&su=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  const statusStyle = (status: BracketSummary["status"]) => {
    if (status === "Complete") {
      return {
        color: "#86efac",
        background: "rgba(22,163,74,0.15)",
      };
    }

    if (status === "Review") {
      return {
        color: "#fca5a5",
        background: "rgba(220,38,38,0.15)",
      };
    }

    return {
      color: "#fcd34d",
      background: "rgba(217,119,6,0.15)",
    };
  };

  return (
    <div style={styles.page}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <h1
          style={{
            fontSize: 25,
            fontWeight: 800,
            margin: 0,
          }}
        >
          Admin · Bracket Management
        </h1>

        <button
          onClick={loadBrackets}
          disabled={loading}
          style={{
            ...styles.button,
            background: "#334155",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(125px, 1fr))",
          gap: 9,
          marginBottom: 14,
        }}
      >
        {[
          {
            label: "Total Brackets",
            value: summaries.length,
            color: "#f8fafc",
          },
          {
            label: "Complete",
            value: completeCount,
            color: "#86efac",
          },
          {
            label: "Incomplete",
            value: incompleteCount,
            color: "#fcd34d",
          },
          {
            label: "Needs Review",
            value: reviewCount,
            color: "#fca5a5",
          },
        ].map((item) => (
          <div key={item.label} style={styles.panel}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: item.color,
              }}
            >
              {item.value}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS AND SEARCH */}
      <div
        style={{
          ...styles.panel,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(
            [
              ["all", `All (${summaries.length})`],
              ["complete", `Complete (${completeCount})`],
              ["incomplete", `Incomplete (${incompleteCount})`],
            ] as [FilterType, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                ...styles.button,
                background:
                  filter === value ? "#1d4ed8" : "#334155",
                border:
                  value === "incomplete"
                    ? "1px solid rgba(245,158,11,0.5)"
                    : "1px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search bracket or participant..."
          style={styles.input}
        />
      </div>

      {/* INCOMPLETE EMAIL ACTIONS */}
      {incompleteCount > 0 && (
        <div
          style={{
            ...styles.panel,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
            borderColor: "rgba(217,119,6,0.45)",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#fcd34d",
              }}
            >
              Incomplete Bracket Reminders
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#cbd5e1",
                marginTop: 3,
              }}
            >
              {incompleteCount} participant(s) have not completed all 75 picks.
              Email addresses will be placed in BCC.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={copyIncompleteEmails}
              style={{
                ...styles.button,
                background: "#475569",
              }}
            >
              Copy Incomplete Emails
            </button>

            <button
              onClick={openIncompleteEmail}
              style={{
                ...styles.button,
                background: "#047857",
              }}
            >
              Open Email (BCC)
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            background: "rgba(30,64,175,0.2)",
            color: "#bfdbfe",
            fontSize: 12,
          }}
        >
          {message}
        </div>
      )}

      {/* BRACKET LIST */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 35, color: "#94a3b8" }}>
          Loading brackets...
        </div>
      ) : filteredBrackets.length === 0 ? (
        <div
          style={{
            ...styles.panel,
            textAlign: "center",
            color: "#94a3b8",
            padding: 25,
          }}
        >
          No brackets match this filter.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {filteredBrackets.map((bracket) => {
            const status = statusStyle(bracket.status);

            return (
              <div
                key={bracket.bracket_id}
                style={{
                  ...styles.panel,
                  padding: "11px 13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 210, flex: "1 1 260px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong style={{ fontSize: 14 }}>
                      {bracket.bracket_name}
                    </strong>

                    <span
                      style={{
                        ...status,
                        borderRadius: 20,
                        padding: "3px 8px",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {bracket.status}
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#cbd5e1",
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {bracket.email || `User #${bracket.user_id}`}
                  </div>

                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: 10,
                      marginTop: 2,
                    }}
                  >
                    Created: {formatDate(bracket.created_at)}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: 115,
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color:
                        bracket.status === "Complete"
                          ? "#86efac"
                          : bracket.status === "Review"
                            ? "#fca5a5"
                            : "#fcd34d",
                    }}
                  >
                    {bracket.completedPicks} / {REQUIRED_PICKS}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: "#94a3b8",
                    }}
                  >
                    {bracket.status === "Complete"
                      ? "Picks completed"
                      : bracket.status === "Review"
                        ? `${bracket.totalRows} saved rows`
                        : `${bracket.remainingPicks} remaining`}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: "#94a3b8",
                      marginTop: 3,
                    }}
                  >
                    Tiebreaker: {bracket.tiebreaker_score ?? "—"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href={`/sports/march-madness-v2/bracket/view/${bracket.bracket_id}`}
                    style={{
                      ...styles.button,
                      display: "inline-flex",
                      alignItems: "center",
                      textDecoration: "none",
                      background: "#1d4ed8",
                    }}
                  >
                    View Bracket
                  </Link>

                  <button
                    onClick={() => resetBracket(bracket.bracket_id)}
                    style={{
                      ...styles.button,
                      background: "#64748b",
                    }}
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => deleteBracket(bracket.bracket_id)}
                    style={{
                      ...styles.button,
                      background: "#dc2626",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
