import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/client";

const LOCAL_MEDIA_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 8;
const MAX_TOTAL_BYTES = 18 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

function isUploadBlob(item: FormDataEntryValue): item is File {
  return (
    typeof item === "object" &&
    item !== null &&
    "arrayBuffer" in item &&
    "size" in item &&
    typeof (item as File).size === "number" &&
    (item as File).size > 0
  );
}

function validateFile(file: File): string {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload JPG, PNG, WebP, or GIF images only.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Each image must be 5 MB or smaller.");
  }
  return ALLOWED_TYPES.get(file.type)!;
}

async function uploadToSupabase(folder: string, file: File): Promise<string> {
  const ext = validateFile(file);
  const objectPath = `${folder}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const client = getSupabaseAdmin();
  const { error } = await client.storage.from("site-media").upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Image upload failed: ${error.message}`);
  const { data } = client.storage.from("site-media").getPublicUrl(objectPath);
  return data.publicUrl;
}

async function uploadToLocal(folder: string, file: File): Promise<string> {
  const ext = validateFile(file);
  const dir = path.join(LOCAL_MEDIA_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const fileName = `${randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${folder}/${fileName}`;
}

export async function uploadSiteMedia(folder: string, file: File): Promise<string> {
  if (isSupabaseStorageConfigured()) {
    return uploadToSupabase(folder, file);
  }
  if (process.env.VERCEL === "1") {
    throw new Error("Image upload is unavailable. Check Supabase storage settings on Vercel.");
  }
  return uploadToLocal(folder, file);
}

function readUploadFiles(formData: FormData, fieldName: string): File[] {
  const entries = formData.getAll(fieldName).filter(isUploadBlob);

  if (entries.length > MAX_FILES_PER_UPLOAD) {
    throw new Error(`You can upload up to ${MAX_FILES_PER_UPLOAD} images at a time.`);
  }

  const totalBytes = entries.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error("Total upload size is too large. Try fewer or smaller images.");
  }

  return entries;
}

export async function parseMultipleImageUploads(
  folder: string,
  formData: FormData,
  fieldName = "images",
  keepExisting: string[] = []
): Promise<string[]> {
  if (formData.get("remove_images") === "on") {
    return [];
  }

  const entries = readUploadFiles(formData, fieldName);
  const uploaded: string[] = [];

  for (const file of entries) {
    uploaded.push(await uploadSiteMedia(folder, file));
  }

  if (uploaded.length) {
    const merged = [...keepExisting];
    for (const url of uploaded) {
      if (!merged.includes(url)) merged.push(url);
    }
    return merged;
  }

  return keepExisting;
}

export function normalizeDatetimeLocal(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Date and time are required.");
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date and time.");
  return date.toISOString();
}

export function parseImageUrlsJson(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

export function serializeImageUrls(urls: string[]): string | null {
  const unique = urls.filter(Boolean);
  return unique.length ? JSON.stringify(unique) : null;
}

export function resolveImageList(item: {
  image_url?: string | null;
  image_urls?: string | null;
}): string[] {
  const fromJson = parseImageUrlsJson(item.image_urls);
  if (fromJson.length) return fromJson;
  if (item.image_url) return [item.image_url];
  return [];
}
