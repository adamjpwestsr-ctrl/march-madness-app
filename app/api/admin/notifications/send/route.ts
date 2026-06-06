import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const { message, target, userId } = body;

    let recipients: { phone_number: string }[] = [];

    if (target === "all") {
      const { data, error } = await supabase
        .from("users")
        .select("phone_number")
        .eq("push_notifications", true)
        .eq("push_opt_in", true)
        .not("phone_number", "is", null);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
      }

      recipients = data ?? [];
    }

    if (target === "single") {
      if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }

      const { data, error } = await supabase
        .from("users")
        .select("phone_number")
        .eq("id", userId)
        .eq("push_notifications", true)
        .eq("push_opt_in", true)
        .not("phone_number", "is", null)
        .limit(1);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to fetch recipient" }, { status: 500 });
      }

      recipients = data ?? [];
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid phone numbers found." },
        { status: 200 }
      );
    }

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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
