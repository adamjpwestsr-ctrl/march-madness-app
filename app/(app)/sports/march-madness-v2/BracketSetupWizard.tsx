"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export default function BracketSetupWizard({
  onComplete,
}: {
  onComplete: (payload: { email: string; groupId: string | null }) => void;
}) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [groupMode, setGroupMode] = useState<"join" | "create" | null>(null);
  const [groupCode, setGroupCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const finish = () => {
    const payload = {
      email,
      groupId: groupMode === "join" ? groupCode : groupMode === "create" ? newGroupName : null,
    };
    onComplete(payload);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900/60 border border-white/10 rounded-xl p-8 shadow-xl backdrop-blur-md">
      {/* HEADER */}
      <h1 className="text-3xl font-extrabold text-yellow-400 text-center mb-6">
        March Madness Setup
      </h1>

      {/* STEP INDICATOR */}
      <div className="flex justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              step === s
                ? "bg-yellow-500 text-black"
                : "bg-slate-700 text-slate-300"
            )}
          >
            {s}
          </div>
        ))}
      </div>

      {/* STEP 1 — EMAIL ENTRY */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <p className="text-slate-300 text-center">
            Enter your email to begin your bracket.
          </p>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-white/10"
          />

          <button
            onClick={next}
            disabled={!email}
            className={cn(
              "w-full py-3 rounded-lg font-bold transition",
              email
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            )}
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2 — GROUP MODE */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <p className="text-slate-300 text-center">
            Join a group or create your own.
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setGroupMode("join");
                next();
              }}
              className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition"
            >
              Join a Group
            </button>

            <button
              onClick={() => {
                setGroupMode("create");
                next();
              }}
              className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition"
            >
              Create a Group
            </button>
          </div>

          <button
            onClick={back}
            className="text-slate-400 hover:text-slate-200 text-sm mt-2"
          >
            Back
          </button>
        </div>
      )}

      {/* STEP 3 — GROUP DETAILS */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          {groupMode === "join" && (
            <>
              <p className="text-slate-300 text-center">
                Enter your group code.
              </p>

              <input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                placeholder="GROUP123"
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-white/10"
              />
            </>
          )}

          {groupMode === "create" && (
            <>
              <p className="text-slate-300 text-center">
                Name your new group.
              </p>

              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="My Awesome Group"
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-white/10"
              />
            </>
          )}

          <button
            onClick={finish}
            disabled={
              groupMode === "join"
                ? !groupCode
                : groupMode === "create"
                ? !newGroupName
                : true
            }
            className={cn(
              "w-full py-3 rounded-lg font-bold transition",
              (groupMode === "join" && groupCode) ||
              (groupMode === "create" && newGroupName)
                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            )}
          >
            Finish & Create Bracket
          </button>

          <button
            onClick={back}
            className="text-slate-400 hover:text-slate-200 text-sm mt-2"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
