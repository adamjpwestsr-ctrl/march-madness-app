'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [step, setStep] = useState<'email' | 'adminCode' | 'done'>('email')
  const [message, setMessage] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          adminCode: step === 'adminCode' ? adminCode : undefined
        })
      })

      const data = await res.json()

      if (data.status === 'requested') {
        setMessage(
          "Your email’s been sent to the commissioner. Once you’re on the roster, you’ll be able to tip off your bracket."
        )
        setStep('done')
        return
      }

      if (data.status === 'needsAdminCode') {
        setIsAdmin(true)
        setStep('adminCode')
        setMessage('Enter your 4-digit admin code to unlock the control room.')
        return
      }

      if (data.status === 'invalidAdminCode') {
        setMessage(data.message || 'Invalid code. Try again.')
        return
      }

      if (data.status === 'ok') {
        setIsAdmin(!!data.isAdmin)
        setStep('done')
        setMessage('You’re in. Choose where to go next.')
        return
      }

      if (data.error) {
        setMessage(data.error)
      }
    } catch (err) {
      setMessage('Something went out of bounds. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToBrackets = () => {
    window.location.href = '/bracket' // adjust if your route is different
  }

  const handleGoToAdmin = () => {
    window.location.href = '/admin' // adjust to your actual admin route
  }

  const showEmailStep = step === 'email'
  const showAdminCodeStep = step === 'adminCode'
  const showDoneStep = step === 'done'

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <h1 className="text-2xl font-semibold text-center mb-2">
          March Madness Bracket Room
        </h1>
        <p className="text-sm text-slate-400 text-center mb-6">
          Enter your email to step onto the court.
        </p>

        {message && (
          <div className="mb-4 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
            {message}
          </div>
        )}

        {!showDoneStep && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {showEmailStep && (
              <>
                <label className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="you@example.com"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full mt-4 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {loading ? 'Checking roster…' : 'Enter Bracket'}
                </button>
              </>
            )}

            {showAdminCodeStep && (
              <>
                <label className="block text-sm font-medium mb-1">
                  Admin 4-digit code
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  required
                  value={adminCode}
                  onChange={e => setAdminCode(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="••••"
                />
                <button
                  type="submit"
                  disabled={loading || adminCode.length !== 4}
                  className="w-full mt-4 rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                >
                  {loading ? 'Verifying…' : 'Unlock Admin Options'}
                </button>
              </>
            )}
          </form>
        )}

        {showDoneStep && (
          <div className="mt-4 space-y-3">
            <button
              onClick={handleGoToBrackets}
              className="w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              Go to your brackets
            </button>


<button
  onClick={() => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  }}
  style={{
    marginTop: 12,
    padding: "10px 16px",
    background: "#1e293b",
    borderRadius: 8,
    border: "1px solid #334155",
    color: "white",
    fontSize: 16,
    cursor: "pointer",
    width: "100%",
  }}
>
  Share Bracket Link
</button>


            {isAdmin && (
              <button
                onClick={handleGoToAdmin}
                className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm font-medium hover:bg-slate-700"
              >
                Go to admin page
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
