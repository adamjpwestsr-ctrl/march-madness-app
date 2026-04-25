export enum WeeklyThemeId {
  DEFAULT = "default",
  MARCH_MADNESS = "march_madness",
  NFL_DRAFT = "nfl_draft",
  NBA_PLAYOFFS = "nba_playoffs",
  OLYMPICS = "olympics",
  MLB_OPENING_DAY = "mlb_opening_day",
}

export interface WeeklyTheme {
  id: WeeklyThemeId;
  emoji: string;
  title: string;
  description: string;
}

export const WEEKLY_THEMES: Record<WeeklyThemeId, WeeklyTheme> = {
  [WeeklyThemeId.DEFAULT]: {
    id: WeeklyThemeId.DEFAULT,
    emoji: "⭐",
    title: "Weekly Challenge",
    description: "A new set of 10 questions every week.",
  },
  [WeeklyThemeId.MARCH_MADNESS]: {
    id: WeeklyThemeId.MARCH_MADNESS,
    emoji: "🏀",
    title: "March Madness",
    description: "College hoops trivia all month long.",
  },
  [WeeklyThemeId.NFL_DRAFT]: {
    id: WeeklyThemeId.NFL_DRAFT,
    emoji: "🏈",
    title: "NFL Draft Week",
    description: "Prospects, picks, and draft history.",
  },
  [WeeklyThemeId.NBA_PLAYOFFS]: {
    id: WeeklyThemeId.NBA_PLAYOFFS,
    emoji: "🔥",
    title: "NBA Playoffs",
    description: "Legends are made in the postseason.",
  },
  [WeeklyThemeId.OLYMPICS]: {
    id: WeeklyThemeId.OLYMPICS,
    emoji: "🏅",
    title: "Olympics Week",
    description: "Global competition and iconic moments.",
  },
  [WeeklyThemeId.MLB_OPENING_DAY]: {
    id: WeeklyThemeId.MLB_OPENING_DAY,
    emoji: "⚾",
    title: "MLB Opening Day",
    description: "Baseball returns — trivia edition.",
  },
};
