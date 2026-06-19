import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies });

  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = JSON.parse(sessionCookie.value);
  if (session.email !== "adamjwester@gmail.com")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();

  await supabase.from("forum_mutes").delete().eq("email", email);

  await supabase.from("forum_audit").insert({
    action: "unmute_user",
    target_id: email,
    target_type: "user",
    admin_email: session.email,
  });

  return NextResponse.json({ success: true });
}



