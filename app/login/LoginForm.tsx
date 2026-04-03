'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [step, setStep] = useState<'email' | 'admin' | 'requested' | 'done'>('email');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, adminCode }),
    });

    const data = await res.json();

    switch (data.status) {
      case 'requested':
        setStep('requested');
        break;

      case 'needsAdminCode':
        setStep('admin');
        break;

      case 'invalidAdminCode':
        setError('Incorrect admin code');
        break;

      case 'admin':
        setIsAdmin(true);
        setStep('done');
        break;

      case 'ok':
        if (data.isAdmin) {
          setIsAdmin(true);
          setStep('done');
        } else {
          // ⭐ FIX: Force full reload so server reads cookie
          window.location.href = '/bracket';
        }
        break;

      default:
        setError('Unexpected error. Try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* STEP 1 — EMAIL */}
      {step === 'email' && (
        <>
          <label className="block text-sm font-medium">Enter your email</label>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Continue
          </button>
        </>
      )}

      {/* STEP 2 — ADMIN CODE */}
      {step === 'admin' && (
        <>
          <label className="block text-sm font-medium">Admin Code</label>

          <input
            type="password"
            value={adminCode}
            onChange={e => setAdminCode(e.target.value)}
            required
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Verify
          </button>
        </>
      )}

      {/* STEP 3 — UNKNOWN USER */}
      {step === 'requested' && (
        <p className="text-center text-slate-300">
          Your email has been sent to the commissioner.
        </p>
      )}

      {/* STEP 4 — DONE (ADMIN OR KNOWN USER) */}
      {step === 'done' && (
        <div className="space-y-3 text-center">
          <p className="text-slate-300">
            {isAdmin
              ? "Welcome, Commissioner. Choose where to go next."
              : "You're in. Choose where to go next."}
          </p>

          <button
            type="button"
            onClick={() => (window.location.href = '/bracket')}
            className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Go to Brackets
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => (window.location.href = '/admin')}
              className="w-full rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-400"
            >
              Go to Admin Page
            </button>
          )}
        </div>
      )}
    </form>
  );
}
