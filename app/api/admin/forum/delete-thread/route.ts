import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: cookieStore });

  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = JSON.parse(sessionCookie.value);
  if (session.email !== "adamjwester@gmail.com")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { threadId } = await req.json();

  await supabase.from("forum_reactions").delete().eq("thread_id", threadId);
  await supabase.from("forum_posts").delete().eq("thread_id", threadId);
  await supabase.from("forum_threads").delete().eq("id", threadId);

  await supabase.from("forum_audit").insert({
    action: "delete_thread",
    target_id: threadId,
    target_type: "thread",
    admin_email: session.email,
  });

  return NextResponse.json({ success: true });
}
