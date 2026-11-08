"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type InlineRegistrationProps = {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  userName: string;
  setUserName: Dispatch<SetStateAction<string>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  passcode: string;
  setPasscode: Dispatch<SetStateAction<string>>;
  onRegistered: (user: {
    name: string;
    username: string | null;
    email: string;
  }) => void;
};

export default function InlineRegistration({
  email,
  setEmail,
  userName,
  setUserName,
  username,
  setUsername,
  passcode,
  setPasscode,
  onRegistered,
}: InlineRegistrationProps) {
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");
  const [error, setError] = useState("");

  // CHECK IF USER EXISTS
  const checkEmailExists = async (emailValue: string) => {
    if (!emailValue.trim()) return;

    setCheckingEmail(true);

    try {
      const res = await fetch("/api/check-user", {
        method: "POST",
        body: JSON.stringify({ email: emailValue.trim() }),
      });

      const json = await res.json();

      setUserExists(json.exists);

      if (json.exists) {
        if (json.name) setUserName(json.name);
        if (json.username) setUsername(json.username);
      }

      if (json.exists && json.needsPasscode) {
        setShowPasscodeSetup(true);
      }
    } catch (err) {
      console.error("Email check failed:", err);
      setError("Unable to check email. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  // REGISTER USER
  const registerUser = async () => {
    setError("");

    try {
      const res = await fetch("/api/register-user", {
        method: "POST",
        body: JSON.stringify({
          name: userName.trim(),
          username: username.trim() || null,
          email: email.trim(),
          passcode: passcode.trim(),
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Registration failed.");
        return;
      }

      setShowRegisterModal(false);
      setUserExists(true);

      onRegistered({
        name: userName.trim(),
        username: username.trim() || null,
        email: email.trim(),
      });
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Registration failed. Please try again.");
    }
  };

  // SAVE PASSCODE FOR EXISTING USER
  const savePasscode = async () => {
    try {
      const res = await fetch("/api/set-passcode", {
        method: "POST",
        body: JSON.stringify({
          email,
          private_password: newPasscode.trim(),
        }),
      });

      const json = await res.json();

      if (!json.success) {
        alert(json.error || "Unable to save passcode.");
        return;
      }

      setShowPasscodeSetup(false);
      setUserExists(true);
    } catch (err) {
      console.error("Passcode setup failed:", err);
      alert("Unable to save passcode. Please try again.");
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <input
          className="p-3 rounded-lg bg-white/10 w-full border border-white/20"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={(e) => checkEmailExists(e.target.value)}
        />

        {checkingEmail && (
          <p className="text-yellow-400 text-sm mt-1">
            Checking email...
          </p>
        )}

        {userExists === false && (
          <p className="text-red-400 text-sm mt-1">
            Email not found. Please register to proceed.
            <button
              className="ml-2 text-yellow-400 underline"
              onClick={() => setShowRegisterModal(true)}
            >
              Register
            </button>
          </p>
        )}

        {userExists === true && (
          <p className="text-green-400 text-sm mt-1">
            Email found — you’re good to go.
          </p>
        )}
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg w-96 border border-white/20">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Register New User
            </h2>

            {error && (
              <p className="text-red-400 text-sm mb-2">{error}</p>
            )}

            <input
              className="p-2 rounded bg-white/10 w-full border border-white/20 mb-3"
              placeholder="Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <input
              className="p-2 rounded bg-white/10 w-full border border-white/20 mb-3"
              placeholder="Username (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="p-2 rounded bg-white/10 w-full border border-white/20 mb-3"
              placeholder="Email"
              value={email}
              readOnly
            />

            <input
              className="p-2 rounded bg-white/10 w-full border border-white/20 mb-3"
              placeholder="Passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />

            <button
              className="px-4 py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-300 w-full"
              onClick={registerUser}
            >
              Register
            </button>
          </div>
        </div>
      )}

      {showPasscodeSetup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-lg w-96 border border-white/20">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Set Your Passcode
            </h2>

            <p className="text-slate-300 text-sm mb-4">
              You need a passcode to edit your brackets. Choose a 4–6 digit code.
            </p>

            <input
              className="p-2 rounded bg-white/10 w-full border border-white/20 mb-3"
              placeholder="New Passcode"
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              maxLength={6}
            />

            <button
              className="px-4 py-2 bg-yellow-400 text-slate-900 font-bold rounded-lg hover:bg-yellow-300 w-full"
              onClick={savePasscode}
            >
              Save Passcode
            </button>
          </div>
        </div>
      )}
    </>
  );
}