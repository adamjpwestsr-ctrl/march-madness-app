"use client";

export type BadgeTier = "none" | "bronze" | "silver" | "gold" | "diamond";

export type TierInfo = {
  tier: BadgeTier;
  label: string;
  color: string;
};

const GOALS: Record<string, number> = {
  underdog_count: 5,
  correct_upset_count: 8,
  perfect_rounds: 6,
};

export function getBadgeGoal(key: string): number | null {
  return GOALS[key] ?? null;
}

export function getBadgeTier(key: string, value: any): TierInfo {
  const goal = getBadgeGoal(key);

  // Binary badges
  if (key === "champion_alive" || key === "still_alive_to_win") {
    if (value) {
      return { tier: "gold", label: "Gold", color: "#facc15" };
    }
    return { tier: "none", label: "None", color: "#6b7280" };
  }

  if (!goal) {
    return { tier: "none", label: "None", color: "#6b7280" };
  }

  let numeric = 0;

  if (key === "perfect_rounds" && Array.isArray(value)) {
    numeric = value.length;
  } else if (typeof value === "number") {
    numeric = value;
  }

  const ratio = numeric / goal;

  if (ratio >= 1.01) {
    return { tier: "diamond", label: "Diamond", color: "#38bdf8" };
  }
  if (ratio >= 1) {
    return { tier: "gold", label: "Gold", color: "#facc15" };
  }
  if (ratio >= 0.5) {
    return { tier: "silver", label: "Silver", color: "#e5e7eb" };
  }
  if (ratio >= 0.25) {
    return { tier: "bronze", label: "Bronze", color: "#f97316" };
  }

  return { tier: "none", label: "None", color: "#6b7280" };
}
