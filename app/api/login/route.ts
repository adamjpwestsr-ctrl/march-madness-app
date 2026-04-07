import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // Prevent caching
export const runtime = "edge";

const ADMINS = ["adamjpwestsr@gmail.com", "lfahearn@gmail.com"];

export async function POST(req: Request) {
  const { email, adminCode } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // -----------------------------
  // ADMIN LOGIN FLOW
  // -----------------------------
  if (ADMINS.includes(normalizedEmail)) {
    if (!adminCode) {
      return NextResponse.json({ status: "needsAdminCode" });
    }

    if (adminCode !== "1234") {
      return NextResponse.json({ status: "invalidAdminCode" });
    }

    let { data: adminUser } = await supabase
      .from("users")
      .select("user_id, email, is_admin")
      .ilike("email", normalizedEmail)
      .single();

    if (!adminUser) {
      const { data: newAdmin, error: newAdminErr } = await supabase
        .from("users")
        .insert({
          email: normalizedEmail,
          is_admin: true,
        })
        .select()
        .single();

      if (newAdminErr) {
        console.error("Admin creation error:", newAdminErr);
        return NextResponse.json({ status: "error" });
      }

      adminUser = newAdmin;
    }

    // ⭐ MOBILE‑SAFE COOKIE
    const cookieStore = await cookies();
    cookieStore.set(
      "mm_session",
      JSON.stringify({
        userId: adminUser!.user_id,
        email: normalizedEmail,
        isAdmin: true,
      }),
      {
        httpOnly: true,
        sameSite: "none", // ⭐ REQUIRED for mobile
        secure: true,     // ⭐ REQUIRED for HTTPS (Vercel)
        path: "/",
      }
    );

    return NextResponse.json({ status: "admin" });
  }

  // -----------------------------
  // NORMAL USER LOGIN FLOW
  // -----------------------------
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("email", normalizedEmail)
    .single();

  if (!user) {
    await supabase.from("access_requests").insert({ email: normalizedEmail });
    return NextResponse.json({ status: "requested" });
  }

  // ⭐ MOBILE‑SAFE COOKIE
  const cookieStore = await cookies();
  cookieStore.set(
    "mm_session",
    JSON.stringify({
      userId: user.user_id,
      email: user.email,
      isAdmin: !!user.is_admin,
    }),
    {
      httpOnly: true,
      sameSite: "none", // ⭐ REQUIRED
      secure: true,     // ⭐ REQUIRED
      path: "/",
    }
  );

  return NextResponse.json({
    status: "ok",
    isAdmin: !!user.is_admin,
  });
}
