import fs from "fs";
import path from "path";

const GIVEAWAY_IMAGE_DIR = path.join(process.cwd(), "public", "giveaways");
const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function saveGiveawayImage(giveawayId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WebP image.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 3 MB or smaller.");
  }

  if (!fs.existsSync(GIVEAWAY_IMAGE_DIR)) {
    fs.mkdirSync(GIVEAWAY_IMAGE_DIR, { recursive: true });
  }

  removeGiveawayImageFiles(giveawayId);

  const ext = ALLOWED_TYPES.get(file.type)!;
  const filePath = path.join(GIVEAWAY_IMAGE_DIR, `${giveawayId}.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/giveaways/${giveawayId}.${ext}?t=${Date.now()}`;
}

export function removeGiveawayImageFiles(giveawayId: string): void {
  if (!fs.existsSync(GIVEAWAY_IMAGE_DIR)) return;

  for (const ext of ALLOWED_TYPES.values()) {
    const filePath = path.join(GIVEAWAY_IMAGE_DIR, `${giveawayId}.${ext}`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}

export async function parseGiveawayImageUpload(
  giveawayId: string,
  formData: FormData,
  currentUrl: string | null = null
): Promise<string | null> {
  if (formData.get("remove_image") === "on") {
    removeGiveawayImageFiles(giveawayId);
    return null;
  }

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    return saveGiveawayImage(giveawayId, file);
  }

  return currentUrl;
}
