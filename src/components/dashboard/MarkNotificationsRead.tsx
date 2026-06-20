"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsReadAction } from "@/app/actions/notification-actions";

export function MarkNotificationsRead() {
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void markAllNotificationsReadAction().then(() => router.refresh());
  }, [router]);

  return null;
}
