"use server";

import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function updateAdminCode(email: string, newCode: string) {
  const supabase = supabaseServerClient();

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

