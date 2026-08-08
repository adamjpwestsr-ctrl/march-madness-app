import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

/**
 * Commissioner approval endpoint
 * Called when commissioner approves a pending user.
 *
 * Expects JSON:
 * {
 *   "email": "user@example.com"
 * }
 */
export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();
    const email = body?.email?.toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { status: "missingEmail", message: "Email is required." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { status: "alreadyExists", message: "User already approved." },
        { status: 200 }
      );
    }

    // Create Supabase Auth user (password required internally but never used)
    const tempPassword = crypto.randomUUID();

    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: tempPassword, // internal-only, never used by your app
      });

    if (authError) {
      console.error("Auth admin createUser error:", authError);
      return NextResponse.json(
        { status: "authError", message: authError.message },
        { status: 500 }
      );
    }

    // Insert into your users table
    const { error: insertError } = await supabase.from("users").insert({
      email,
      auth_id: authUser.user.id, // Supabase Auth user ID
      is_active: true,
      is_admin: false,
    });

    if (insertError) {
      console.error("DB insert error:", insertError);
      return NextResponse.json(
        { status: "dbError", message: insertError.message },
        { status: 500 }
      );
    }

    // Remove from pending approvals
    await supabase.from("pending_users").delete().eq("email", email);

    // Log approval event
    await supabase.from("logs").insert({
      event: "user_approved",
      detail: `Commissioner approved ${email}`,
      user_email: email,
    });

    return NextResponse.json(
      {
        status: "success",
        message: `User ${email} approved successfully.`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Unexpected approval error:", err);
    return NextResponse.json(
      { status: "error", message: "Unexpected server error." },
      { status: 500 }
    );
  }
}
