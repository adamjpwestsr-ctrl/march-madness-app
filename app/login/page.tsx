'use client';

import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-50 overflow-hidden">

      {/* Floating Logos */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <img
          src="/logos/uconn.png"
          className="absolute top-10 left-10 w-28 animate-bounce-slow"
        />
        <img
          src="/logos/duke.png"
          className="absolute top-1/2 left-3/4 w-28 animate-bounce-slower"
        />
        <img
          src="/logos/unc.png"
          className="absolute top-1/3 left-1/4 w-28 animate-bounce-slowest"
        />
        <img
          src="/logos/kansas.png"
          className="absolute bottom-10 left-1/3 w-28 animate-bounce-slow"
        />
        <img
          src="/logos/arizona.png"
          className="absolute bottom-20 right-10 w-28 animate-bounce-slower"
        />
	<img
          src="/logos/basketball.png"
          className="absolute bottom-20 right-10 w-28 animate-bounce-slower"
        />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Header strip */}
        <div className="bg-emerald-500/95 text-slate-950 px-8 py-5 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            March Madness Bracket Room
          </h1>
          <p className="text-sm mt-1 font-medium">
            One email. One shot at bracket glory.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          <p className="text-sm text-slate-400 text-center mb-6">
            Enter your email to step onto the court and lock in your picks.
          </p>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
