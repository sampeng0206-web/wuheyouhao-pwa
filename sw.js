const CACHE_NAME = 'wuheyouhao-v14';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './data/fortunes.json',
  './audio/youhao.mp3',
  './images/crane_front_v2.jpg',
  './images/crane_back_v2.png',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  './images/xiangji.jpg',
  './images/image_4.png',
  './images/image_5.png',
  './images/image_6.png',
  './images/image_9.png',
  './images/intro_bg_panorama_v2.png',
  './images/product_xiangji_books.jpg',
  './images/product_wuhe_wood_tag.jpg',
  './images/product_wuhe_cards.jpg',
  './images/map_wuhe_1.jpg',
  './images/map_wuhe_2.jpg',
  './images/map_kalala_1.jpg',
  './images/map_kalala_2.jpg',
  './images/map_kalala_3.jpg',
  './images/map_saoba_1.jpg',
  './images/map_saoba_2.jpg',
  './images/map_saoba_3.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
