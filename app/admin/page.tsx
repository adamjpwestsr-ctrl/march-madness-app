// app/admin/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export const runtime = "edge";

export default async function AdminPage() {
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

  // Must be admin
  if (!session.isAdmin) {
    redirect("/bracket");
  }

  const email = session.email;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AdminClient adminEmail={email} />
    </div>
  );
}
