export const runtime = "edge";
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminClient from "./AdminClient";

export default function AdminPage() {
  try {
    // 1) Read mm_session cookie
    const store = cookies();
    const raw = store.get("mm_session")?.value;

    if (!raw) {
      redirect("/login");
    }

    let session;
    try {
      session = JSON.parse(raw);
    } catch {
      redirect("/login");
    }

    // 2) Validate required fields
    if (!session.email || !session.userId) {
      redirect("/login");
    }

    // 3) Admin check
    if (!session.isAdmin) {
      redirect("/bracket");
    }

    // 4) Render admin client
    return <AdminClient adminEmail={session.email} />;

  } catch (err) {
    console.error("ADMIN PAGE SSR ERROR:", err);

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-red-400 text-lg">
          You sure you have admin credentials? Something went wrong and I doubt it was on us!
        </p>
      </div>
    );
  }
}
