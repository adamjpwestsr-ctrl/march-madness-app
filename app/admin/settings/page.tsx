import { createServerClient } from "@/lib/supabaseServerClient";
import AdminSettingsForm from "./settingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createServerClient();

  const { data: admins, error } = await supabase
    .from("users")
    .select("user_id, email, admin_code")
    .eq("is_admin", true)
    .order("email");

  if (error) {
    console.error("Failed to load admins:", error);
    return <div className="text-red-500">Failed to load admin settings.</div>;
  }

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Settings</h1>

      <AdminSettingsForm admins={admins || []} />
    </div>
  );
}
