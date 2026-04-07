import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"; // Prevent caching
export const runtime = "edge";

const ADMINS = ["adamjpwestsr@gmail.com", "lfahearn@gmail.com"];

export async function POST(req: Request) {
  const { email, adminCode } = await req.json();

  console.log("LOGIN REQUEST RECEIVED:", { email, adminCode });

  if (!email || typeof email !== "string") {
    console.log("LOGIN ERROR: Missing email");
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
    console.log("ADMIN LOGIN ATTEMPT:", normalizedEmail);

    if (!adminCode) {
      console.log("ADMIN CODE REQUIRED");
      return NextResponse.json({ status: "needsAdminCode" });
    }

    if (adminCode !== "1234") {
      console.log("INVALID ADMIN CODE");
      return NextResponse.json({ status: "invalidAdminCode" });
    }

    let { data: adminUser } = await supabase
      .from("users")
      .select("user_id, email, is_admin")
      .ilike("email", normalizedEmail)
      .single();

    if (!adminUser) {
      console.log("ADMIN USER NOT FOUND — CREATING NEW ADMIN");

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

    const adminSession = {
      userId: adminUser!.user_id,
      email: normalizedEmail,
      isAdmin: true,
    };

    console.log("LOGIN SET COOKIE (ADMIN):", adminSession);

    const cookieStore = await cookies();
    cookieStore.set("mm_session", JSON.stringify(adminSession), {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });

    console.log("HEADERS SENT (ADMIN):", cookieStore.getAll());

    return NextResponse.json({ status: "admin" });
  }

  // -----------------------------
  // NORMAL USER LOGIN FLOW
  // -----------------------------
  console.log("NORMAL LOGIN ATTEMPT:", normalizedEmail);

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .ilike("email", normalizedEmail)
    .single();

  if (!user) {
    console.log("USER NOT FOUND — REQUESTING ACCESS:", normalizedEmail);
    await supabase.from("access_requests").insert({ email: normalizedEmail });
    return NextResponse.json({ status: "requested" });
  }

  const userSession = {
    userId: user.user_id,
    email: user.email,
    isAdmin: !!user.is_admin,
  };

  console.log("LOGIN SET COOKIE (USER):", userSession);

  const cookieStore = await cookies();
  cookieStore.set("mm_session", JSON.stringify(userSession), {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });

  console.log("HEADERS SENT (USER):", cookieStore.getAll());

  return NextResponse.json({
    status: "ok",
    isAdmin: !!user.is_admin,
  });
}
