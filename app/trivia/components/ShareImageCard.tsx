"use client";

import { useRef, useState } from "react";

const CTAS = [
  "Think you can survive 60 seconds? Prove it.",
  "Beat this score or stay on the sidelines.",
  "If you're brave enough, step into the arena.",
  "Come take your L like a champion.",
  "Your turn, hotshot.",
];

export default function ShareImageCard({
  score,
  displayName,
}: {
  score: number;
  displayName: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const cta = CTAS[Math.floor(Math.random() * CTAS.length)];

    canvas.width = 1080;
    canvas.height = 1920;

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "bold 80px Inter";
    ctx.fillText("Sports Trivia Blitz", 80, 200);

    ctx.font = "bold 140px Inter";
    ctx.fillStyle = score > 0 ? "#22c55e" : "#f87171";
    ctx.fillText(`${score} pts`, 80, 400);

    ctx.font = "bold 60px Inter";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(displayName, 80, 520);

    ctx.font = "48px Inter";
    ctx.fillStyle = "#f97316";
    wrapText(ctx, cta, 80, 700, 900, 60);

    ctx.font = "40px Inter";
    ctx.fillStyle = "#3b82f6";
    ctx.fillText("Play now:", 80, 1100);

    ctx.font = "bold 48px Inter";
    ctx.fillStyle = "#3b82f6";
    ctx.fillText("bracketboss-theta.vercel.app/trivia", 80, 1180);

    const url = canvas.toDataURL("image/png");
    setImageUrl(url);
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button
        onClick={generate}
        style={{
          padding: "10px 20px",
          borderRadius: 999,
          border: "none",
          background: "#f97316",
          color: "#020617",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Generate Share Image
      </button>

      {imageUrl && (
        <div style={{ marginTop: 16 }}>
          <img
            src={imageUrl}
            alt="Share Card"
            style={{
              width: "100%",
              borderRadius: 16,
              border: "1px solid #1f2937",
            }}
          />
          <a
            href={imageUrl}
            download="trivia-score.png"
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "8px 16px",
              borderRadius: 999,
              background: "#3b82f6",
              color: "#020617",
              fontWeight: 700,
            }}
          >
            Download Image
          </a>
        </div>
      )}
    </div>
  );
}
