import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function ensureAdmin(email, password) {
  // 1. Create Supabase Auth user
  const { error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError && authError.message !== "User already registered") {
    console.error(`Auth error for ${email}:`, authError);
  }

  // 2. Check if admin already exists in your users table
  const { data: existing } = await supabase
    .from("users")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();

  if (!existing) {
    // Generate next user_id
    const { data: maxRow } = await supabase
      .from("users")
      .select("user_id")
      .order("user_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextId = maxRow?.user_id ? maxRow.user_id + 1 : 1;

    // Insert admin row with valid user_id
    const { error: userError } = await supabase.from("users").insert({
      user_id: nextId,
      email,
      is_admin: true,
    });

    if (userError) {
      console.error(`Users table error for ${email}:`, userError);
    }
  }

  console.log(`Admin ensured: ${email}`);
}

await ensureAdmin("adamjpwestsr@gmail.com", "0924");
await ensureAdmin("lfahearn@gmail.com", "1234");
