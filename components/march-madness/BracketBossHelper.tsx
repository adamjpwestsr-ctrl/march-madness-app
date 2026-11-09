
"use client";

import Link from "next/link";

export default function BracketBossHelper() {
  return (
    <>
      <div className="fixed bottom-5 right-5 z-[80]">
        <Link
          href="/sports/march-madness-v2/help"
          aria-label="Open the BracketBoss How to Play guide"
          className="bb-helper-float group flex items-center gap-3"
        >
          <span className="rounded-2xl border border-cyan-300/40 bg-[#10243d] px-4 py-3 text-sm font-black text-white shadow-xl transition group-hover:border-cyan-200 group-hover:bg-[#173452]">
            <span className="block text-cyan-300">
              Need some help?
            </span>
            <span className="block text-[10px] font-medium text-slate-300">
              Click me! I'm your Bracket Buddy! 🏀
            </span>
          </span>

          <span className="relative flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-orange-400 to-orange-600 text-4xl shadow-[0_0_25px_rgba(34,211,238,0.3)] transition group-hover:scale-110">
            🏀
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#10243d] bg-cyan-400 text-[10px] font-black text-slate-950">
              ?
            </span>
          </span>
        </Link>
      </div>

      <style jsx>{`
        .bb-helper-float {
          animation: bb-float 3.2s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes bb-float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-5px, -9px) rotate(-2deg);
          }
          50% {
            transform: translate(0, -17px) rotate(2deg);
          }
          75% {
            transform: translate(4px, -7px) rotate(-1deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bb-helper-float {
            animation: none;
          }
        }

        @media (max-width: 480px) {
          .bb-helper-float {
            gap: 8px;
          }

          .bb-helper-float > span:first-child {
            padding: 9px 11px;
          }
        }
      `}</style>
    </>
  );
}
