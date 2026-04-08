"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function updateAdminCode(email: string, newCode: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("users")
    .update({ admin_code: newCode })
    .eq("email", email);

  if (error) {
    console.error("Failed to update admin code:", error);
    return { status: "error" };
  }

  return { status: "success" };
}
