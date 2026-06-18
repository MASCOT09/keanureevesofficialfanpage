import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

export const DATA_DIR = path.join(process.cwd(), "data");
export const WORKBOOK_PATH = path.join(DATA_DIR, "celebrity-site.xlsx");

export type SheetName =
  | "users"
  | "site_settings"
  | "giveaways"
  | "giveaway_entries"
  | "meet_greet_events"
  | "meet_greet_registrations"
  | "communities"
  | "contact_links"
  | "messages"
  | "notifications"
  | "membership_applications";

export class WorkbookWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkbookWriteError";
  }
}

export function workbookExists(): boolean {
  return fs.existsSync(WORKBOOK_PATH);
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sleepSync(ms: number) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    // brief pause for Windows file-lock retries
  }
}

function isLockError(err: unknown): boolean {
  if (!err || typeof err !== "object" || !("code" in err)) return false;
  const code = String((err as NodeJS.ErrnoException).code);
  return code === "EBUSY" || code === "EPERM" || code === "EACCES" || code === "ENOENT";
}

let cachedWorkbook: { mtimeMs: number; workbook: XLSX.WorkBook } | null = null;
let cachedSheets: { mtimeMs: number; sheets: Map<SheetName, unknown[]> } | null = null;

function getSheetCache(mtimeMs: number): Map<SheetName, unknown[]> {
  if (cachedSheets && cachedSheets.mtimeMs === mtimeMs) {
    return cachedSheets.sheets;
  }

  cachedSheets = { mtimeMs, sheets: new Map() };
  return cachedSheets.sheets;
}

function getWorkbookMtimeMs(): number {
  try {
    return fs.statSync(WORKBOOK_PATH).mtimeMs;
  } catch {
    return 0;
  }
}

export function invalidateWorkbookCache(): void {
  cachedWorkbook = null;
  cachedSheets = null;
}

function readWorkbook(): XLSX.WorkBook | null {
  if (!workbookExists()) return null;

  const mtimeMs = getWorkbookMtimeMs();
  if (cachedWorkbook && cachedWorkbook.mtimeMs === mtimeMs) {
    return cachedWorkbook.workbook;
  }

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const buffer = fs.readFileSync(WORKBOOK_PATH);
      const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
      cachedWorkbook = { mtimeMs, workbook };
      return workbook;
    } catch (err) {
      if (isLockError(err) && attempt < 3) {
        sleepSync(50 * (attempt + 1));
        continue;
      }
      return null;
    }
  }

  return null;
}

function assertWorkbookWritable(): void {
  if (!workbookExists()) return;

  try {
    const fd = fs.openSync(WORKBOOK_PATH, "r+");
    fs.closeSync(fd);
  } catch {
    throw new WorkbookWriteError(
      "Could not save the database. Close celebrity-site.xlsx if it is open in Excel or another app, then try again."
    );
  }
}

function writeWorkbookFile(workbook: XLSX.WorkBook): void {
  ensureDataDir();
  assertWorkbookWritable();

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const tempPath = path.join(DATA_DIR, `.celebrity-site-${process.pid}-${Date.now()}.tmp.xlsx`);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      fs.writeFileSync(tempPath, buffer);

      if (fs.existsSync(WORKBOOK_PATH)) {
        fs.copyFileSync(tempPath, WORKBOOK_PATH);
      } else {
        fs.renameSync(tempPath, WORKBOOK_PATH);
      }

      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      invalidateWorkbookCache();
      return;
    } catch (err) {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch {
        // ignore cleanup errors
      }

      if (isLockError(err) && attempt < 2) {
        sleepSync(80 * (attempt + 1));
        assertWorkbookWritable();
        continue;
      }

      throw new WorkbookWriteError(
        "Could not save the database. Close celebrity-site.xlsx if it is open in Excel or another app, then try again."
      );
    }
  }
}

export function readSheet<T extends object>(sheet: SheetName): T[] {
  const workbook = readWorkbook();
  if (!workbook) return [];

  const mtimeMs = getWorkbookMtimeMs();
  const sheetCache = getSheetCache(mtimeMs);
  const cached = sheetCache.get(sheet);
  if (cached) return cached as T[];

  const worksheet = workbook.Sheets[sheet];
  if (!worksheet) {
    sheetCache.set(sheet, []);
    return [];
  }

  const rows = XLSX.utils.sheet_to_json<T>(worksheet, { defval: null });
  sheetCache.set(sheet, rows);
  return rows;
}

export function readSheets<T extends object>(
  sheets: SheetName[]
): Partial<Record<SheetName, T[]>> {
  const result: Partial<Record<SheetName, T[]>> = {};
  for (const sheet of sheets) {
    result[sheet] = readSheet<T>(sheet);
  }
  return result;
}

export function writeSheet<T extends object>(sheet: SheetName, rows: T[]): void {
  writeMultipleSheets({ [sheet]: rows } as Partial<Record<SheetName, T[]>>);
}

export function writeMultipleSheets(
  updates: Partial<Record<SheetName, object[]>>
): void {
  let workbook = readWorkbook();
  if (!workbook) {
    workbook = XLSX.utils.book_new();
  }

  for (const [sheet, rows] of Object.entries(updates)) {
    if (!rows) continue;
    const sheetName = sheet as SheetName;

    if (workbook.Sheets[sheetName]) {
      delete workbook.Sheets[sheetName];
      workbook.SheetNames = workbook.SheetNames.filter((name) => name !== sheetName);
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  writeWorkbookFile(workbook);
}

export function writeWorkbook(sheets: Partial<Record<SheetName, Record<string, unknown>[]>>) {
  const workbook = XLSX.utils.book_new();

  for (const [name, rows] of Object.entries(sheets)) {
    if (!rows) continue;
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  }

  writeWorkbookFile(workbook);
}

export function isWorkbookReadable(): boolean {
  return readWorkbook() !== null;
}

export function parseBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return ["true", "1", "yes"].includes(value.toLowerCase());
  }
  return false;
}
