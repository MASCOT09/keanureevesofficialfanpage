import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const MESSAGE_IMAGE_DIR = path.join(process.cwd(), "public", "message-images");
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function saveMessageImage(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, WebP, or GIF image.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  if (!fs.existsSync(MESSAGE_IMAGE_DIR)) {
    fs.mkdirSync(MESSAGE_IMAGE_DIR, { recursive: true });
  }

  const ext = ALLOWED_TYPES.get(file.type)!;
  const fileName = `${userId}-${randomUUID()}.${ext}`;
  const filePath = path.join(MESSAGE_IMAGE_DIR, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/message-images/${fileName}`;
}
