import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "..", "data", "celebrity-site.xlsx");

const workbook = XLSX.readFile(filePath);

const usersSheet = workbook.Sheets.users;
if (usersSheet) {
  const users = XLSX.utils.sheet_to_json(usersSheet);
  const updatedUsers = users.map((row) => ({
    ...row,
    membership_tier: row.membership_tier ?? "none",
    membership_status: row.membership_status ?? "none",
  }));
  workbook.Sheets.users = XLSX.utils.json_to_sheet(updatedUsers);
}

if (!workbook.Sheets.membership_applications) {
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet([]), "membership_applications");
}

XLSX.writeFile(workbook, filePath);
console.log("Membership columns and sheet added.");
