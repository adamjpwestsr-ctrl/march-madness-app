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
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-slate-300 text-sm tracking-wide">
          Sponsored by <span className="font-semibold">YOUR BUSINESS HERE</span>
        </p>
      </div>

      {/* Moving Sponsor Logo */}
      <a
        href="https://yourfriendswebsite.com"
        target="_blank"
        rel="noopener noreferrer"
        className="moving-logo absolute"
      >
        <Image
          src="/sponsor-logo.png" // Place this file in /public
          alt="Sponsor Logo"
          width={140}
          height={140}
        />
      </a>

      {/* Your existing floating logos background */}
      <div className="absolute inset-0 -z-10">
        {/* Keep your floating logos or background animation here */}
      </div>

      {/* Optional main title */}
      <h1 className="text-white text-3xl font-bold drop-shadow-lg">
        Welcome to the Bracket
      </h1>
    </div>
  );
}
