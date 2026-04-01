'use client';

import { useEffect } from 'react';

export default function LandingPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/login';
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 overflow-hidden">

      {/* Floating Logos */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img src="/logos/uconn.png" className="absolute top-10 left-10 w-28 animate-bounce-slow" />
        <img src="/logos/duke.png" className="absolute top-1/2 left-3/4 w-28 animate-bounce-slower" />
        <img src="/logos/unc.png" className="absolute top-1/3 left-1/4 w-28 animate-bounce-slowest" />
        <img src="/logos/kansas.png" className="absolute bottom-10 left-1/3 w-28 animate-bounce-slow" />
        <img src="/logos/arizona.png" className="absolute bottom-20 right-10 w-28 animate-bounce-slower" />
        <img src="/logos/basketball.png" className="absolute bottom-20 right-10 w-28 animate-bounce-slower" />
      </div>

      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Bracket Room</h1>
        <p className="text-slate-400 text-lg">
          Preparing the court… redirecting you to login.
        </p>
      </div>
    </main>
  );
}
