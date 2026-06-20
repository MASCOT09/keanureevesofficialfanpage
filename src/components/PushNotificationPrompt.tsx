"use client";

import { useEffect, useState } from "react";

const DISMISS_KEY = "push-prompt-dismissed";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function saveSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON();
  const keys = json.keys;
  if (!json.endpoint || !keys?.p256dh || !keys?.auth) return;

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    }),
  });
}

export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await registration.update();

        if (Notification.permission === "granted") {
          const existing = await registration.pushManager.getSubscription();
          if (existing) await saveSubscription(existing);
          return;
        }

        if (Notification.permission === "denied") return;
        if (localStorage.getItem(DISMISS_KEY) === "1") return;

        const res = await fetch("/api/push/vapid");
        const data = (await res.json()) as { publicKey?: string | null };
        if (data.publicKey) setVisible(true);
      } catch {
        // Push not available on this device/browser.
      }
    })();
  }, []);

  async function enablePush() {
    setBusy(true);
    try {
      const res = await fetch("/api/push/vapid");
      const data = (await res.json()) as { publicKey?: string | null };
      if (!data.publicKey) {
        setVisible(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await registration.update();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
      await saveSubscription(subscription);
      setVisible(false);
    } catch {
      setVisible(false);
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md">
      <div className="glass flex flex-col gap-3 rounded-[16px] border border-accent/20 p-4 shadow-xl sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Enable push notifications</p>
          <p className="mt-0.5 text-xs text-muted">
            Get instant alerts when you receive messages or site updates.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-3 py-2 text-xs text-muted transition-colors hover:text-foreground"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => void enablePush()}
            disabled={busy}
            className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Enabling…" : "Enable"}
          </button>
        </div>
      </div>
    </div>
  );
}
