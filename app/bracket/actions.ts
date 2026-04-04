"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a server-side Supabase client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ⭐ CREATE BRACKET — now accepts FormData and uses email
export async function createBracket(formData: FormData) {
  const email = formData.get("email")?.toString().toLowerCase();
  if (!email) throw new Error("Missing email");

  const { data, error } = await supabase
    .from("brackets")
    .insert({
      email,
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

// ⭐ RENAME BRACKET — now checks email for safety
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

// ⭐ UPDATE BRACKET ICON — now checks email for safety
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
