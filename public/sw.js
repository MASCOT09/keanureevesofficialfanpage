self.addEventListener("push", (event) => {
  let payload = { title: "Keanu Fan Site", body: "You have a new update.", url: "/dashboard" };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch {
    // use defaults
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: payload.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data?.url || "/dashboard";
  const url = new URL(path, self.location.origin).href;
  event.waitUntil(clients.openWindow(url));
});
