import fs from "fs";
import path from "path";

const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function saveUserAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 2 MB or smaller.");
  }

  if (!fs.existsSync(AVATAR_DIR)) {
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
  }

  const ext = ALLOWED_TYPES.get(file.type)!;

  for (const oldExt of ALLOWED_TYPES.values()) {
    const oldPath = path.join(AVATAR_DIR, `${userId}.${oldExt}`);
    if (fs.existsSync(oldPath)) {
      try {
        fs.unlinkSync(oldPath);
      } catch {
        // ignore cleanup errors
      }
    }
  }

  const filePath = path.join(AVATAR_DIR, `${userId}.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/avatars/${userId}.${ext}?t=${Date.now()}`;
}

export function removeUserAvatarFiles(userId: string): void {
  if (!fs.existsSync(AVATAR_DIR)) return;

  for (const ext of ALLOWED_TYPES.values()) {
    const filePath = path.join(AVATAR_DIR, `${userId}.${ext}`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
