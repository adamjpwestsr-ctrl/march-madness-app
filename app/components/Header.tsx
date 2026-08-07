"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header({ authUser }: { authUser: any }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between w-full">
      <Link href="/home" className="text-xl font-bold tracking-tight">
        BracketBoss
      </Link>

      <nav className="hidden lg:flex gap-6 text-sm font-medium">
        <Link href="/home">Home</Link>
        <Link href="/challenges">Challenges</Link>
        <Link href="/trivia">Trivia</Link>

        {/* Only show leaderboard when logged in */}
        {authUser && <Link href="/leaderboards">Leaderboard</Link>}

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
