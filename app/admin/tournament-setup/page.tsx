// app/admin/tournament-setup/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TournamentSetupClient from "./TournamentSetupClient";

export default async function TournamentSetupPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  if (!session.isAdmin) {
    redirect("/bracket");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        Admin · Tournament Setup
      </h1>

      <TournamentSetupClient />
    </div>
  );
}
