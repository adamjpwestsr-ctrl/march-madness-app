"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

export async function createBracket() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie) redirect("/login");

  const session = JSON.parse(sessionCookie.value);
  const email = session.email;

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("brackets")
    .insert({
      email,
      bracket_name: "My Bracket",
      icon: "🏀",
    })
    .select("bracket_id")
    .single();

  if (error) {
    console.error("Create bracket error:", error);
    return;
  }

  redirect(`/bracket?bid=${data.bracket_id}`);
}

export async function deleteBracket(formData: FormData) {
  const bracketId = formData.get("bracketId") as string;

  const supabase = getSupabase();

  await supabase.from("picks").delete().eq("bracket_id", bracketId);
  await supabase.from("bracket_submissions").delete().eq("bracket_id", bracketId);
  await supabase.from("brackets").delete().eq("bracket_id", bracketId);

  redirect("/bracket");
}

export async function renameBracket(formData: FormData) {
  const bracketId = formData.get("bracketId") as string;
  const newName = formData.get("newName") as string;

  const supabase = getSupabase();

  await supabase
    .from("brackets")
    .update({ bracket_name: newName })
    .eq("bracket_id", bracketId);

  redirect(`/bracket?bid=${bracketId}`);
}

export async function updateBracketIcon(formData: FormData) {
  const bracketId = formData.get("bracketId") as string;
  const icon = formData.get("icon") as string;

  const supabase = getSupabase();

  await supabase
    .from("brackets")
    .update({ icon })
    .eq("bracket_id", bracketId);

  redirect(`/bracket?bid=${bracketId}`);
}
