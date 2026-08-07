import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import SidebarNav from "@/app/components/SidebarNav";
import AppShell from "./AppShell";
import ClientShell from "./ClientShell";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // ⭐ Redirect if not logged in
  if (!authUser) {
    redirect("/(public)/login"); // or "/" if you prefer landing first
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="hidden">
            <Header authUser={authUser} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <SidebarNav />
          <ClientShell />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
