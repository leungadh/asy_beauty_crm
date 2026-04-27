// Service worker — cache-first for app shell, network-first for Supabase API
const CACHE = 'asy-crm-v1';
const SHELL = [
  'CRM.html',
  'app.jsx',
  'data.jsx',
  'components.jsx',
  'icons.jsx',
  'page-dashboard.jsx',
  'page-new-visit.jsx',
  'page-search.jsx',
  'page-customer.jsx',
  'tweaks-panel.jsx',
  'manifest.webmanifest',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network-only for Supabase API and auth calls
  if (url.hostname.includes('supabase.co')) return;

  // Cache-first for local app shell files
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res.ok && SHELL.some(f => url.pathname.endsWith(f))) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
