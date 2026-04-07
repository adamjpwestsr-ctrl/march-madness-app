export const runtime = "edge";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

import AdminShell from "./AdminShell";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function AdminPage() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("mm_session");

    if (!sessionCookie) redirect("/login");

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      redirect("/login");
    }

    if (!session.isAdmin) redirect("/bracket");

    const supabase = createServerClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      cookies: () => cookieStore,
    });

    // Load any admin data you need
    const { data: users, error } = await supabase
      .from("users")
      .select("user_id, email, is_admin, created_at")
      .order("created_at", { ascending: false });

    if (error) console.error("ADMIN LOAD ERROR:", error);

    return <AdminShell users={users ?? []} />;
  } catch (err) {
    console.error("ADMIN PAGE SSR ERROR:", err);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-red-400 text-lg">
          Something went wrong loading the admin panel.
        </p>
      </div>
    );
  }
}
