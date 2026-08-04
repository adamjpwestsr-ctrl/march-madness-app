import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import TriviaAdminServer from "./TriviaAdminServer";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default async function TriviaAdminPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const email = user.email?.toLowerCase();
  if (!email) redirect("/login");

  const { data: dbUser } = await supabase
    .from("users")
    .select("is_admin")
    .eq("email", email)
    .maybeSingle();

  if (!dbUser?.is_admin) redirect("/bracket");

  return <TriviaAdminServer />;
}
