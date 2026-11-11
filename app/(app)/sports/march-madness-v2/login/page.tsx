
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarchMadnessLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  // Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSetPasscodeModal, setShowSetPasscodeModal] = useState(false);

  // Create Account fields
  const [newName, setNewName] = useState("");
  const [newPasscode, setNewPasscode] = useState("");

  // Set Initial Passcode fields
  const [initialPasscode, setInitialPasscode] = useState("");

  // -----------------------------------------------------
  // LOGIN
  // -----------------------------------------------------
  async function handleLogin() {
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPasscode = passcode.trim();

    if (!normalizedEmail || !trimmedPasscode) {
      setError("Please enter both email and passcode.");
      return;
    }

    const res = await fetch("/api/login-or-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        passcode: trimmedPasscode,
      }),
    });

    const json = await res.json();

    if (!json.success) {
      if (json.error === "No user found") {
        setError("It looks like you don’t have a passcode yet — create your setup first.");
        setShowCreateModal(true);
      } else if (json.error === "Passcode not set") {
        setError("Your email is in our system, but you have not set a passcode yet.");
        setShowSetPasscodeModal(true);
      } else {
        setError(json.error || "Login failed.");
      }
      return;
    }

    const user = json.user;

    // Always store bracketUser with a normalized email
    localStorage.setItem(
      "bracketUser",
      JSON.stringify({
        user_id: user.user_id,
        email: normalizedEmail,
        name: user.name,
        username: user.username ?? null,
        is_admin: user.is_admin ?? false,
      })
    );

    router.push("/sports/march-madness-v2");
  }

  // -----------------------------------------------------
  // FORGOT PASSCODE
  // -----------------------------------------------------
  function handleForgotPasscode() {
    setError("");

    if (!email.trim()) {
      setError("Enter your email first so we know who needs help.");
      return;
    }

    setShowResetModal(true);
  }

  // -----------------------------------------------------
  // CREATE ACCOUNT
  // -----------------------------------------------------
  async function handleCreateAccount() {
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = newName.trim();
    const trimmedPasscode = newPasscode.trim();

    if (!trimmedName || !normalizedEmail || !trimmedPasscode) {
      setError("All fields are required.");
      return;
    }

    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: trimmedName,
        email: normalizedEmail,
        passcode: trimmedPasscode,
      }),
    });

    const json = await res.json();

    if (!json.success) {
      setError(json.error || "Unable to create account.");
      return;
    }

    const user = json.user;

    // Always store bracketUser with a normalized email
    localStorage.setItem(
      "bracketUser",
      JSON.stringify({
        user_id: user.user_id,
        email: normalizedEmail,
        name: user.name,
        username: user.username ?? null,
        is_admin: user.is_admin ?? false,
      })
    );

    setShowCreateModal(false);
    router.push("/sports/march-madness-v2");
  }

  // -----------------------------------------------------
  // SET INITIAL PASSCODE
  // -----------------------------------------------------
  async function handleSetInitialPasscode() {
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPasscode = initialPasscode.trim();

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!trimmedPasscode) {
      setError("Please enter a passcode.");
      return;
    }

    const res = await fetch("/api/set-passcode-initial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        passcode: trimmedPasscode,
      }),
    });

    const json = await res.json();

    if (!json.success) {
      setError(json.error || "Unable to set passcode.");
      return;
    }

    const user = json.user;

    // Always store bracketUser with a normalized email
    localStorage.setItem(
      "bracketUser",
      JSON.stringify({
        user_id: user.user_id,
        email: normalizedEmail,
        name: user.name,
        username: user.username ?? null,
        is_admin: user.is_admin ?? false,
      })
    );

    setShowSetPasscodeModal(false);
    router.push("/sports/march-madness-v2");
  }

  // -----------------------------------------------------
  // EMAIL RESET OPTIONS
  // -----------------------------------------------------
  function sendViaEmailApp() {
    const normalizedEmail = email.trim().toLowerCase();
    const commissionerEmail = "adamjpwestsr@gmail.com";

    const subject = encodeURIComponent("March Madness Passcode Reset Request");
    const body = encodeURIComponent(
      `Hello Commissioner,\n\nI need help resetting my March Madness passcode.\n\nMy email: ${normalizedEmail}\n\nThank you!`
    );

    window.location.href = `mailto:${commissionerEmail}?subject=${subject}&body=${body}`;
    setShowResetModal(false);
  }

  function sendViaGmail() {
    const normalizedEmail = email.trim().toLowerCase();
    const commissionerEmail = "adamjpwestsr@gmail.com";

    const subject = encodeURIComponent("March Madness Passcode Reset Request");
    const body = encodeURIComponent(
      `Hello Commissioner,\n\nI need help resetting my March Madness passcode.\n\nMy email: ${normalizedEmail}\n\nThank you!`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${commissionerEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
    setShowResetModal(false);
  }

  // -----------------------------------------------------
  // UI / JSX
  // -----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 py-20 relative">

      {/* RESET PASSCODE MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#11182A] border border-blue-500/40 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_25px_rgba(59,130,246,0.4)]">
            <h2 className="text-xl font-bold text-blue-400 mb-3 text-center">
              Reset Passcode
            </h2>
            <p className="text-slate-300 text-sm mb-4 text-center">
              Choose how you'd like to send your passcode reset request.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={sendViaGmail}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
              >
                Open Gmail
              </button>

              <button
                onClick={sendViaEmailApp}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
              >
                Open Email App
              </button>

              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-bold rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SET INITIAL PASSCODE MODAL */}
      {showSetPasscodeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#11182A] border border-green-400/40 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_25px_rgba(34,197,94,0.4)]">
            <h2 className="text-xl font-bold text-green-400 mb-3 text-center">
              Set Your Passcode
            </h2>
            <p className="text-slate-300 text-sm mb-4 text-center">
              Your email is in our system, but you haven't set a passcode yet.
            </p>

            <input
              className="p-3 rounded-lg bg-white/10 w-full border border-white/20 mb-4"
              placeholder="Create Passcode"
              value={initialPasscode}
              onChange={(e) => setInitialPasscode(e.target.value)}
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSetInitialPasscode}
                className="px-4 py-2 bg-green-400 text-slate-900 font-bold rounded-lg hover:bg-green-300 transition"
              >
                Set Passcode
              </button>

              <button
                onClick={() => setShowSetPasscodeModal(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-bold rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#11182A] border border-yellow-400/40 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_25px_rgba(234,179,8,0.4)]">
            <h2 className="text-xl font-bold text-yellow-400 mb-3 text-center">
              Create Your Account
            </h2>
            <p className="text-slate-300 text-sm mb-4 text-center">
              Enter your details to join the tournament.
            </p>

            <input
              className="p-3 rounded-lg bg-white/10 w-full border border-white/20 mb-3"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              className="p-3 rounded-lg bg-white/10 w-full border border-white/20 mb-3"
              placeholder="Email"
              value={email}
              readOnly
            />

            <input
              className="p-3 rounded-lg bg-white/10 w-full border border-white/20 mb-4"
              placeholder="Create Passcode"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
            />

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCreateAccount}
                className="px-4 py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-300 transition"
              >
                Create Account
              </button>

              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-bold rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN CARD */}
      <div className="max-w-md w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
        <h1 className="text-3xl font-bold text-yellow-400 text-center mb-6">
          March Madness Login
        </h1>

        {error && (
          <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
        )}

        <input
          className="p-3 rounded-lg bg-white/10 w-full border border-white/20 mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="p-3 rounded-lg bg-white/10 w-full border border-white/20 mb-4"
          placeholder="Passcode"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
        />

        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className="w-4 h-4 accent-yellow-400 cursor-pointer"
          />
          <span className="text-slate-300 text-sm">Remember Me</span>
        </div>

        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-300 w-full"
        >
          Login
        </button>

        <p
          className="text-blue-400 text-sm mt-3 text-center underline cursor-pointer hover:text-sky-400"
          onClick={handleForgotPasscode}
        >
          Forgot Passcode?
        </p>

        <p className="text-slate-400 text-sm mt-4 text-center">
          New user? Create your account to join the tournament.
        </p>

        <div className="mt-6 p-4 bg-[#0A0F1F] border border-blue-500/30 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.25)]">
          <h3 className="text-blue-400 font-bold text-sm mb-1">Commissioner Contact</h3>
          <p className="text-slate-300 text-xs">
            Email: <span className="text-yellow-400">adamjpwestsr@gmail.com</span>
          </p>
          <p className="text-slate-400 text-xs mt-1">
            For passcode issues or bracket access help.
          </p>
        </div>
      </div>
    </div>
  );
}
