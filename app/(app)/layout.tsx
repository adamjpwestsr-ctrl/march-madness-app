// app/(app)/layout.tsx
import Header from "@/app/components/Header";
import MobileNav from "@/app/components/MobileNav";
import SidebarNav from "@/app/components/SidebarNav";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-800">
        {/* Left side: Mobile hamburger */}
        <div className="lg:hidden">
          <MobileNav />
        </div>

        {/* Center: App title or logo */}
        <Header />

        {/* Right side: (optional future profile menu) */}
        <div className="hidden lg:block">{/* profile, icons, etc */}</div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <aside className="hidden lg:block w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur">
          <SidebarNav />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
