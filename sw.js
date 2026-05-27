const CACHE_NAME = 'turnos-app-v1';

// Arquivos que o app precisa salvar para funcionar sem internet
const assets = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js'
];

// Instala o Service Worker e salva os arquivos no cache
self.addEventListener('install', evento => {
  evento.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Quando o app pedir um arquivo, busca primeiro no cache (offline)
self.addEventListener('fetch', evento => {
  evento.respondWith(
    caches.match(evento.request).then(respostaCache => {
      return respostaCache || fetch(evento.request);
    })
  );
});
