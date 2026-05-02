// app/components/SidebarNav.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Trophy,
  Brain,
  ListChecks,
  Settings,
  LogOut,
} from "lucide-react";

export default function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    router.push("/login");
  };

  const link = (href: string, label: string, Icon: any) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-md hover:bg-slate-800 ${
        pathname === href ? "bg-slate-800 text-white" : "text-slate-300"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <nav className="flex flex-col gap-2 p-4">
      {link("/home", "Home", Home)}
      {link("/challenges", "Challenges", ListChecks)}
      {link("/trivia", "Trivia", Brain)}
      {link("/leaderboard", "Leaderboard", Trophy)}
      {link("/settings", "Settings", Settings)}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 rounded-md text-red-400 hover:bg-slate-800 hover:text-red-300"
      >
        <LogOut size={18} />
        Logout
      </button>
    </nav>
  );
}
