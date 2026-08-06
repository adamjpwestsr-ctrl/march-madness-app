"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between w-full">
      {/* Logo → Home */}
      <Link href="/home" className="text-xl font-bold tracking-tight">
        BracketBoss
      </Link>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex gap-6 text-sm font-medium">
        <Link href="/home">Home</Link>
        <Link href="/challenges">Challenges</Link>
        <Link href="/trivia">Trivia</Link>
        <Link href="/leaderboard">Leaderboard</Link>
        <Link href="/sports">Sports</Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-400 hover:text-red-300"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>
    </div>
  );
}
