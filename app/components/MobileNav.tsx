"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Trophy,
  Brain,
  ListChecks,
  Settings,
  LogOut,
} from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    router.push("/login");
  };

  const link = (href: string, label: string, Icon: any) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className="flex items-center gap-3 px-4 py-3 text-lg border-b border-slate-800"
    >
      <Icon size={20} />
      {label}
    </Link>
  );

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <Menu size={28} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setOpen(false)} />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col">
          {link("/home", "Home", Home)}
          {link("/challenges", "Challenges", ListChecks)}
          {link("/trivia", "Trivia", Brain)}
          {link("/leaderboard", "Leaderboard", Trophy)}
          {link("/settings", "Settings", Settings)}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-lg text-red-400 border-t border-slate-800"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </div>
    </>
  );
}
