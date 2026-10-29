// NOVA service worker: pass-through fetch (installability) + Web Push notifications.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "NOVA", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "NOVA", {
      body: data.body || "",
      icon: "icon-192.png",
      badge: "badge-96.png",
      tag: data.tag || "nova",
      renotify: true,
      dir: "rtl",
      lang: "ar",
      data: { url: data.url || "./" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "./", self.registration.scope).href;
  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        if (c.url.startsWith(self.registration.scope) && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(target);
    })()
  );
});
