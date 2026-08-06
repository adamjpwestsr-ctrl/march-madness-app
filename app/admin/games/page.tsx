export const runtime = "nodejs";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GamesServer from "./GamesServer";

export default async function GamesAdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  if (!session.isAdmin) {
    redirect("/bracket");
  }

  return <GamesServer />;
}
