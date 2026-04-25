import { useMemo } from "react";
import { WEEKLY_THEMES, WeeklyTheme, WeeklyThemeId } from "./weeklyThemes";

type UseWeeklyThemeArgs = {
  overrideThemeId?: WeeklyThemeId | null;
  weekStart: string; // "YYYY-MM-DD"
};

export function useWeeklyTheme({ overrideThemeId, weekStart }: UseWeeklyThemeArgs): WeeklyTheme {
  return useMemo(() => {
    if (overrideThemeId) {
      return WEEKLY_THEMES[overrideThemeId] ?? WEEKLY_THEMES[WeeklyThemeId.DEFAULT];
    }

    // 🔹 Placeholder auto-logic: you can expand this later
    const month = new Date(weekStart).getMonth() + 1;

    if (month === 3) return WEEKLY_THEMES[WeeklyThemeId.MARCH_MADNESS];
    if (month === 4) return WEEKLY_THEMES[WeeklyThemeId.NFL_DRAFT];
    if (month === 6) return WEEKLY_THEMES[WeeklyThemeId.NBA_PLAYOFFS];
    if (month === 7) return WEEKLY_THEMES[WeeklyThemeId.OLYMPICS];
    if (month === 8) return WEEKLY_THEMES[WeeklyThemeId.MLB_OPENING_DAY];

    return WEEKLY_THEMES[WeeklyThemeId.DEFAULT];
  }, [overrideThemeId, weekStart]);
}
