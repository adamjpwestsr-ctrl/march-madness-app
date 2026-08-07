import Header from "@/app/components/Header";
import SidebarNav from "@/app/components/SidebarNav";
import AppShell from "./AppShell";
import ClientShell from "./ClientShell";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { ReactNode } from "react";
import Link from "next/link";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  // ⭐ If not logged in, show login prompt only
  if (!authUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50">
        <p className="mb-4">You are not logged in.</p>
        <Link href="/login" className="text-emerald-400 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  // ⭐ Logged-in layout
  return (
    <AppShell>
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* SidebarNav visible only when logged in */}
          <SidebarNav />

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
