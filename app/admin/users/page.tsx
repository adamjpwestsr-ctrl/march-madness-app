export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import UserRow from "./UserRow";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function UsersAdminPage() {
  // AUTH CHECK
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

  // SUPABASE
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // LOAD USERS
  const { data: users, error } = await supabase
    .from("users")
    .select("user_id, email, is_active, has_paid")
    .order("email");

  if (error) {
    console.error("User load error:", error);
  }

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
