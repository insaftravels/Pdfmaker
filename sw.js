/* ইনসাফ টিকেট রিব্র্যান্ড — সার্ভিস ওয়ার্কার
   প্রতিবার ডিপ্লয়ে CACHE_NAME বাড়াবেন (v1 → v2) যাতে সব ডিভাইসে পুরোনো ক্যাশ মুছে যায়। */
const CACHE_NAME = "insaf-rebrand-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png"
];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)).catch(()=>{})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* cache-first; নতুন রিসোর্স (CDN লাইব্রেরিসহ) ব্যাকগ্রাউন্ডে ক্যাশে রাখে */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(cached => {
      const fetched = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
