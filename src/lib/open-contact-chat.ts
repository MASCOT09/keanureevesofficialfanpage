import type { ContactLink } from "@/types/database";
import {
  buildTelegramDirectChatUrl,
  buildTelegramWebChatUrl,
  buildWhatsAppDirectChatUrl,
  buildWhatsAppWebChatUrl,
  buildZangiDirectChatUrl,
  buildZangiWebChatUrl,
  extractTelegramTarget,
  extractWhatsAppPhone,
  extractZangiId,
  normalizeContactUrl,
} from "@/lib/contact-dms";

function openWithAppFallback(appUrl: string, webUrl: string) {
  window.location.href = appUrl;

  const fallbackTimer = window.setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.location.href = webUrl;
    }
  }, 1200);

  const cancelFallback = () => window.clearTimeout(fallbackTimer);

  window.addEventListener("blur", cancelFallback, { once: true });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") cancelFallback();
    },
    { once: true }
  );
}

export function openContactChat(link: ContactLink) {
  const platform = link.platform.toLowerCase();

  if (platform === "whatsapp") {
    const phone = extractWhatsAppPhone(link.url);
    if (phone) {
      openWithAppFallback(buildWhatsAppDirectChatUrl(phone), buildWhatsAppWebChatUrl(phone));
      return;
    }
  }

  if (platform === "telegram") {
    const target = extractTelegramTarget(link.url);
    if (target) {
      openWithAppFallback(buildTelegramDirectChatUrl(target), buildTelegramWebChatUrl(target));
      return;
    }
  }

  if (platform === "zangi") {
    const id = extractZangiId(link.url);
    if (id) {
      openWithAppFallback(buildZangiDirectChatUrl(id), buildZangiWebChatUrl(id));
      return;
    }
  }

  window.open(normalizeContactUrl(link.url, link.platform), "_blank", "noopener,noreferrer");
}
