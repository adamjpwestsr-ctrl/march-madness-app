import sharp from "sharp";

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
 * Uses Sharp (Vercel-compatible) instead of node-canvas.
 */
export async function generateBracketShareImage({
  userName,
  groupName,
  seasonYear,
  championTeam,
}: BracketShareImageInput) {
  // Load champion logo (fallback to blank if fails)
  let logoBuffer: Buffer | null = null;
  try {
    const res = await fetch(championTeam.logo_url);
    const raw = Buffer.from(await res.arrayBuffer());

    // Resize BEFORE composite (Sharp does not allow width/height in overlay)
    logoBuffer = await sharp(raw).resize(220, 220).toBuffer();
  } catch {
    logoBuffer = null;
  }

  // FIX: channels must be "rgba", not number 4
  const background = {
    create: {
      width: 1200,
      height: 630,
      channels: "rgba",
      background: "#0f172a", // slate-900
    },
  };

  // Compose text overlays using Sharp
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="12" fill="#facc15" />

      <text x="600" y="120" font-size="60" font-weight="bold" fill="#facc15" text-anchor="middle">
        March Madness
      </text>

      <text x="600" y="180" font-size="36" font-weight="bold" fill="#e2e8f0" text-anchor="middle">
        Season ${seasonYear}
      </text>

      <text x="600" y="260" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
        ${userName}
      </text>

      ${
        groupName
          ? `<text x="600" y="310" font-size="32" font-weight="bold" fill="#94a3b8" text-anchor="middle">
               Group: ${groupName}
             </text>`
          : ""
      }

      <text x="600" y="620" font-size="50" font-weight="bold" fill="#facc15" text-anchor="middle">
        ${championTeam.name}
      </text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svg);

  const composites: sharp.OverlayOptions[] = [
    { input: svgBuffer, top: 0, left: 0 },
  ];

  if (logoBuffer) {
    composites.push({
      input: logoBuffer,
      top: 350,
      left: 1200 / 2 - 110,
    });
  }

  // Final PNG
  const finalImage = await sharp(background)
    .composite(composites)
    .png()
    .toBuffer();

  return finalImage;
}
