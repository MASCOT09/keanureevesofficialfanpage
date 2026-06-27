import { uploadSiteMedia } from "@/lib/media-upload";

export async function saveMessageImage(userId: string, file: File): Promise<string> {
  return uploadSiteMedia(`message-images/${userId}`, file);
}
