import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import SocialPostForm from "./SocialPostForm";
import SocialFeed from "./SocialFeed";

export const dynamic = "force-dynamic";

export default async function SocialHubPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) redirect("/login");

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, content, sport_tag, created_at, user_id, users(username, email)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-4">Social Hub</h1>

      <SocialPostForm userId={session.userId} />

      <SocialFeed posts={posts || []} />
    </div>
  );
}
