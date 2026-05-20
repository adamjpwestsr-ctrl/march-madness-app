// app/bracket/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BracketClient from "./BracketClient";

export default async function BracketPage({
  searchParams,
}: {
  searchParams: { bid?: string };
}) {
  const supabase = createClient();

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const email = session.user.email;

  // Load brackets for this user
  const { data: brackets, error } = await supabase
    .from("brackets")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: true });

  if (error) console.error(error);

  // If no brackets exist → show Create screen
  if (!brackets || brackets.length === 0) {
    const createBracket = async () => {
      "use server";
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) redirect("/login");

      const email = session.user.email;

      const { data, error } = await supabase
        .from("brackets")
        .insert({
          email,
          bracket_name: "My Bracket",
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        return;
      }

      redirect(`/bracket?bid=${data.id}`);
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 gap-6">
        <h1 className="text-3xl font-bold">No Brackets Found</h1>
        <p className="opacity-80">Create your first bracket to get started.</p>

        <form action={createBracket}>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow-lg"
          >
            Create Your First Bracket
          </button>
        </form>
      </div>
    );
  }

  // Determine active bracket
  const activeBracket =
    brackets.find((b) => b.id === searchParams.bid) ?? brackets[0];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-2">Your Brackets</h2>

        <div className="flex flex-col gap-2">
          {brackets.map((b) => (
            <a
              key={b.id}
              href={`/bracket?bid=${b.id}`}
              className={`px-3 py-2 rounded-md transition ${
                b.id === activeBracket.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {b.bracket_name}
            </a>
          ))}
        </div>

        {/* Create New Bracket */}
        <form
          action={async () => {
            "use server";
            const supabase = createClient();

            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (!session) redirect("/login");

            const email = session.user.email;

            const { data, error } = await supabase
              .from("brackets")
              .insert({
                email,
                bracket_name: `Bracket ${brackets.length + 1}`,
              })
              .select()
              .single();

            if (error) console.error(error);

            redirect(`/bracket?bid=${data.id}`);
          }}
        >
          <button
            type="submit"
            className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-semibold"
          >
            + Create New Bracket
          </button>
        </form>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <BracketClient bracketId={activeBracket.id} />
      </main>
    </div>
  );
}
