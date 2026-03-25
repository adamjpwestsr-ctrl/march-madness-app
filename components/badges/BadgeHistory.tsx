"use client";

import React from "react";

type HistoryItem = {
  label: string;
  round: string;
  timestamp?: string;
};

type BadgeHistoryProps = {
  history: HistoryItem[];
};

export default function BadgeHistory({ history }: BadgeHistoryProps) {
  if (!history || history.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        Badge Timeline
      </div>
      <div style={{ borderLeft: "1px solid rgba(148,163,184,0.5)", paddingLeft: 10 }}>
        {history.map((h, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 10,
              position: "relative",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#38bdf8",
                position: "absolute",
                left: -14,
                top: 4,
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 500 }}>{h.label}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{h.round}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
