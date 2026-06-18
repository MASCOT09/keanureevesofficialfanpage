import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "celebrity-site.xlsx");
const wb = XLSX.readFile(filePath);

for (const name of wb.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name]);
  console.log(`${name}: ${rows.length} rows`);
}
