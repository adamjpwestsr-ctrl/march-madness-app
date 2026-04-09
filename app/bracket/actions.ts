"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client (service role)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ⭐ CREATE BRACKET — uses email, but still fills user_id for legacy schema
export async function createBracket(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) throw new Error("Missing email");

  // Look up user_id from users table to satisfy existing brackets schema
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (userError) {
    console.error("Lookup user_id error:", userError);
    throw new Error("Failed to resolve user for bracket");
  }

  if (!user || user.user_id == null) {
    console.error("No user_id found for email:", email);
    throw new Error("User not found for bracket creation");
  }

  const { data, error } = await supabase
    .from("brackets")
    .insert({
      user_id: user.user_id, // ✅ keep DB happy
      email,                 // ✅ new world
      bracket_name: "My Bracket",
      icon: "🏀",
    })
    .select()
    .single();

  if (error) {
    console.error("Create bracket error:", error);
    throw new Error("Failed to create bracket");
  }

  redirect(`/bracket?bid=${data.bracket_id}`);
}

// ⭐ DELETE BRACKET
export async function deleteBracket(formData: FormData) {
  const bracketId = formData.get("bracketId");
  if (!bracketId) return;

  await supabase.from("brackets").delete().eq("bracket_id", bracketId);
}

// ⭐ RENAME BRACKET — checks email via session for safety
export async function renameBracket(formData: FormData) {
  const bracketId = formData.get("bracketId");
  const newName = formData.get("newName");

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie) throw new Error("Not logged in");

  const session = JSON.parse(sessionCookie.value);
  const email = session.email?.toLowerCase();
  if (!email) throw new Error("Missing email in session");

  await supabase
    .from("brackets")
    .update({ bracket_name: newName })
    .eq("bracket_id", bracketId)
    .eq("email", email);
}

// ⭐ UPDATE BRACKET ICON — checks email via session for safety
export async function updateBracketIcon(formData: FormData) {
  const bracketId = formData.get("bracketId");
  const icon = formData.get("icon");

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie) throw new Error("Not logged in");

  const session = JSON.parse(sessionCookie.value);
  const email = session.email?.toLowerCase();
  if (!email) throw new Error("Missing email in session");

  await supabase
    .from("brackets")
    .update({ icon })
    .eq("bracket_id", bracketId)
    .eq("email", email);
}
// ⭐ SUBMIT BRACKET
export async function submitBracket(formData: FormData) {
  const bracketId = formData.get("bracketId")?.toString();
  const tiebreaker = Number(formData.get("tiebreaker") ?? 0);

  if (!bracketId) throw new Error("Missing bracketId");

  await supabase.from("bracket_submissions").upsert({
    bracket_id: bracketId,
    tiebreaker,
    submitted_at: new Date().toISOString(),
    mulligans_used: 0,
  });

  // Optional: redirect back to bracket page
  redirect(`/bracket?bid=${bracketId}`);
}
