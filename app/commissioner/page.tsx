import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import ApproveButton from "./ApproveButton";
import DenyButton from "./DenyButton";

export const dynamic = "force-dynamic";

export default async function CommissionerPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) redirect("/login");

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  // Only admins/commissioners can access this page
  if (!session.isAdmin) redirect("/");

  const supabase = await createSupabaseServerClient();

  // Validate admin user exists
  const { data: adminUser } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!adminUser || !adminUser.is_admin) redirect("/login");

  // Load pending users
  const { data: pending } = await supabase
    .from("pending_users")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Commissioner Dashboard
      </h1>

      <p className="text-slate-400 text-center mb-10">
        Approve or deny new user access requests.
      </p>

      {!pending || pending.length === 0 ? (
        <p className="text-center text-slate-400">
          No pending approval requests.
        </p>
      ) : (
        <div className="space-y-4 max-w-xl mx-auto">
          {pending.map((user) => (
            <div
              key={user.email}
              className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{user.email}</p>
                <p className="text-slate-400 text-sm">
                  Requested: {new Date(user.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-3">
                <ApproveButton email={user.email} />
                <DenyButton email={user.email} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-10">
        <a
          href="/home"
          className="text-emerald-400 hover:text-emerald-300 underline"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
