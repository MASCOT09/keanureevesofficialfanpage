/**
 * One-time import: copy rows from data/celebrity-site.xlsx into Supabase.
 *
 * Requires in .env.local (or environment):
 *   SUPABASE_URL=
 *   SUPABASE_SERVICE_ROLE_KEY=
 *
 * Usage: npm run migrate:supabase
 */
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "..", "data", "celebrity-site.xlsx");

const SHEET_TO_TABLE = {
  users: "app_users",
  site_settings: "site_settings",
  giveaways: "giveaways",
  giveaway_entries: "giveaway_entries",
  meet_greet_events: "meet_greet_events",
  meet_greet_registrations: "meet_greet_registrations",
  communities: "communities",
  contact_links: "contact_links",
  messages: "messages",
  notifications: "notifications",
  membership_applications: "membership_applications",
};

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
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

function normalizeRow(row) {
  const out = { ...row };
  if (typeof out.email === "string") out.email = out.email.toLowerCase();
  if ("is_active" in out) out.is_active = out.is_active === true || out.is_active === "true";
  if ("is_read" in out) out.is_read = out.is_read === true || out.is_read === "true";
  return out;
}

async function upsertTable(client, table, rows) {
  if (!rows.length) {
    console.log(`  skip ${table} (empty)`);
    return;
  }
  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize).map(normalizeRow);
    const { error } = await client.from(table).upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  console.log(`  ${table}: ${rows.length} row(s)`);
}

async function main() {
  loadEnvLocal();
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error("Excel file not found:", filePath);
    console.error("Run npm run seed first to create it.");
    process.exit(1);
  }

  const workbook = XLSX.readFile(filePath);
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Importing Excel → Supabase...\n");

  for (const [sheet, table] of Object.entries(SHEET_TO_TABLE)) {
    if (!workbook.SheetNames.includes(sheet)) {
      console.log(`  skip ${table} (sheet "${sheet}" missing)`);
      continue;
    }
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
    await upsertTable(client, table, rows);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
