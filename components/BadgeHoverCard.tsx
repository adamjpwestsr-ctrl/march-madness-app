"use client";

import React, { useState } from "react";

export default function BadgeHoverCard({
  icon,
  title,
  description,
  value,
}: {
  icon: string;
  title: string;
  description: string;
  value?: string | number | boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={{ cursor: "pointer" }}>{icon}</span>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "28px",
            left: "0",
            zIndex: 50,
            background: "var(--card-bg, #111)",
            color: "white",
            padding: "10px 12px",
            borderRadius: "8px",
            width: "220px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
            animation: "fadeScale 0.15s ease-out",
          }}
        >
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>
            {icon} {title}
          </div>
          <div style={{ fontSize: "14px", opacity: 0.85 }}>
            {description}
          </div>
          {value !== undefined && (
            <div style={{ marginTop: "6px", fontSize: "13px", opacity: 0.9 }}>
              <strong>Value:</strong> {String(value)}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
