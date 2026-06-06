import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const now = new Date().toISOString();

  // Get due notifications
  const { data: jobs } = await supabase
    .from("scheduled_notifications")
    .select("*")
    .eq("sent", false)
    .lte("scheduled_for", now);

  if (!jobs || jobs.length === 0) {
    return new Response("No jobs due.");
  }

  for (const job of jobs) {
    // Get recipients
    let recipients = [];

    if (job.user_id === "all") {
      const { data } = await supabase
        .from("users")
        .select("phone_number")
        .not("phone_number", "is", null);

      recipients = data;
    } else {
      const { data } = await supabase
        .from("users")
        .select("phone_number")
        .eq("user_id", job.user_id)
        .single();

      recipients = [data];
    }

    // Send each SMS
    for (const r of recipients) {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-sms`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            to: r.phone_number,
            message: job.message,
          }),
        }
      );
    }

    // Mark job as sent
    await supabase
      .from("scheduled_notifications")
      .update({ sent: true })
      .eq("id", job.id);
  }

  return new Response("Processed scheduled notifications.");
});
