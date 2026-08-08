import SidebarNav from "@/app/components/SidebarNav";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("mm_session");

  // Only authenticated users can access this layout
  if (!sessionCookie) redirect("/login");

  let session: any;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/login");
  }

  return (
<div className="flex min-h-screen bg-slate-950 text-white overflow-hidden">
  <aside
    className="w-64 border-r border-slate-800 bg-slate-900 transition-all duration-300 ease-in-out hover:w-64 lg:w-16 group"
  >
    <SidebarNav />
  </aside>

  <main className="flex-1 overflow-y-auto">{children}</main>
</div>
  );
}
