// app/bracket/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import BracketClient from "./BracketClient";

export default async function BracketPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Load all brackets for this user
  const { data: brackets, error: bracketsError } = await supabase
    .from("brackets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (bracketsError || !brackets || brackets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-lg">No brackets found for this account.</p>
      </div>
    );
  }

  const selectedId =
    typeof searchParams?.bid === "string" ? searchParams.bid : undefined;

  const activeBracket =
    brackets.find((b) => String(b.id) === selectedId) ?? brackets[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <BracketClient
        bracketId={activeBracket.id}
        userId={userId}
        bracketName={activeBracket.bracket_name ?? "My Bracket"}
      />
    </div>
  );
}
