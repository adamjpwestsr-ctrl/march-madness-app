import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import MulligansClient from "./MulligansClient";

export default async function MulligansAdminPage() {
  const cookieStore = await cookies();   // ← async form
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <MulligansClient />
    </div>
  );
}
