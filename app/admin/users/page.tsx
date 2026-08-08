import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import UserRow from "./UserRow";

export default async function UsersAdminPage() {
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

  // ⭐ Admin authenticated — load users
  const { data: users } = await supabase
    .from("users")
    .select("user_id, email, is_active, has_paid")
    .order("email");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-8">Admin: User List</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <table className="w-full text-left">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="py-2">Email</th>
              <th className="py-2">Active</th>
              <th className="py-2">Paid</th>
            </tr>
          </thead>

          <tbody>
            {users?.map((u) => (
              <UserRow key={u.user_id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
