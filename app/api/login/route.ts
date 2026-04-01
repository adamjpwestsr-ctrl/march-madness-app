import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const ADMINS = [
  "adamjpwestsr@gmail.com",
  "lfahearn@gmail.com",
];

export async function POST(req: Request) {
  const { email, adminCode } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. ADMIN EMAILS — require admin code
  if (ADMINS.includes(normalizedEmail)) {
    // If no code yet → ask for it
    if (!adminCode) {
      return NextResponse.json({ status: "needsAdminCode" });
    }

    // If wrong code → reject
    if (adminCode !== "1234") {
      return NextResponse.json({ status: "invalidAdminCode" });
    }

    // Correct code → log in as admin
    const cookieStore = await cookies();
    cookieStore.set(
      "mm_session",
      JSON.stringify({
        userId: "commissioner",
        email: normalizedEmail,
        isAdmin: true,
      }),
      {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    );

    return NextResponse.json({ status: "admin" });
  }

  // 2. LOOK UP USER IN DATABASE
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", normalizedEmail)
    .single();

  // 3. UNKNOWN USER → create access request
  if (!user) {
    await supabase.from("access_requests").insert({ email: normalizedEmail });
    return NextResponse.json({ status: "requested" });
  }

  // 4. KNOWN USER → log them in
  const cookieStore = await cookies();
  cookieStore.set(
    "mm_session",
    JSON.stringify({
      userId: user.id,
      email: user.email,
      isAdmin: !!user.is_admin,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    }
  );

  return NextResponse.json({
    status: "ok",
    isAdmin: !!user.is_admin,
  });
}
