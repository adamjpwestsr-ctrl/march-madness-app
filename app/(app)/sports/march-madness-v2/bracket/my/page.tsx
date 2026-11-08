import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

type Bracket = {
  bracket_id: string;
  bracket_name: string;
  icon: string | null;
  tiebreaker_score: number | null;
  created_at: string;
};

export default async function MyBracketsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: brackets, error } = await supabase
    .from("brackets")
    .select("bracket_id, bracket_name, icon, tiebreaker_score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load brackets:", error);
  }

  const list: Bracket[] = brackets ?? [];

  return (
    <div className="p-8 bg-slate-900 min-h-screen text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Brackets</h1>
        <Link
          href="/sports/march-madness-v2/bracket/create"
          className="px-4 py-2 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400"
        >
          + New Bracket
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="mt-10 text-gray-300">
          You don&apos;t have any brackets yet.
          <span className="ml-2">
            Click <span className="font-semibold">New Bracket</span> to create one.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((b) => (
            <div
              key={b.bracket_id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{b.bracket_name}</h2>
                {b.icon && (
                  <span className="text-2xl" aria-label="Bracket icon">
                    {b.icon}
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-400">
                Created: {new Date(b.created_at).toLocaleString()}
                {b.tiebreaker_score !== null && (
                  <div>Tiebreaker: {b.tiebreaker_score}</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Link
                  href={`/sports/march-madness-v2/bracket/view/${b.bracket_id}`}
                  className="px-3 py-1 rounded-md bg-blue-500 text-black text-sm font-semibold hover:bg-blue-400"
                >
                  View
                </Link>
                <Link
                  href={`/sports/march-madness-v2/bracket/edit/${b.bracket_id}`}
                  className="px-3 py-1 rounded-md bg-yellow-400 text-black text-sm font-semibold hover:bg-yellow-300"
                >
                  Edit
                </Link>
                <Link
                  href={`/sports/march-madness-v2/bracket/group/select?bracketId=${b.bracket_id}`}
                  className="px-3 py-1 rounded-md bg-purple-500 text-black text-sm font-semibold hover:bg-purple-400"
                >
                  Enter Group
                </Link>
                <Link
                  href={`/sports/march-madness-v2/bracket/duplicate/${b.bracket_id}`}
                  className="px-3 py-1 rounded-md bg-slate-600 text-gray-100 text-sm font-semibold hover:bg-slate-500"
                >
                  Duplicate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
