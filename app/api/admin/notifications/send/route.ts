import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { userId, message } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get recipients
  let recipients = [];

  if (userId === "all") {
    const { data } = await supabase
      .from("users")
      .select("phone_number")
      .not("phone_number", "is", null);

    recipients = data;
  } else {
    const { data } = await supabase
      .from("users")
      .select("phone_number")
      .eq("user_id", userId)
      .single();

    recipients = [data];
  }

  // Send to each recipient
  for (const r of recipients) {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: r.phone_number,
          message,
        }),
      }
    );
  }

  return NextResponse.json({ success: true });
}
