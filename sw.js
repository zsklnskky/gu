/* Офлайн-кэш. Страницы на хостинге зашифрованы StatiCrypt - кэшируем как есть.
   Меняй VERSION при каждой выкладке, чтобы телефон подтянул новое. */
var VERSION = 'gu-20261007015002';
var CORE = ['./', 'index.html', 'today.html', 'plan.html', 'body.html', 'look.html', 'mind.html', 'tools.html', 'crisis.html',
  'year.html', 'budget.html', 'week.html', 'sleep.html', 'progress.html', 'extras.html', 'fonts.html',
  'img/channel-brussels-waffle.jpg', 'img/channel-car-raincoat-profile.jpg', 'img/channel-elevator-selfie-black-tee.jpg', 'img/channel-fishing-camo-carp.jpg', 'img/channel-gas-station-raincoat.jpg', 'img/channel-van-white-linen.jpg', 'img/p1.jpg', 'img/p2.jpg', 'img/p3.jpg', 'img/p4.jpg', 'img/p5.jpg', 'img/p6.jpg', 'img/rybalka-night-street-white-pants.jpg', 'img/valera-story-white-pants-friends.jpg',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
var OPTIONAL = ['style.css', 'app.js', 'js/track.js', 'css/track.css', 'js/tools.js', 'css/tools.css', 'js/extras.js', 'css/extras.css', 'js/lenis.min.js']; // в зашифрованной сборке вшиты в html

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    // по одному: отсутствующий файл не должен ломать установку
    return Promise.all(CORE.concat(OPTIONAL).map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k.indexOf('gu-') === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// сначала сеть (свежая версия), без сети - кэш; картинки и шрифты - сначала кэш
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var url = new URL(r.url);
  var same = url.origin === location.origin;
  var font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!same && !font) return;
  var cacheFirst = font || /\.(png|jpe?g|webp|svg|woff2?)$/.test(url.pathname);
  function put(res) {
    if (res && res.ok) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(r, cp); }); }
    return res;
  }
  if (cacheFirst) {
    e.respondWith(caches.match(r).then(function (hit) { return hit || fetch(r).then(put); }));
    return;
  }
  e.respondWith(fetch(r).then(put).catch(function () {
    return caches.match(r, { ignoreSearch: true }).then(function (hit) {
      return hit || (r.mode === 'navigate' ? caches.match('index.html') : Response.error());
    });
  }));
});
