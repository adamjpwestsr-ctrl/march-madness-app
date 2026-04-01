// app/admin/tools/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import ToolsClient from "./ToolsClient";

const ADMIN_EMAILS = ["adamjpwestsr@gmail.com", "lfahearn@gmail.com"];

export default async function ToolsAdminPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const email = session.user.email;
  if (!email || !ADMIN_EMAILS.includes(email)) redirect("/");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <ToolsClient />
    </div>
  );
}
