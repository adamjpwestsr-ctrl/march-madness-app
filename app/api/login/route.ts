import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const ADMINS = [
  "adamjpwestsr@gmail.com",
  "lfahearn@gmail.com"
];

export async function POST(req: Request) {
  const { email, adminCode } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const normalizedEmail = email.toLowerCase();

  // Commissioner auto-login
  if (ADMINS.includes(normalizedEmail)) {
    const cookieStore = await cookies();
    cookieStore.set("mm_session", JSON.stringify({
      userId: "commissioner",
      email: normalizedEmail,
      isAdmin: true
    }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production"
    });

    return NextResponse.json({ status: "admin" });
  }

  // Look up user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .single();

  // Not found → create access request
  if (!user) {
    await supabase.from("access_requests").insert({ email: normalizedEmail });
    return NextResponse.json({ status: "requested" });
  }

  // Admin but no code yet
  if (user.is_admin && !adminCode) {
    return NextResponse.json({ status: "needsAdminCode" });
  }

  // Admin wrong code
  if (user.is_admin && adminCode && adminCode !== user.admin_code) {
    return NextResponse.json({ status: "invalidAdminCode" });
  }

  // Normal user OR admin with correct code
  const cookieStore = await cookies();
  cookieStore.set("mm_session", JSON.stringify({
    userId: user.id,
    email: user.email,
    isAdmin: !!user.is_admin
  }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production"
  });

  return NextResponse.json({
    status: "ok",
    isAdmin: !!user.is_admin
  });
}
