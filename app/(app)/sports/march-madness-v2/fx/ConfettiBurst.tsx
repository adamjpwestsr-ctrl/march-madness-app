"use client";

import confetti from "canvas-confetti";

export default function ConfettiBurst({
  type = "default",
}: {
  type?: "default" | "champion" | "subtle";
}) {
  const fire = () => {
    switch (type) {
      case "champion":
        // Big championship celebration
        confetti({
          particleCount: 300,
          spread: 120,
          startVelocity: 45,
          scalar: 1.4,
          origin: { y: 0.6 },
        });

        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            startVelocity: 35,
            scalar: 1.2,
            origin: { y: 0.4 },
          });
        }, 400);

        break;

      case "subtle":
        // Light sprinkle for round completions
        confetti({
          particleCount: 80,
          spread: 60,
          startVelocity: 25,
          scalar: 0.8,
          origin: { y: 0.7 },
        });
        break;

      default:
        // Standard burst
        confetti({
          particleCount: 150,
          spread: 90,
          startVelocity: 35,
          scalar: 1.0,
          origin: { y: 0.6 },
        });
        break;
    }
  };

  return (
    <button
      onClick={fire}
      className="hidden"
      aria-hidden="true"
    />
  );
}
