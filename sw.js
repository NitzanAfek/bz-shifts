// Network first, cache as fallback: always fresh when online, still opens offline.
const CACHE = "bz-v2";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "manifest.webmanifest", "icon-192.png", "data.enc.json"]))); });
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("./"))));
});

// Push (app 2.0, 2026-11-20): the bot on Nitzan's Mac sends {title, body}; tapping opens the app.
self.addEventListener("push", e => {
  let d = {}; try { d = e.data.json(); } catch (_) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "בונקר צנובר", { body: d.body || "", icon: "icon-192.png", badge: "icon-192.png", dir: "rtl", lang: "he" }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(ws => { for (const w of ws) if ("focus" in w) return w.focus(); return clients.openWindow("./"); }));
});
