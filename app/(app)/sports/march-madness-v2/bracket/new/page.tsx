"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/components/ErrorMessage";
import JerseyAvatar from "@/components/JerseyAvatar";

export default function NewBracketV2Page() {
  const router = useRouter();

  // Logged-in user
  const [user, setUser] = useState<any>(null);

  // Form fields
  const [email, setEmail] = useState("");        // 🔥 added
  const [userName, setUserName] = useState("");
  const [username, setUsername] = useState(""); // optional
  const [bracketName, setBracketName] = useState("");
  const [tiebreakerScore, setTiebreakerScore] = useState("");
  const [passcode, setPasscode] = useState(""); // still needed for bracket editing
  const [error, setError] = useState("");

  // Avatar
  const [avatarColor, setAvatarColor] = useState("blue");
  const [avatarNumber, setAvatarNumber] = useState("00");

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bracketUser");
    if (!stored) {
      router.push("/sports/march-madness-v2"); // force login
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);

      // 🔥 restore email
      if (parsed.email) setEmail(parsed.email);

      // Pre-fill name + username if available
      if (parsed.name) setUserName(parsed.name);
      if (parsed.username) setUsername(parsed.username);
    } catch {
      router.push("/sports/march-madness-v2");
    }
  }, [router]);

  // Create bracket
  const createBracket = async () => {
    setError("");

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const res = await fetch("/api/march-madness-v2/create", {
      method: "POST",
      body: JSON.stringify({
        user_name: userName.trim(),
        username: username.trim() || null,
        email: email, // 🔥 restored email
        passcode: passcode.trim(), // used for editing brackets
        bracket_name: bracketName.trim(),
        tiebreaker_score: tiebreakerScore.trim(),
        icon: {
          type: "jersey",
          color: avatarColor,
          number: avatarNumber,
        },
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Something went wrong.");
      return;
    }

    router.push(
      `/sports/march-madness-v2/bracket/edit/${json.bracket.bracket_id}`
    );
  };

  const isValid =
    userName.trim() &&
    bracketName.trim() &&
    tiebreakerScore.trim() &&
    passcode.trim();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold text-yellow-400 mb-8">
          Create Your Bracket
        </h1>

        <ErrorMessage message={error} />

        <div className="flex flex-col gap-4">

          {/* Email (auto-filled) */}
          <input
            className="p-3 rounded-lg bg-white/10 w-full border border-white/20"
            placeholder="Email (auto-filled)"
            value={email}
            readOnly
          />

          {/* Name */}
          <input
            className="p-3 rounded-lg bg-white/10 w-full border border-white/20"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />

          {/* Optional Username */}
          <input
            className="p-3 rounded-lg bg-white/10 w-full border border-white/20"
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Passcode */}
          <input
            className="p-3 rounded-lg bg-white/10 w-full border border-white/20"
            placeholder="Passcode (same one used at login)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
          />

          {/* Bracket Name */}
          <input
            className="p-3 rounded-lg bg-white/10 w-full border border-white/20"
            placeholder="Bracket Name"
            value={bracketName}
            onChange={(e) => setBracketName(e.target.value)}
          />

          {/* Tiebreaker */}
          <input
            className="p-3 rounded-lg bg-white/10 w-full border border-white/20"
            placeholder="Championship Game Total Score"
            value={tiebreakerScore}
            onChange={(e) => setTiebreakerScore(e.target.value)}
          />

          {/* Avatar Picker */}
          <div className="bg-white/10 p-4 rounded-lg border border-white/20">
            <p className="mb-2 font-semibold">Choose Your Jersey Avatar</p>

            <div className="flex gap-4 items-center">
              <JerseyAvatar
                color={avatarColor}
                number={avatarNumber}
                size={64}
              />

              <div className="flex flex-col gap-2">
                <select
                  className="p-2 rounded bg-slate-800 text-white border border-white/20"
                  value={avatarColor}
                  onChange={(e) => setAvatarColor(e.target.value)}
                >
                  <option value="blue">Blue</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                  <option value="black">Black</option>
                  <option value="white">White</option>
                </select>

                <input
                  className="p-2 rounded bg-white/10 border border-white/20"
                  placeholder="Number (00–99)"
                  value={avatarNumber}
                  onChange={(e) => setAvatarNumber(e.target.value)}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={createBracket}
            disabled={!isValid}
            className={`px-6 py-3 bg-yellow-400 text-slate-900 font-bold rounded-lg transition ${
              isValid
                ? "hover:bg-yellow-300 cursor-pointer"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            Create Bracket
          </button>
        </div>
      </div>
    </div>
  );
}
