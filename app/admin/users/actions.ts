"use server";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function toggleActive(formData: FormData) {
  const userId = Number(formData.get("userId"));

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  await supabase.rpc("toggle_user_active", { input_user_id: userId });
}

export async function togglePaid(formData: FormData) {
  const userId = Number(formData.get("userId"));

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  await supabase.rpc("toggle_user_paid", { input_user_id: userId });
}
