"use client";

import { useWeeklyTheme } from "@/app/trivia/weekly/useWeeklyTheme";
import { WeeklyThemeId } from "@/app/trivia/weekly/weeklyThemes";

type Props = {
  weekStart: string;
  overrideThemeId?: WeeklyThemeId | null;
};

export default function WeeklyThemeBanner({ weekStart, overrideThemeId = null }: Props) {
  const theme = useWeeklyTheme({ overrideThemeId, weekStart });

  const weekLabel = new Date(weekStart).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      style={{
        marginTop: 32,
        marginBottom: 24,
        padding: "18px 20px",
        borderRadius: 18,
        backgroundImage: theme.gradient,
        border: `1px solid ${theme.accent}40`,
        boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "999px",
            background: "#020617aa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          {theme.emoji}
        </div>
        <div>
          <div
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              opacity: 0.85,
            }}
          >
            Weekly Challenge
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{theme.label}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Week of {weekLabel}</div>
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          padding: "6px 12px",
          borderRadius: 999,
          border: `1px solid ${theme.accent}`,
          color: theme.accent,
          background: "#020617aa",
          whiteSpace: "nowrap",
        }}
      >
        New challenge every week
      </div>
    </div>
  );
}
