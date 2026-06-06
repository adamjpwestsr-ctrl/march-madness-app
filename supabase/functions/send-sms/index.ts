// supabase/functions/send-sms/index.ts

export const sendSMS = async (req: Request): Promise<Response> => {
  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' or 'message'" }),
        { status: 400 }
      );
    }

    // Fake SMS for testing
    console.log("FAKE SMS SENT:", { to, message });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
};

Deno.serve(sendSMS);
