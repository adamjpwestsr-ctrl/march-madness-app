export enum WeeklyThemeId {
  NFL_DRAFT = "NFL_DRAFT",
  NBA_PLAYOFFS = "NBA_PLAYOFFS",
  MARCH_MADNESS = "MARCH_MADNESS",
  MLB_OPENING_DAY = "MLB_OPENING_DAY",
  GOLF_MAJOR = "GOLF_MAJOR",
  RIVALRY_WEEK = "RIVALRY_WEEK",
  OLYMPICS = "OLYMPICS",
  THROWBACK_90S = "THROWBACK_90S",
  DEFAULT = "DEFAULT",
}

export type WeeklyTheme = {
  id: WeeklyThemeId;
  label: string;
  emoji: string;
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
};

export const WEEKLY_THEMES: Record<WeeklyThemeId, WeeklyTheme> = {
  [WeeklyThemeId.NFL_DRAFT]: {
    id: WeeklyThemeId.NFL_DRAFT,
    label: "NFL Draft Week",
    emoji: "🏈",
    primary: "#0f172a",
    secondary: "#022c22",
    accent: "#22c55e",
    gradient: "linear-gradient(135deg, #022c22, #0f172a)",
  },
  [WeeklyThemeId.NBA_PLAYOFFS]: {
    id: WeeklyThemeId.NBA_PLAYOFFS,
    label: "NBA Playoffs",
    emoji: "🏀",
    primary: "#020617",
    secondary: "#1d1b4c",
    accent: "#f97316",
    gradient: "linear-gradient(135deg, #1d1b4c, #020617)",
  },
  [WeeklyThemeId.MARCH_MADNESS]: {
    id: WeeklyThemeId.MARCH_MADNESS,
    label: "March Madness",
    emoji: "🏀",
    primary: "#020617",
    secondary: "#0b1120",
    accent: "#38bdf8",
    gradient: "linear-gradient(135deg, #0b1120, #020617)",
  },
  [WeeklyThemeId.MLB_OPENING_DAY]: {
    id: WeeklyThemeId.MLB_OPENING_DAY,
    label: "MLB Opening Day",
    emoji: "⚾️",
    primary: "#020617",
    secondary: "#111827",
    accent: "#3b82f6",
    gradient: "linear-gradient(135deg, #111827, #020617)",
  },
  [WeeklyThemeId.GOLF_MAJOR]: {
    id: WeeklyThemeId.GOLF_MAJOR,
    label: "Golf Major Week",
    emoji: "⛳️",
    primary: "#022c22",
    secondary: "#064e3b",
    accent: "#a3e635",
    gradient: "linear-gradient(135deg, #064e3b, #022c22)",
  },
  [WeeklyThemeId.RIVALRY_WEEK]: {
    id: WeeklyThemeId.RIVALRY_WEEK,
    label: "Rivalry Week",
    emoji: "🔥",
    primary: "#111827",
    secondary: "#450a0a",
    accent: "#f97316",
    gradient: "linear-gradient(135deg, #450a0a, #111827)",
  },
  [WeeklyThemeId.OLYMPICS]: {
    id: WeeklyThemeId.OLYMPICS,
    label: "Olympics Week",
    emoji: "🏅",
    primary: "#020617",
    secondary: "#0f172a",
    accent: "#eab308",
    gradient: "linear-gradient(135deg, #0f172a, #020617)",
  },
  [WeeklyThemeId.THROWBACK_90S]: {
    id: WeeklyThemeId.THROWBACK_90S,
    label: "90s Throwback Week",
    emoji: "📼",
    primary: "#020617",
    secondary: "#4c1d95",
    accent: "#ec4899",
    gradient: "linear-gradient(135deg, #4c1d95, #020617)",
  },
  [WeeklyThemeId.DEFAULT]: {
    id: WeeklyThemeId.DEFAULT,
    label: "Weekly Challenge",
    emoji: "🏆",
    primary: "#020617",
    secondary: "#0f172a",
    accent: "#22c55e",
    gradient: "linear-gradient(135deg, #0f172a, #020617)",
  },
};
