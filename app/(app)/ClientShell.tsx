"use client";

import MobileNav from "@/app/components/MobileNav";
import SidebarNav from "@/app/components/SidebarNav";

export default function ClientShell() {
  return (
    <>
      <div className="lg:hidden">
        <MobileNav />
      </div>

      <aside className="hidden lg:block w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur">
        {typeof window !== "undefined" &&
          window.localStorage.getItem("sb-access-token") && <SidebarNav />}
      </aside>
    </>
  );
}
