"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function approveUser(email: string) {
  const supabase = await createSupabaseServerClient();

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return res.json();
}

export async function denyUser(email: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("pending_users")
    .delete()
    .eq("email", email);

  if (error) return { status: "error" };

  return { status: "success" };
}
