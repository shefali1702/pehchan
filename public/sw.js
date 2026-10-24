// Keeps Kamla's screen working when the venue Wi-Fi drops: photos, voices,
// fonts and the app shell are served from this cache once seen.
const CACHE = "pehchan-v1";
const SHELL = ["/screen", "/icon.svg", "/seed/placeholder-1.svg", "/seed/placeholder-2.svg", "/seed/placeholder-3.svg", "/seed/placeholder-4.svg", "/seed/placeholder-5.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const cacheFirst = (url) =>
  /^\/(api\/media|seed|vendor|_next\/static)\//.test(url.pathname) || url.pathname === "/icon.svg";

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/events")) return;

  if (cacheFirst(url)) {
    // Range requests from audio are answered with the whole file.
    const key = new Request(url.href);
    e.respondWith(
      caches.match(key).then(
        (hit) =>
          hit ||
          fetch(key).then((res) => {
            if (res.ok && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(key, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Pages and data: fresh when online, the last good copy when not.
  if (req.mode === "navigate" || url.pathname === "/api/family" || url.pathname === "/api/settings") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/screen"))),
    );
  }
});
