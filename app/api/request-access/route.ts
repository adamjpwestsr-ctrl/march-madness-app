// app/api/request-access/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { email } = await req.json();
  const lower = String(email || "").toLowerCase().trim();

  if (!lower) {
    return NextResponse.json({ status: "error", message: "Email required" }, { status: 400 });
  }

  // 1) Check if user exists in your users table
  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("is_admin")
    .eq("email", lower)
    .maybeSingle();

  if (userError) {
    console.error(userError);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  // ADMIN: no magic link, go to admin code flow
  if (user?.is_admin) {
    return NextResponse.json({ status: "admin" });
  }

  // APPROVED PLAYER: send magic link now
  if (user && !user.is_admin) {
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(lower);
    if (inviteError) {
      console.error(inviteError);
      return NextResponse.json({ status: "error" }, { status: 500 });
    }
    return NextResponse.json({ status: "magicLinkSent" });
  }

  // NOT FOUND: ensure pending_users row
  const { error: pendingError } = await supabaseAdmin
    .from("pending_users")
    .upsert({ email: lower, status: "pending" });

  if (pendingError) {
    console.error(pendingError);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }

  return NextResponse.json({ status: "pending" });
}
