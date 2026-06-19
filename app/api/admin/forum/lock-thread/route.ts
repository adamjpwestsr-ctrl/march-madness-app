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

  const { threadId, locked } = await req.json();

  await supabase.from("forum_threads").update({ locked }).eq("id", threadId);

  await supabase.from("forum_audit").insert({
    action: locked ? "lock_thread" : "unlock_thread",
    target_id: threadId,
    target_type: "thread",
    admin_email: session.email,
  });

  return NextResponse.json({ success: true });
}


