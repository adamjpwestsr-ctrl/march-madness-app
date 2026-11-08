const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// Keywords to detect March Madness files
const KEYWORDS = [
  "march-madness",
  "marchmadness",
  "mm_",
  "bracket",
  "tournament",
];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scan(full);
    } else {
      const content = fs.readFileSync(full, "utf8");

      if (KEYWORDS.some((k) => content.toLowerCase().includes(k))) {
        const stats = fs.statSync(full);

        const created = stats.birthtime;
        const updated = stats.mtime;

        console.log(`
📄 FILE: ${full}
   • Created: ${created.toLocaleString()}
   • Updated: ${updated.toLocaleString()}
`);
      }
    }
  }
}

console.log("🔍 March Madness File Audit (with timestamps)\n");
scan(ROOT);
console.log("\n✅ Audit Complete");
