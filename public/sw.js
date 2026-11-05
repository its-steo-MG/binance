self.addEventListener("push", event => {
  let payload;
  try { payload = event.data?.json(); } catch { return; }
  if (!payload || typeof payload.title !== "string") return;
  event.waitUntil(self.registration.showNotification(payload.title, { body: typeof payload.body === "string" ? payload.body : "", icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", tag: `account-${payload.notificationId || "alert"}`, data: { path: "/notifications" } }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const url = new URL("/notifications", self.location.origin).href;
    const windows = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (new URL(client.url).origin === self.location.origin && "focus" in client) {
        await client.navigate(url); return client.focus();
      }
    }
    return clients.openWindow(url);
  })());
});
