/* Layout version Update v6.2.5 */

import Header from "@/app/components/Header";
import MobileNav from "@/app/components/MobileNav";
import SidebarNav from "@/app/components/SidebarNav";
import AppShell from "./AppShell";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="lg:hidden">
            <MobileNav />
          </div>

          <div className="hidden">
            <Header />
          </div>

          <div className="hidden lg:block"></div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden lg:block w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur">
            {typeof window !== "undefined" &&
              window.localStorage.getItem("sb-access-token") && <SidebarNav />}
          </aside>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
