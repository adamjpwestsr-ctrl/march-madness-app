"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ⭐ CREATE BRACKET — with redirect
export async function createBracket() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) throw new Error("Not logged in");

  const session = JSON.parse(sessionCookie.value);

  if (!session.userId) {
    throw new Error("Missing userId in session");
  }

  const supabase = createClient(SUPABASE_URL, ANON_KEY);

  const { data, error } = await supabase
    .from("brackets")
    .insert({
      user_id: session.userId,
      bracket_name: "My Bracket",
      icon: "🏀",
    })
    .select()
    .single();

  if (error) {
    console.error("Create bracket error:", error);
    throw new Error("Failed to create bracket");
  }

  // ⭐ Redirect to the new bracket
  redirect(`/bracket?bid=${data.bracket_id}`);
}

// ⭐ DELETE BRACKET
export async function deleteBracket(formData: FormData) {
  const bracketId = formData.get("bracketId");

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  await supabase.from("brackets").delete().eq("bracket_id", bracketId);
}

// ⭐ RENAME BRACKET
export async function renameBracket(formData: FormData) {
  const bracketId = formData.get("bracketId");
  const newName = formData.get("newName");

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  await supabase
    .from("brackets")
    .update({ bracket_name: newName })
    .eq("bracket_id", bracketId);
}

// ⭐ UPDATE BRACKET ICON
export async function updateBracketIcon(formData: FormData) {
  const bracketId = formData.get("bracketId");
  const icon = formData.get("icon");

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  await supabase
    .from("brackets")
    .update({ icon })
    .eq("bracket_id", bracketId);
}
