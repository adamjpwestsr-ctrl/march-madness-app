export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

import BracketShell from "./BracketShell";
import BracketSelectorShell from "./BracketSelectorShell";
import BracketIconSelector from "./BracketIconSelector";

import {
  createBracket,
  deleteBracket,
  renameBracket,
  updateBracketIcon,
} from "./actions";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function BracketPage({ searchParams }) {
  try {
    // SESSION CHECK
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("mm_session");
    if (!sessionCookie) redirect("/login");

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      redirect("/login");
    }

    const email = session.email?.toLowerCase();
    const isAdmin = !!session.isAdmin;

    if (!email) redirect("/login");

    // SUPABASE CLIENT (SERVER-SAFE)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // LOAD BRACKETS BY EMAIL (NOT USER_ID)
    const { data: brackets, error } = await supabase
      .from("brackets")
      .select("bracket_id, bracket_name, icon, created_at, updated_at")
      .eq("email", email)
      .order("created_at", { ascending: true });

    if (error) console.error("Bracket load error:", error);

    const safeBrackets = Array.isArray(brackets) ? brackets : [];

    // NO BRACKETS → SHOW CREATE BUTTON
    if (safeBrackets.length === 0) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-6">
          <p className="text-lg">No brackets found for this account.</p>

          <form action={createBracket}>
            <input type="hidden" name="email" value={email} />
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

    // DETERMINE ACTIVE BRACKET
    const selectedId =
      typeof searchParams?.bid === "string" ? searchParams.bid : undefined;

    const activeBracket =
      safeBrackets.find((b) => String(b.bracket_id) === selectedId) ??
      safeBrackets[0];

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex">
        {/* SIDEBAR */}
        <aside className="w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-4">
          <h2 className="text-xl font-bold mb-2">Your Brackets</h2>

          <div className="flex flex-col gap-3">
            {safeBrackets.map((b) => {
              const created = b.created_at
                ? new Date(b.created_at).toLocaleDateString()
                : "";
              const updated = b.updated_at
                ? new Date(b.updated_at).toLocaleDateString()
                : "";

              const isActive = b.bracket_id === activeBracket.bracket_id;

              return (
                <div
                  key={b.bracket_id}
                  className={`p-3 rounded-lg ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={`/bracket?bid=${b.bracket_id}`}
                      className="flex-1 flex items-center gap-2 font-semibold"
                    >
                      <span>{b.icon || "🏀"}</span>
                      <span className="truncate">
                        {b.bracket_name || "My Bracket"}
                      </span>
                    </a>

                    <BracketIconSelector
                      bracketId={b.bracket_id}
                      currentIcon={b.icon}
                    />
                  </div>

                  <div className="mt-1 text-xs opacity-80">
                    {created && <div>Created: {created}</div>}
                    {updated && <div>Updated: {updated}</div>}
                  </div>

                  <form action={renameBracket} className="mt-2 flex gap-2">
                    <input type="hidden" name="bracketId" value={b.bracket_id} />
                    <input type="hidden" name="email" value={email} />
                    <input
                      name="newName"
                      defaultValue={b.bracket_name || "My Bracket"}
                      className="flex-1 bg-slate-900 text-xs rounded px-2 py-1 border border-slate-700"
                    />
                    <button
                      type="submit"
                      className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"
                    >
                      Save
                    </button>
                  </form>

                  {isAdmin && (
                    <form action={deleteBracket} className="mt-2">
                      <input
                        type="hidden"
                        name="bracketId"
                        value={b.bracket_id}
                      />
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>

          <form action={createBracket} className="mt-auto">
            <input type="hidden" name="email" value={email} />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold shadow"
            >
              + Create Another Bracket
            </button>
          </form>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6">
          <BracketSelectorShell
            brackets={safeBrackets}
            activeId={activeBracket.bracket_id}
          />

          <BracketShell
            bracketId={activeBracket.bracket_id}
            userEmail={email}
            bracketName={activeBracket.bracket_name ?? "My Bracket"}
          />
        </main>
      </div>
    );
  } catch (err) {
    console.error("BRACKET PAGE SSR ERROR:", err);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-red-400 text-lg">
          Something went wrong loading your bracket.
        </p>
      </div>
    );
  }
}
