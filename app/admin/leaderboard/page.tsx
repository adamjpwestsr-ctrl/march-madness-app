// app/admin/leaderboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardAdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  // No custom session → redirect to login
  if (!sessionCookie) {
    redirect("/login");
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  // Must be admin (commissioner counts as admin)
  if (!session.isAdmin) {
    redirect("/bracket");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <LeaderboardClient />
    </div>
  );
}
