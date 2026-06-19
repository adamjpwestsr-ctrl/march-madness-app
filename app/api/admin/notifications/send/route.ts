import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import admin from "firebase-admin";

// -----------------------------
// Initialize Firebase Admin SDK
// -----------------------------
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

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
    const { message, target, userId } = await req.json();

    let recipients: {
      user_id: string;
      phone_number: string | null;
      fcm_token: string | null;
    }[] = [];

    // -----------------------------
    // FETCH RECIPIENTS
    // -----------------------------
    if (target === "all") {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, phone_number, fcm_token")
        .eq("push_notifications", true)
        .eq("push_opt_in", true);

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
        .select("user_id, phone_number, fcm_token")
        .eq("user_id", userId)
        .eq("push_notifications", true)
        .eq("push_opt_in", true)
        .limit(1);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to fetch recipient" }, { status: 500 });
      }

      recipients = data ?? [];
    }

    if (recipients.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid recipients found.",
        recipients: [],
      });
    }

    // -----------------------------
    // SEND NOTIFICATIONS
    // -----------------------------
    const results: any[] = [];

    for (const r of recipients) {
      const sendResults: any = { user_id: r.user_id };

      // ✅ SMS (Twilio or other provider)
      if (r.phone_number && isValidE164(r.phone_number)) {
        // Replace with real SMS provider later
        await supabase.from("sent_notifications").insert({
          user_id: r.user_id,
          phone_number: r.phone_number,
          message,
          sent_at: new Date().toISOString(),
        });
        sendResults.sms = "Logged (test mode)";
      }

// ✅ Firebase Push
if (r.fcm_token) {
  try {
    const response = await admin.messaging().send({
      token: r.fcm_token!,
      notification: {
        title: "BracketBoss",
        body: message,
      },
    });

    sendResults.push = response;

    await supabase.from("sent_notifications").insert({
      user_id: r.user_id,
      phone_number: null,
      message,
      sent_at: new Date().toISOString(),
    });
  } catch (pushError) {
    console.error("FCM send error:", pushError);
    sendResults.pushError = pushError;
  }
}

      results.push(sendResults);
    }

    return NextResponse.json({
      success: true,
      count: recipients.length,
      results,
      message: "Hybrid notifications sent successfully.",
    });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


