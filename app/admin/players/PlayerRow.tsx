"use client";

import { useTransition } from "react";
import { toggleActive, togglePaid } from "./actions";

interface PlayerRowProps {
  row: {
    id: number;
    user_id: number;
    contest_id: string;
    is_active: boolean;
    has_paid: boolean;
    paid_at: string | null;
    email: string;
    contest_name: string;
    sport: string;
  };
}

export default function PlayerRow({ row }: PlayerRowProps) {
  const [isPending, startTransition] = useTransition();

  const onToggleActive = () => {
    startTransition(() => toggleActive(row.id));
  };

  const onTogglePaid = () => {
    startTransition(() => togglePaid(row.id));
  };

  const viewUrl =
    row.sport === "march_madness"
      ? "/bracket"
      : row.sport === "nfl_weekly"
      ? "/sports/nfl/weekly"
      : row.sport === "golf_weekly"
      ? "/sports/golf/weekly"
      : row.sport === "nhl_playoffs"
      ? "/sports/nhl/playoffs"
      : row.sport === "mlb_postseason"
      ? "/sports/mlb/postseason"
      : "#";

  return (
    <tr style={{ borderBottom: "1px solid #334155" }}>
      <td style={{ padding: "12px 0" }}>{row.email}</td>
      <td style={{ padding: "12px 0" }}>{row.contest_name}</td>

      <td style={{ padding: "12px 0" }}>
        <button
          onClick={onToggleActive}
          disabled={isPending}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: row.is_active ? "#059669" : "#475569",
            color: "white",
            cursor: "pointer",
            opacity: isPending ? 0.5 : 1,
          }}
        >
          {row.is_active ? "Active" : "Inactive"}
        </button>
      </td>

      <td style={{ padding: "12px 0" }}>
        <button
          onClick={onTogglePaid}
          disabled={isPending}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: row.has_paid ? "#2563eb" : "#475569",
            color: "white",
            cursor: "pointer",
            opacity: isPending ? 0.5 : 1,
          }}
        >
          {row.has_paid ? "Paid" : "Unpaid"}
        </button>
      </td>

      <td style={{ padding: "12px 0" }}>
        <a
          href={viewUrl}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            background: "#334155",
            color: "white",
            textDecoration: "none",
          }}
        >
          View
        </a>
      </td>
    </tr>
  );
}
