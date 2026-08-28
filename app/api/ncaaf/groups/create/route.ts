import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await req.json();

  const { name, scope, maxEntries, isPaid, passcode, email } = body;

  if (!email || !name || !scope || !passcode) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // Ensure user exists
  let { data: user } = await supabase
    .from("ncaaf_users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!user) {
    const { data: newUser } = await supabase
      .from("ncaaf_users")
      .insert({ email })
      .select()
      .single();

    user = newUser;
  }

  // Create group
  const { data: group, error } = await supabase
    .from("ncaaf_groups")
    .insert({
      name,
      scope,
      max_entries: maxEntries,
      is_paid: isPaid,
      passcode,
      created_by_email: email,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create group." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    group,
  });
}
