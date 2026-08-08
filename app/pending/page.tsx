"use client";

import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="
        bg-slate-900/70 border border-slate-700 
        rounded-2xl p-10 max-w-md w-full text-center 
        shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-fade-in
      ">
        
        <h1 className="text-3xl font-bold mb-4">
          Access Pending Approval
        </h1>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Your email has been submitted for commissioner approval.  
          Once approved, you’ll be able to log in and start competing in all BracketBoss challenges.
        </p>

        <p className="text-slate-400 text-xs mb-8">
          This usually takes just a few minutes.
        </p>

        <Link
          href="/login"
          className="
            block bg-emerald-600 hover:bg-emerald-500 
            text-black font-semibold py-2 px-4 rounded-lg 
            transition-all duration-200 mb-4
          "
        >
          Return to Login
        </Link>

        <a
          href="mailto:commissioners@yourdomain.com"
          className="text-slate-400 hover:text-slate-300 underline text-sm"
        >
          Email the Commissioners
        </a>
      </div>
    </div>
  );
}
