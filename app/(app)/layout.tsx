
import SidebarNav from "@/app/components/SidebarNav";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();

  // Identify the March Madness login route using the header
  // supplied by app/proxy.ts.
  const isMarchMadnessLogin =
    requestHeaders.get("x-public-route") === "march-madness-login";

  // Require a valid mm_session cookie on all other routes.
  if (!isMarchMadnessLogin) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("mm_session");

    if (!sessionCookie) {
      redirect("/login");
    }

    try {
      JSON.parse(sessionCookie.value);
    } catch {
      redirect("/login");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white overflow-hidden">
      <aside className="group w-64 lg:w-16 hover:w-64 transition-all duration-300 ease-in-out border-r border-slate-800 bg-slate-900 overflow-hidden">
        <SidebarNav />
      </aside>

      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
    </div>
  );
}
