import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FantasyRoster from "./FantasyRoster";
import FantasyLeaderboard from "./FantasyLeaderboard";

export default async function FantasyFootballPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) redirect("/login");

  const session = JSON.parse(sessionCookie.value);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">NFL Fantasy</h1>

      <FantasyRoster userId={session.userId} />

      <FantasyLeaderboard />
    </div>
  );
}
