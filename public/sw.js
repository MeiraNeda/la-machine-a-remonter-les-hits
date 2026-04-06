// public/sw.js - Version améliorée pour application avec Supabase + Real-time

const CACHE_NAME = '80s-hits-v3';

// Ressources statiques à mettre en cache immédiatement
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg'
];

// Pages et routes dynamiques (ne pas les cacher agressivement)
const DYNAMIC_ROUTES = ['/map', '/hit/', '/admin', '/game'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker : Cache statique ouvert');
        return cache.addAll(STATIC_CACHE);
      })
  );
  self.skipWaiting(); // Force l'activation immédiate
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie intelligente : Network First pour les pages dynamiques
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorer les requêtes Supabase (elles doivent toujours aller sur le réseau)
  if (url.href.includes('supabase.co')) {
    return;
  }

  // Pour les routes dynamiques (comme /map), on fait Network First
  const isDynamicRoute = DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route) || url.pathname === route);

  if (isDynamicRoute) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Optionnel : mettre en cache la réponse réussie
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si pas de réseau, on essaie le cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Pour tout le reste (CSS, JS, images statiques...) : Cache First puis Network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
  );
});