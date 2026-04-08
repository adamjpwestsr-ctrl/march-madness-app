export const runtime = "edge";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  try {
    const supabase = createSupabaseServerClient();

    // 1) Get Supabase auth user (session-based, no cookies you manage)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const email = user.email?.toLowerCase();
    if (!email) {
      redirect("/login");
    }

    // 2) Check your own users table for admin flag
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("is_admin")
      .eq("email", email)
      .maybeSingle();

    if (dbError) {
      console.error("ADMIN DB ERROR:", dbError);
      redirect("/login");
    }

    if (!dbUser?.is_admin) {
      redirect("/bracket");
    }

    // 3) Optional: load admin data
    const { data: users, error } = await supabase
      .from("users")
      .select("user_id, email, is_admin, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN LOAD ERROR:", error);
    }

    return <AdminClient adminEmail={email} />;
  } catch (err) {
    console.error("ADMIN PAGE SSR ERROR:", err);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-red-400 text-lg">
          You sure you have admin credentials? Something went wrong and I doubt it was on us!
        </p>
      </div>
    );
  }
}
