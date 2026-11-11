
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const BUCKET = "college-logos";

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams?group=50&limit=1000";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase URL or server-only service role/secret key. Check .env.local."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExtension(url, contentType) {
  const pathname = new URL(url).pathname.toLowerCase();

  if (pathname.endsWith(".svg")) return "svg";
  if (pathname.endsWith(".webp")) return "webp";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "jpg";
  if (pathname.endsWith(".gif")) return "gif";

  if (contentType?.includes("svg")) return "svg";
  if (contentType?.includes("webp")) return "webp";
  if (contentType?.includes("jpeg")) return "jpg";
  if (contentType?.includes("gif")) return "gif";

  return "png";
}

async function downloadLogo(team) {
  const teamId = String(team.id);

  const feedLogo = Array.isArray(team.logos)
    ? team.logos.find((logo) => logo?.href)?.href
    : null;

  const urls = [
    feedLogo,
    `https://a.espncdn.com/i/teamlogos/ncaa/500/${teamId}.png`,
  ].filter(Boolean);

  for (const url of [...new Set(urls)]) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 BracketBoss Logo Importer",
        },
      });

      if (!response.ok) continue;

      const contentType =
        response.headers.get("content-type") || "image/png";

      if (!contentType.startsWith("image/")) continue;

      const buffer = Buffer.from(await response.arrayBuffer());

      if (!buffer.length) continue;

      return {
        buffer,
        contentType,
        extension: getExtension(url, contentType),
      };
    } catch {
      // Try the next available logo URL.
    }
  }

  return null;
}

async function main() {
  console.log("Fetching Division I men's basketball teams from ESPN...");

  const response = await fetch(ESPN_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 BracketBoss Logo Importer",
    },
  });

  if (!response.ok) {
    throw new Error(`ESPN request failed: ${response.status}`);
  }

  const data = await response.json();

  const teams =
    data?.sports?.[0]?.leagues?.[0]?.teams
      ?.map((entry) => entry?.team)
      .filter((team) => team?.id && team?.displayName) || [];

  if (!teams.length) {
    throw new Error(
      "No teams were found in ESPN's response. The response format may have changed."
    );
  }

  console.log(`Found ${teams.length} teams. Starting logo uploads...`);

  const rows = [];
  const missingLogos = [];
  const usedSlugs = new Set();

  for (let index = 0; index < teams.length; index++) {
    const team = teams[index];
    const espnId = String(team.id);
    const schoolName = team.displayName.trim();

    let slug = slugify(schoolName) || `team-${espnId}`;

    // Keep slugs unique even if two schools normalize to the same name.
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${espnId}`;
    }
    usedSlugs.add(slug);

    const row = {
      school_name: schoolName,
      display_name: team.shortDisplayName || team.name || schoolName,
      abbreviation: team.abbreviation || null,
      slug,
      espn_id: espnId,
      sport: "mens-college-basketball",
      division: "D1",
      primary_color: team.color ? `#${team.color}` : null,
      secondary_color: team.alternateColor
        ? `#${team.alternateColor}`
        : null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const logo = await downloadLogo(team);

    if (logo) {
      const storagePath = `${slug}.${logo.extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, logo.buffer, {
          contentType: logo.contentType,
          upsert: true,
        });

      if (uploadError) {
        console.error(
          `  Logo upload failed for ${schoolName}: ${uploadError.message}`
        );
        missingLogos.push(schoolName);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(storagePath);

        row.logo_url = publicUrlData.publicUrl;
        row.storage_path = storagePath;
      }
    } else {
      missingLogos.push(schoolName);
      console.warn(`  No logo found for ${schoolName}`);
    }

    rows.push(row);

    console.log(
      `[${index + 1}/${teams.length}] ${schoolName}${
        row.logo_url ? " - logo uploaded" : " - logo missing"
      }`
    );
  }

  console.log("\nSaving team records to college_logos...");

  const batchSize = 100;

  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);

    const { error } = await supabase
      .from("college_logos")
      .upsert(batch, { onConflict: "slug" });

    if (error) {
      throw new Error(
        `Database upsert failed for batch starting at ${start}: ${error.message}`
      );
    }

    console.log(
      `Saved database records ${start + 1}-${start + batch.length} of ${rows.length}`
    );
  }

  console.log("\n======================================");
  console.log("COLLEGE LOGO IMPORT FINISHED");
  console.log("======================================");
  console.log(`Teams processed: ${rows.length}`);
  console.log(`Logos uploaded: ${rows.length - missingLogos.length}`);
  console.log(`Logos missing or failed: ${missingLogos.length}`);

  if (missingLogos.length) {
    console.log("\nTeams needing logo attention:");
    missingLogos.forEach((name) => console.log(`- ${name}`));
  }

  console.log("\nYour college_logos library is populated.");
}

main().catch((error) => {
  console.error("\nIMPORT FAILED:");
  console.error(error);
  process.exit(1);
});
