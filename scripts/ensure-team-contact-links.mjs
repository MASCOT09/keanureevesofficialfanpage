import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "..", "data", "celebrity-site.xlsx");

const teamDefaults = [
  {
    platform: "whatsapp",
    label: "WhatsApp",
    url: "https://wa.me/1987654321",
    sort_order: 10,
  },
  {
    platform: "zangi",
    label: "Zangi",
    url: "https://zangi.com/2173809852",
    sort_order: 11,
  },
  {
    platform: "telegram",
    label: "Telegram",
    url: "https://t.me/keanufanteam",
    sort_order: 12,
  },
];

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets.contact_links;
const rows = XLSX.utils.sheet_to_json(sheet);

const now = new Date().toISOString();

for (const row of rows) {
  if (!row.recipient) {
    row.recipient = "keanu";
  }
}

for (const defaults of teamDefaults) {
  const exists = rows.some(
    (row) => row.recipient === "team" && row.platform === defaults.platform
  );

  if (!exists) {
    rows.push({
      id: randomUUID(),
      platform: defaults.platform,
      recipient: "team",
      label: defaults.label,
      url: defaults.url,
      is_active: true,
      sort_order: defaults.sort_order,
      created_at: now,
    });
  }
}

const updated = XLSX.utils.json_to_sheet(rows);
workbook.Sheets.contact_links = updated;
XLSX.writeFile(workbook, filePath);

console.log("Updated contact_links:");
console.log(JSON.stringify(rows, null, 2));
