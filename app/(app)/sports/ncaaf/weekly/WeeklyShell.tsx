"use client";

import { useEffect, useState } from "react";
import WeeklyClient from "./WeeklyClient";
import ChallengeEntry from "@/components/ncaaf/ChallengeEntry";

type Props = any;

export default function WeeklyShell(props: Props) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"GLOBAL" | "GROUP" | null>(null);
  const [groupCode, setGroupCode] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const raw = document.cookie
      .split("; ")
      .find((r) => r.startsWith("ncaaf_user="))
      ?.split("=")[1];

    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        setEmail(parsed.email);
      } catch {
        setEmail(null);
      }
    }
  }, []);

  if (!ready || !email || !mode) {
    return (
      <ChallengeEntry
        onComplete={({ email, mode, groupCode }) => {
          setEmail(email);
          setMode(mode);
          setGroupCode(groupCode);
          setReady(true);
        }}
      />
    );
  }

  return (
    <WeeklyClient
      {...props}
      userEmail={email}
      mode={mode}
      groupCode={groupCode}
    />
  );
}
