// app/api/admin/approve-user/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email, is_admin } = await req.json();
  const lower = String(email || "").toLowerCase().trim();

  if (!lower) {
    return NextResponse.json({ status: "error", message: "Email required" }, { status: 400 });
  }

  // 1) Add to users table
  const { error: userError } = await supabaseAdmin
    .from("users")
    .upsert({ email: lower, is_admin: !!is_admin });

  if (userError) {
    console.error(userError);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  // 2) Remove from pending_users
  await supabaseAdmin.from("pending_users").delete().eq("email", lower);

  // 3) Send magic link ONLY for non-admins
  if (!is_admin) {
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(lower);
    if (inviteError) {
      console.error(inviteError);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }
  }

  return NextResponse.json({ status: "ok" });
}
