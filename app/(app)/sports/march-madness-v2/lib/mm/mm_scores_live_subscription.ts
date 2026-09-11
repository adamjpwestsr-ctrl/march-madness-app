"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
  // Correct Supabase client for client-side usage
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
