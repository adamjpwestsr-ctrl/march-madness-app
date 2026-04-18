"use client";

import { useEffect } from "react";
import Image from "next/image";

export default function LandingPage() {
  // Redirect after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/login";
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex items-center justify-center">

      {/* Sponsored By Message */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center">
        <p className="text-slate-200 text-3xl font-extrabold tracking-wide drop-shadow-[0_0_18px_rgba(16,185,129,0.8)]">
          Sponsored by{" "}
          <a
            href="https://march-madness-app-theta.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,1)] hover:text-emerald-300 transition"
          >
            BracketBoss
          </a>
        </p>
      </div>

      {/* Moving Sponsor Logo */}
      <a
        href="https://march-madness-app-theta.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="moving-logo absolute"
      >
        <Image
          src="/sponsor-logo.png"
          alt="Sponsor Logo"
          width={260}
          height={260}
          className="
            bg-transparent
            pointer-events-none
            drop-shadow-[0_0_25px_rgba(16,185,129,1)]
            drop-shadow-[0_0_60px_rgba(16,185,129,0.9)]
            drop-shadow-[0_0_120px_rgba(16,185,129,0.7)]
          "
          style={{ backgroundColor: "transparent" }}
          loading="eager"
        />
      </a>

      {/* Main Title */}
      <h1 className="text-white text-5xl font-extrabold drop-shadow-2xl mt-40">
        Are You Ready For The Madness!
      </h1>
{/* Copyright Footer */}
<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
  <p className="text-slate-500 text-xs tracking-wide">
    © 2026 - Adam West
  </p>
</div>

    </div>
  );
}
