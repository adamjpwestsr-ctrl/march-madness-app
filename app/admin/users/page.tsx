export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import { toggleActive, togglePaid } from "./actions";

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
              <tr
                key={u.user_id}
                className="border-b border-slate-800 hover:bg-slate-800/50"
              >
                <td className="py-3">{u.email}</td>

                {/* ACTIVE TOGGLE */}
                <td className="py-3">
                  <form action={toggleActive}>
                    <input type="hidden" name="userId" value={u.user_id} />
                    <button
                      type="submit"
                      className={`px-3 py-1 rounded ${
                        u.is_active
                          ? "bg-green-600"
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>

                {/* PAID TOGGLE */}
                <td className="py-3">
                  <form action={togglePaid}>
                    <input type="hidden" name="userId" value={u.user_id} />
                    <button
                      type="submit"
                      className={`px-3 py-1 rounded ${
                        u.has_paid
                          ? "bg-blue-600"
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      {u.has_paid ? "Paid" : "Unpaid"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
