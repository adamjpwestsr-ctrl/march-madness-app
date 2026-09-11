import { createCanvas, loadImage } from "canvas";

export type BracketShareImageInput = {
  userName: string;
  groupName: string | null;
  seasonYear: number;
  championTeam: {
    name: string;
    logo_url: string;
    seed: number;
  };
};

/**
 * Generates a branded shareable PNG for a user's bracket.
 * Returns a Buffer you can send as an image response.
 */
export async function generateBracketShareImage({
  userName,
  groupName,
  seasonYear,
  championTeam,
}: BracketShareImageInput) {
  // Canvas size (Twitter/X, IG-friendly)
  const width = 1200;
  const height = 630;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0f172a"; // slate-900
  ctx.fillRect(0, 0, width, height);

  // Gold accent bar
  ctx.fillStyle = "#facc15"; // yellow-400
  ctx.fillRect(0, 0, width, 12);

  // Title
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 60px 'Arial'";
  ctx.textAlign = "center";
  ctx.fillText("March Madness", width / 2, 120);

  // Season
  ctx.fillStyle = "#e2e8f0"; // slate-200
  ctx.font = "bold 36px 'Arial'";
  ctx.fillText(`Season ${seasonYear}`, width / 2, 180);

  // User name
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px 'Arial'";
  ctx.fillText(userName, width / 2, 260);

  // Group name
  if (groupName) {
    ctx.fillStyle = "#94a3b8"; // slate-400
    ctx.font = "bold 32px 'Arial'";
    ctx.fillText(`Group: ${groupName}`, width / 2, 310);
  }

  // Champion logo
  try {
    const logo = await loadImage(championTeam.logo_url);
    const logoSize = 220;
    ctx.drawImage(
      logo,
      width / 2 - logoSize / 2,
      350,
      logoSize,
      logoSize
    );
  } catch {
    // fallback circle
    ctx.fillStyle = "#334155"; // slate-700
    ctx.beginPath();
    ctx.arc(width / 2, 460, 110, 0, Math.PI * 2);
    ctx.fill();
  }

  // Champion name
  ctx.fillStyle = "#facc15";
  ctx.font = "bold 50px 'Arial'";
  ctx.fillText(championTeam.name, width / 2, 620);

  return canvas.toBuffer("image/png");
}
