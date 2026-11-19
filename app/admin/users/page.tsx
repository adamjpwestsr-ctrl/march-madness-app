
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import UsersClient from "./UsersClient";

export default async function UsersAdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  let session;

  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  // Match the existing BracketBoss Admin authentication.
  if (!session.email || !session.userId) {
    redirect("/login");
  }

  if (!session.isAdmin) {
    redirect("/bracket");
  }

  const supabase = await createSupabaseServerClient();

  const [usersResult, bracketsResult, mulligansResult] =
    await Promise.all([
      supabase
        .from("users")
        .select("user_id, name, email, is_admin, is_active, has_paid")
        .order("email", { ascending: true }),

      supabase
        .from("brackets")
        .select("bracket_id, user_id, bracket_name, created_at"),

      supabase
        .from("mulligan_requests")
        .select(
          "id, user_id, bracket_id, game_id, replacement_team, status, created_at"
        ),
    ]);

  if (usersResult.error) {
    console.error("Admin users load error:", usersResult.error.message);
  }

  if (bracketsResult.error) {
    console.error("Admin brackets load error:", bracketsResult.error.message);
  }

  if (mulligansResult.error) {
    console.error("Admin mulligans load error:", mulligansResult.error.message);
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6 lg:p-10">
      <UsersClient
        users={usersResult.data ?? []}
        brackets={bracketsResult.data ?? []}
        mulligans={mulligansResult.data ?? []}
      />
    </div>
  );
}
