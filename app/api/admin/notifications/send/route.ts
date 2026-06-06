import { NextResponse } from "next/server";
import { supabaseServerClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = supabaseServerClient();

    const body = await req.json();
    const { message, target } = body;

    let recipients: { phone_number: string }[] = [];

    if (target === "all") {
      const { data, error } = await supabase
        .from("users")
        .select("phone_number")
        .not("phone_number", "is", null);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to fetch recipients" },
          { status: 500 }
        );
      }

      // Normalize null → []
      recipients = data ?? [];
    } else {
      const { data, error } = await supabase
        .from("users")
        .select("phone_number")
        .eq("id", target)
        .not("phone_number", "is", null)
        .limit(1);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to fetch recipient" },
          { status: 500 }
        );
      }

      recipients = data ?? [];
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid phone numbers found." },
        { status: 200 }
      );
    }

    // Example: send SMS (replace with your actual integration)
    for (const r of recipients) {
      console.log("Sending SMS to:", r.phone_number, "Message:", message);
      // await sendSMS(r.phone_number, message);
    }

    return NextResponse.json(
      {
        success: true,
        count: recipients.length,
        message: "Notifications sent successfully.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
