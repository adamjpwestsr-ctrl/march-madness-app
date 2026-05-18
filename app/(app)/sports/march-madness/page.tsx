// app/(app)/sports/march-madness/page.tsx
import { createClient } from "@/utils/supabase/server";
import BracketPage from "./BracketPage";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await createClient();

  // AUTH
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check for existing bracket
  const { data: existing } = await supabase
    .from("brackets")
    .select("bracket_id")
    .eq("user_id", user.id)
    .eq("sport", "march-madness")
    .limit(1)
    .maybeSingle(); // FIXED

  let bracketId = existing?.bracket_id;

  // Create new bracket if none exists
  if (!bracketId) {
    const { data: created, error } = await supabase
      .from("brackets")
      .insert({
        user_id: user.id,
        sport: "march-madness",
      })
      .select("bracket_id")
      .maybeSingle(); // FIXED

    if (error) {
      console.error("Failed to create bracket:", error.message);
      throw new Error("Could not create bracket");
    }

    bracketId = created?.bracket_id;
  }

  return <BracketPage bracketId={bracketId} />;
}
