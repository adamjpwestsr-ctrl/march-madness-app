"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const navItems = [
  { label: "Home", href: "/home" },
  { label: "Challenges", href: "/challenges" },
  { label: "Trivia", href: "/trivia" },
  { label: "Leaderboards", href: "/leaderboards" },
  { label: "Settings", href: "/settings" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 transition"
      >
        <div className="space-y-1">
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
          <span className="block w-5 h-0.5 bg-white" />
        </div>
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
