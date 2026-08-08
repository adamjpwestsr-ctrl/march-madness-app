import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import AdminSettingsForm from "./settingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) redirect("/login");

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  if (!session.isAdmin) redirect("/");

  const supabase = await createSupabaseServerClient();

  const { data: adminUser } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!adminUser || !adminUser.is_admin) redirect("/login");

  // ⭐ Admin authenticated — load admin list
  const { data: admins } = await supabase
    .from("users")
    .select("user_id, email, admin_code")
    .eq("is_admin", true)
    .order("email");

  return (
    <div className="p-10 max-w-2xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      <AdminSettingsForm admins={admins || []} />
    </div>
  );
}
