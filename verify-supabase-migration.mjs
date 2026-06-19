import fs from "fs";
import path from "path";

const projectRoot = process.cwd();

const ROUTE_HANDLER_DIRS = [
  "app/api",
];

const SERVER_COMPONENT_DIRS = [
  "app/(app)",
  "app/admin",
];

const forbiddenInRouteHandlers = [
  "createServerClient",
  "@supabase/ssr",
  "SUPABASE_SERVICE_ROLE_KEY",
  "cookies: {", // fake cookie adapter
];

const requiredInRouteHandlers = [
  "createRouteHandlerClient",
];

const requiredInServerComponents = [
  "@supabase/ssr",
  "createServerClient",
];

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, fileList);
    else if (file.endsWith(".ts") || file.endsWith(".tsx")) fileList.push(full);
  }
  return fileList;
}

function readFile(file) {
  return fs.readFileSync(file, "utf8");
}

function isRouteHandler(file) {
  return ROUTE_HANDLER_DIRS.some((dir) => file.includes(dir));
}

function isServerComponent(file) {
  return SERVER_COMPONENT_DIRS.some((dir) => file.includes(dir));
}

function checkRouteHandler(file, content) {
  const errors = [];

  // Must use createRouteHandlerClient
  if (!requiredInRouteHandlers.some((req) => content.includes(req))) {
    errors.push("❌ Missing createRouteHandlerClient");
  }

  // Must NOT use forbidden patterns
  forbiddenInRouteHandlers.forEach((bad) => {
    if (content.includes(bad)) {
      errors.push(`❌ Forbidden in Route Handler: ${bad}`);
    }
  });

  return errors;
}

function checkServerComponent(file, content) {
  const errors = [];

  // Must use SSR client
  if (!requiredInServerComponents.some((req) => content.includes(req))) {
    errors.push("❌ Missing SSR import or createServerClient");
  }

  // Must NOT use Route Handler client
  if (content.includes("createRouteHandlerClient")) {
    errors.push("❌ Route Handler client used in Server Component");
  }

  return errors;
}

console.log("🔍 Running Supabase migration verification...\n");

const files = walk(projectRoot);
let totalErrors = 0;

files.forEach((file) => {
  const content = readFile(file);
  let errors = [];

  if (isRouteHandler(file)) {
    errors = checkRouteHandler(file, content);
  } else if (isServerComponent(file)) {
    errors = checkServerComponent(file, content);
  }

  if (errors.length > 0) {
    totalErrors += errors.length;
    console.log(`\n🚨 Issues in: ${file}`);
    errors.forEach((e) => console.log("   " + e));
  }
});

if (totalErrors === 0) {
  console.log("\n🎉 All Supabase migration checks passed! No issues found.");
} else {
  console.log(`\n⚠️ Found ${totalErrors} issues. Review the above files.`);
}
