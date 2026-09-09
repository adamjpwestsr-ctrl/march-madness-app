"use client";

import { useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Live subscription to mm_scores table.
 * Calls onUpdate whenever scores change (insert/update/delete).
 */
export function useLiveScores({
  seasonYear,
  groupId,
  onUpdate,
}: {
  seasonYear: number;
  groupId: string | null;
  onUpdate: (scores: any[]) => void;
}) {
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial load
    const loadScores = async () => {
      const { data } = await supabase
        .from("mm_scores")
        .select("*")
        .eq("season_year", seasonYear)
        .eq("group_id", groupId);

      if (data) onUpdate(data);
    };

    loadScores();

    // Live subscription
    const channel = supabase
      .channel(`mm_scores_${seasonYear}_${groupId || "global"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mm_scores",
          filter: `season_year=eq.${seasonYear}`,
        },
        async () => {
          const { data } = await supabase
            .from("mm_scores")
            .select("*")
            .eq("season_year", seasonYear)
            .eq("group_id", groupId);

          if (data) onUpdate(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [seasonYear, groupId]);
}
