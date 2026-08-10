// Stride PWA Service Worker - v3
// Fixes: MIME type errors in dev by not caching JS/CSS module files
// Only caches navigations and static assets; never intercepts Vite HMR or module requests

const CACHE_NAME = 'stride-pwa-v3';

// Assets that are safe to pre-cache
const PRECACHE_ASSETS = ['/manifest.webmanifest', '/icon.png', '/apple-touch-icon.png', '/favicon.png'];

// Patterns to NEVER intercept (Vite dev server magic)
const BYPASS_PATTERNS = [
  /\?v=/, // Vite versioned modules
  /\/@/, // Vite internal routes like /@vite/client
  /\/api\//, // API calls — never cache these
  /\/__/, // Vite internal
  /hot-update/, // HMR updates
  /node_modules/, // node_modules
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only intercept GET requests on same origin
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Bypass Vite dev-server magic and API routes entirely
  const shouldBypass = BYPASS_PATTERNS.some((p) => p.test(url.pathname + url.search));
  if (shouldBypass) return;

  // For navigation requests (HTML) — network-first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/') || caches.match('/index.html'))
    );
    return;
  }

  // For static assets — cache-first, update in background
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
  }
  // All other requests — network only (don't cache JS/CSS modules at all in dev)
});
