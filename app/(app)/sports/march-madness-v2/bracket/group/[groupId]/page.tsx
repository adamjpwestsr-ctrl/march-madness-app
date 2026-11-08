import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export default async function GroupBracketEntryPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // LOAD GROUP INFORMATION
  // --------------------------------------------------

  const { data: group, error: groupErr } = await supabase
    .from("mm_groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupErr || !group) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 text-red-400">
        Group not found.
      </div>
    );
  }

  // --------------------------------------------------
  // CHECK GROUP MEMBERSHIP
  // --------------------------------------------------

  const { data: membership } = await supabase
    .from("mm_group_members")
    .select("*")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .maybeSingle();

  const isMember = !!membership;

  // --------------------------------------------------
  // LOAD USER'S BRACKETS
  // --------------------------------------------------

  const { data: bracketData, error: bracketsError } = await supabase
    .from("brackets")
    .select("bracket_id, bracket_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (bracketsError) {
    console.error("Error loading user brackets:", bracketsError);
  }

  const brackets = bracketData ?? [];

  // --------------------------------------------------
  // LOAD BRACKETS ALREADY SUBMITTED TO THIS GROUP
  // --------------------------------------------------

  const { data: groupBracketData, error: groupBracketsError } =
    await supabase
      .from("mm_group_brackets")
      .select("bracket_id")
      .eq("group_id", groupId);

  if (groupBracketsError) {
    console.error(
      "Error loading group submissions:",
      groupBracketsError
    );
  }

  const groupBrackets = groupBracketData ?? [];

  const submittedIds = new Set(
    groupBrackets.map((gb) => gb.bracket_id)
  );

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Group: {group.group_name}
        </h1>

        <Link
          href={`/sports/march-madness-v2/bracket/leaderboard/group/${groupId}`}
          className="rounded-lg bg-blue-500 px-4 py-2 font-semibold text-black hover:bg-blue-400"
        >
          View Group Leaderboard
        </Link>
      </div>

      {!isMember && (
        <form
          action="/api/march-madness-v2/groups/join"
          method="POST"
          className="mb-6"
        >
          <input
            type="hidden"
            name="group_id"
            value={groupId}
          />

          <button
            type="submit"
            className="rounded-lg bg-green-500 px-6 py-3 font-bold text-black hover:bg-green-400"
          >
            Join Group
          </button>
        </form>
      )}

      <h2 className="mb-4 text-2xl font-semibold">
        Submit a Bracket
      </h2>

      {brackets.length === 0 ? (
        <div className="text-gray-300">
          You have no brackets yet.

          <Link
            href="/sports/march-madness-v2/bracket/create"
            className="ml-2 text-green-400 underline"
          >
            Create one
          </Link>
        </div>
      ) : (
        <form
          action="/api/march-madness-v2/groups/submit"
          method="POST"
          className="space-y-4"
        >
          <input
            type="hidden"
            name="group_id"
            value={groupId}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {brackets.map((b) => {
              const alreadySubmitted = submittedIds.has(
                b.bracket_id
              );

              return (
                <div
                  key={b.bracket_id}
                  className="rounded-xl border border-slate-700 bg-slate-800 p-4"
                >
                  <h3 className="mb-2 text-xl font-semibold">
                    {b.bracket_name}
                  </h3>

                  <div className="mb-3 text-sm text-gray-400">
                    Created:{" "}
                    {b.created_at
                      ? new Date(b.created_at).toLocaleString()
                      : "Unknown"}
                  </div>

                  {alreadySubmitted ? (
                    <div className="rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-gray-200">
                      Already Submitted
                    </div>
                  ) : (
                    <button
                      type="submit"
                      name="bracket_id"
                      value={b.bracket_id}
                      className="rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-black hover:bg-purple-400"
                    >
                      Submit to Group
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </form>
      )}

      <h2 className="mb-4 mt-10 text-2xl font-semibold">
        Brackets Submitted to This Group
      </h2>

      {groupBrackets.length === 0 ? (
        <div className="text-gray-300">
          No brackets submitted yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {groupBrackets.map((gb) => (
            <li
              key={gb.bracket_id}
              className="rounded-xl border border-slate-700 bg-slate-800 p-4"
            >
              <Link
                href={`/sports/march-madness-v2/bracket/view/${gb.bracket_id}`}
                className="text-blue-400 underline"
              >
                View Bracket {gb.bracket_id}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}