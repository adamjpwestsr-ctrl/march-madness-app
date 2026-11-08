import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if user exists
    const { data: user } = await supabase
      .from("users")
      .select("email, name")
      .eq("email", email)
      .single();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "No user found with that email.",
      });
    }

    // Initialize Resend only when the endpoint is called
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured.");
      return NextResponse.json(
        { success: false, error: "Email service is not configured." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    // Send email to commissioner
    await resend.emails.send({
      from: "BracketBoss <no-reply@bracketboss.com>",
      to: "adamjpwestsr@gmail.com",
      subject: "Passcode Reset Request",
      html: `
        <p>The following user requested help with their March Madness passcode:</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Name:</strong> ${user.name ?? "Unknown"}</p>
        <p>You can manually reset their passcode in the database if needed.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Forgot passcode error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send request." },
      { status: 500 }
    );
  }
}