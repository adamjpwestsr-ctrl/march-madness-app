import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function BadgeProfilePage() {
  const supabase = createServerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6">Please log in to view your badges.</div>;
  }

  const { data: badges } = await supabase
    .from("user_badges")
    .select("badge_name, badge_description, earned_at, badges:badges_id(*)")
    .eq("user_id", user.user_id);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Badges</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges?.map((b) => (
          <div
            key={b.badge_name}
            className="p-6 rounded-xl bg-slate-800/40 border border-slate-700/40"
          >
            <div className="text-4xl mb-3">{b.badges.badge_icon}</div>
            <h2 className="text-xl font-semibold">{b.badge_name}</h2>
            <p className="text-slate-400 text-sm">{b.badge_description}</p>
            <p className="text-slate-500 text-xs mt-2">
              Earned: {new Date(b.earned_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
