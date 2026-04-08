"use server";

import { createServerClient } from "@/lib/supabaseServerClient";

export async function updateAdminCode(email: string, newCode: string) {
  const supabase = createServerClient();

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
