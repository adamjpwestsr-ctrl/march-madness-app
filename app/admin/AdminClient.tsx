"use client";

import Link from "next/link";

export default function AdminClient({ adminEmail }: { adminEmail: string }) {
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
        Admin Dashboard
      </h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: 30,
          opacity: 0.8,
          fontSize: 14,
        }}
      >
        Logged in as <strong>{adminEmail}</strong>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
{[
  { href: "/admin/games", label: "Game Results" },
  { href: "/admin/brackets", label: "Bracket Management" },
  { href: "/admin/mulligans", label: "Mulligan Approvals" },
  { href: "/admin/users", label: "User Management" },
  { href: "/admin/tools", label: "Bracket Tools & Simulations" },
  { href: "/admin/leaderboard", label: "Leaderboard Tools" },

  // ⭐ NEW — Payout Snapshots
  { href: "/admin/snapshots", label: "Payout Snapshots" },

  { href: "/admin/forum", label: "Forum Moderation" },
  { href: "/admin/tournament-setup", label: "Tournament Setup" },
  { href: "/admin/pending-users", label: "Pending Users" },

  // ⭐ NEW — Golf Weekly Admin Tools
  { href: "/sports/golf/weekly/admin", label: "Golf Weekly — Score Entry" },
  { href: "/sports/golf/weekly/admin/metadata", label: "Golf Weekly — Tournament Metadata" },

  // ⭐ Other Sports Hub
  { href: "/sports", label: "Other Sports" },
].map((item) => (
  <Link
    key={item.href}
    href={item.href}
    style={{
      display: "block",
      padding: 20,
      background: "rgba(30,41,59,0.9)",
      borderRadius: 12,
      border: "1px solid rgba(148,163,184,0.35)",
      textDecoration: "none",
      color: "#e5e7eb",
      fontWeight: 600,
      fontSize: 16,
      textAlign: "center",
      boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
    }}
  >
    {item.label}
  </Link>
))}
      </div>
    </div>
  );
}
