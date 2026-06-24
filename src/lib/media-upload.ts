import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/client";

const LOCAL_MEDIA_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;
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
    try {
      return await uploadToSupabase(folder, file);
    } catch (error) {
      console.error("[media] supabase upload failed, trying local", error);
    }
  }
  return uploadToLocal(folder, file);
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

  const files = formData.getAll(fieldName).filter(
    (item): item is File => item instanceof File && item.size > 0
  );

  const uploaded: string[] = [];
  for (const file of files) {
    uploaded.push(await uploadSiteMedia(folder, file));
  }

  if (uploaded.length) return uploaded;
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
