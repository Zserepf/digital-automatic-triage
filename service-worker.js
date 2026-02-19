const CACHE_NAME = 'dat-cache-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
    '/offline.html',
    '/css/variables.css',
    '/css/main.css',
    '/css/components.css'
];

// Files that should NEVER be cached (always fetch fresh)
const NEVER_CACHE = ['/js/', '/pages/', 'index.html', 'manifest.json'];

function shouldNeverCache(url) {
    return NEVER_CACHE.some(pattern => url.includes(pattern));
}

// Install - precache only static assets (CSS)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
    // Immediately take over from old service worker
    self.skipWaiting();
});

// Activate - clean ALL old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Immediately control all open tabs
    self.clients.claim();
});

// Fetch strategy:
// - JS/HTML/pages: ALWAYS network only (never serve stale code)
// - CSS/fonts: network first, cache fallback (for offline)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Skip external API requests entirely
    if (event.request.url.includes('firebaseio.com') ||
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('gstatic.com')) {
        return;
    }

    // JS and page files: network only, no caching
    if (shouldNeverCache(event.request.url)) {
        event.respondWith(
            fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
                return new Response('', { status: 503 });
            })
        );
        return;
    }

    // Everything else (CSS, images): network first, cache fallback
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                });
            })
    );
});
