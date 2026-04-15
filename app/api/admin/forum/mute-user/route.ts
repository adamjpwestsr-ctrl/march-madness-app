import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function adminClient(cookieStore: any) {
  return createServerClient(SUPABASE_URL, SERVICE_ROLE_KEY, { cookies: cookieStore });
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = adminClient(cookieStore);

  const sessionCookie = cookieStore.get("mm_session");
  if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = JSON.parse(sessionCookie.value);
  if (session.email !== "adamjwester@gmail.com")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email } = await req.json();

  await supabase.from("forum_mutes").upsert({ email });

  await supabase.from("forum_audit").insert({
    action: "mute_user",
    target_id: email,
    target_type: "user",
    admin_email: session.email,
  });

  return NextResponse.json({ success: true });
}
