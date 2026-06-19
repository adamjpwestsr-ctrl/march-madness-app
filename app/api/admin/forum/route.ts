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

  const { postId } = await req.json();

  await supabase.from("forum_posts").update({ deleted: true }).eq("id", postId);
  await supabase.from("forum_reactions").delete().eq("post_id", postId);

  await supabase.from("forum_audit").insert({
    action: "delete_post",
    target_id: postId,
    target_type: "post",
    admin_email: session.email,
  });

  return NextResponse.json({ success: true });
}


