import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const message = String(body.message || "").trim();
    const thread_id = body.thread_id;

    if (!name || !email || !message || !thread_id) {
      return NextResponse.json(
        { error: "Missing name, email, message, or forum thread." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Messages cannot exceed 2,000 characters." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("forum_posts").insert({
      display_name: name,
      email,
      message,
      thread_id,
    });

    if (error) {
      console.error("Forum POST error:", error.message);

      return NextResponse.json(
        { error: "Your message could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forum POST exception:", error);

    return NextResponse.json(
      { error: "Something went wrong while posting your message." },
      { status: 500 }
    );
  }
}