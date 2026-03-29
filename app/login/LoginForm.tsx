'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [step, setStep] = useState<'email' | 'admin' | 'requested' | 'error'>('email');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch('/api/login', {
      method: 'POST',
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

      case 'ok':
        router.push(data.isAdmin ? '/admin' : '/bracket');
        break;
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {step === 'email' && (
        <>
          <h2>Enter your email</h2>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit">Continue</button>
        </>
      )}

      {step === 'admin' && (
        <>
          <h2>Admin code required</h2>
          <input
            type="password"
            value={adminCode}
            onChange={e => setAdminCode(e.target.value)}
            required
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Verify</button>
        </>
      )}

      {step === 'requested' && (
        <p>Your email has been sent to the commissioner for approval.</p>
      )}
    </form>
  );
}
