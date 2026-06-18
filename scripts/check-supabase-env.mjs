import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local — copy from .env.local.example");
    process.exit(1);
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.SUPABASE_URL?.trim() ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

console.log("Checking .env.local (secrets are not printed)...\n");

if (!url) {
  console.error("FAIL: SUPABASE_URL is empty");
  process.exit(1);
}
if (url.includes("YOUR_PROJECT_REF") || url.includes("your-project")) {
  console.error("FAIL: SUPABASE_URL still has placeholder text");
  process.exit(1);
}
if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
  console.error("FAIL: SUPABASE_URL should look like https://xxxxx.supabase.co");
  console.error("     Got host:", url.replace(/^https:\/\//, "").split("/")[0]);
  process.exit(1);
}

if (!key) {
  console.error("FAIL: SUPABASE_SERVICE_ROLE_KEY is empty");
  process.exit(1);
}
if (key.includes("your-service-role") || key === "your-service-role-key") {
  console.error("FAIL: SUPABASE_SERVICE_ROLE_KEY still has placeholder text");
  process.exit(1);
}
if (!key.startsWith("eyJ") && !key.startsWith("sb_secret_")) {
  console.error("FAIL: SERVICE_ROLE_KEY should start with eyJ or sb_secret_");
  process.exit(1);
}

console.log("OK: SUPABASE_URL format looks valid");
console.log("OK: SERVICE_ROLE_KEY is set (length:", key.length, "chars)");
console.log("\nTesting network connection to Supabase...");

try {
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });
  console.log("OK: Connected — HTTP", res.status);
  if (res.status === 401) {
    console.error("\nFAIL: 401 Unauthorized — service role key is wrong or expired");
    process.exit(1);
  }
  console.log("\nYou can run: node scripts/migrate-excel-to-supabase.mjs");
} catch (err) {
  console.error("\nFAIL: Could not reach Supabase (fetch failed)");
  console.error("Common fixes:");
  console.error("  1. Check your internet connection");
  console.error("  2. Confirm project is not paused in Supabase dashboard");
  console.error("  3. Disable VPN/proxy temporarily");
  console.error("  4. Verify SUPABASE_URL has no typos or trailing spaces");
  if (err?.cause?.message) console.error("\nDetail:", err.cause.message);
  else if (err?.message) console.error("\nDetail:", err.message);
  process.exit(1);
}
