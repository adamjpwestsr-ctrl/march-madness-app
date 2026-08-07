import Header from "@/app/components/Header";
import AppShell from "./AppShell";
import ClientShell from "./ClientShell";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // ⭐ Fetch Supabase user on the server
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  return (
    <AppShell>
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">

        <header className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="hidden">
            {/* ⭐ Pass authUser into Header */}
            <Header authUser={authUser} />
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <ClientShell />

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
