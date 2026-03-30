"use client";

import Link from "next/link";

type AdminClientProps = {
  session: {
    userId: string;
    email: string;
  } | null;
};

export default function AdminClient({ session }: AdminClientProps) {
  return (
    <div style={{ padding: 24, color: "#e5e7eb" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        Admin Dashboard
      </h1>

      {!session && (
        <p style={{ color: "#f87171", marginBottom: 20 }}>
          You must be logged in to access admin tools.
        </p>
      )}

      {session && (
        <p style={{ marginBottom: 20, color: "#94a3b8" }}>
          Logged in as <strong>{session.email}</strong>
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link
          href="/admin/set-winners"
          style={{
            padding: 12,
            background: "#1e293b",
            borderRadius: 8,
            border: "1px solid #334155",
            color: "white",
            textDecoration: "none",
          }}
        >
          Set Game Winners
        </Link>

        <Link
          href="/admin/edit-bracket"
          style={{
            padding: 12,
            background: "#1e293b",
            borderRadius: 8,
            border: "1px solid #334155",
            color: "white",
            textDecoration: "none",
          }}
        >
          Edit User Brackets
        </Link>

        <Link
          href="/admin/mulligans"
          style={{
            padding: 12,
            background: "#1e293b",
            borderRadius: 8,
            border: "1px solid #334155",
            color: "white",
            textDecoration: "none",
          }}
        >
          Mulligan Manager
        </Link>

        <Link
          href="/admin/leaderboard"
          style={{
            padding: 12,
            background: "#1e293b",
            borderRadius: 8,
            border: "1px solid #334155",
            color: "white",
            textDecoration: "none",
          }}
        >
          Leaderboard Admin
        </Link>
      </div>
    </div>
  );
}
