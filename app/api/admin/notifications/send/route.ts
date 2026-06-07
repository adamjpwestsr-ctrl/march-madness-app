	import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// -----------------------------
// E.164 VALIDATION
// -----------------------------
function isValidE164(number: string): boolean {
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(number);
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const body = await req.json();
    const { message, target, userId } = body;

    let recipients: { user_id: string; phone_number: string }[] = [];

    // -----------------------------
    // ALL USERS
    // -----------------------------
    if (target === "all") {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, phone_number")
        .eq("push_notifications", true)
        .eq("push_opt_in", true)
        .not("phone_number", "is", null);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "Failed to fetch recipients" },
          { status: 500 }
        );
      }

      recipients = data ?? [];
    }

    // -----------------------------
    // SINGLE USER
    // -----------------------------
    if (target === "single") {
      if (!userId) {
        return NextResponse.json(
          { error: "Missing userId" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("users")
        .select("user_id, phone_number")
        .eq("user_id", userId)
        .eq("push_notifications", true)
        .eq("push_opt_in", true)
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

    // -----------------------------
    // NO RECIPIENTS FOUND
    // -----------------------------
    if (recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid phone numbers found.",
          recipients: [],
        },
        { status: 200 }
      );
    }

    // -----------------------------
    // SEND NOTIFICATIONS (TEST SETUP)
    // -----------------------------
    const validRecipients: { user_id: string; phone_number: string }[] = [];
    const invalidRecipients: { user_id: string; phone_number: string }[] = [];

    for (const r of recipients) {
      if (!isValidE164(r.phone_number)) {
        console.warn("Invalid E.164 phone number:", r.phone_number);
        invalidRecipients.push(r);
        continue;
      }

      validRecipients.push(r);

      // ✅ TEST SETUP: Log message to Supabase table instead of sending SMS
      const { error: insertError } = await supabase
        .from("sent_notifications")
        .insert({
          user_id: r.user_id,
          phone_number: r.phone_number,
          message,
          sent_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Failed to log notification:", insertError);
      }

      // When ready for real SMS, replace with Twilio or other provider:
      // await twilioClient.messages.create({
      //   to: r.phone_number,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   body: message,
      // });
    }

    return NextResponse.json(
      {
        success: true,
        count: validRecipients.length,
        recipients: validRecipients,
        invalid: invalidRecipients,
        message: "Notifications logged successfully (test mode).",
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
