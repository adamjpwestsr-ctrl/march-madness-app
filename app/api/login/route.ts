import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
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
      const { data: newAdmin } = await supabase
        .from("users")
        .insert({
          email: normalizedEmail,
          is_admin: true,
        })
        .select()
        .single();

      adminUser = newAdmin;
    }

    const adminSession = {
      userId: adminUser!.user_id,
      email: normalizedEmail,
      isAdmin: true,
    };

    // ⭐ Edge-safe cookie write with Vercel preview domain
    const res = NextResponse.json({ status: "admin" });
    res.cookies.set("mm_session", JSON.stringify(adminSession), {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
      domain: ".vercel.app", // ⭐ REQUIRED FOR PREVIEW URL COOKIES
    });

    return res;
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

  const userSession = {
    userId: user.user_id,
    email: user.email,
    isAdmin: !!user.is_admin,
  };

  // ⭐ Edge-safe cookie write with Vercel preview domain
  const res = NextResponse.json({
    status: "ok",
    isAdmin: !!user.is_admin,
  });

  res.cookies.set("mm_session", JSON.stringify(userSession), {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    domain: ".vercel.app", // ⭐ REQUIRED FOR PREVIEW URL COOKIES
  });

  return res;
}
