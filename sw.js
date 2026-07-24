const CACHE_NAME = 'wuheyouhao-v18';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css?v=4',
  './js/app.js?v=4',
  './data/fortunes.json',
  './audio/youhao.mp3',
  './images/crane_front_v2.jpg',
  './images/crane_back_v2.png',
  './images/icons/icon-192.png?v=4',
  './images/icons/icon-512.png?v=4',
  './images/image_5.png',
  './images/image_6.png',
  './images/image_9.png',
  './images/intro_bg_panorama_v2.png',
  './images/product_xiangji_books.jpg',
  './images/product_wuhe_cards.jpg',
  './images/map_saoba_2.jpg',
  './images/map_saoba_3.jpg',
  './images/map_ruisui_11villages.png',
  './images/map_wuhe_satellite.png',
  './images/map_saoba_stones_new.png',
  './images/map_maibul_stone_new.jpg',
  './images/map_tropic_park_new.png',
  './images/map_kiispring_new_1.png',
  './images/map_kiispring_new_2.png',
  './images/map_ruisuifarm_1.png',
  './images/map_ruisuifarm_2.png',
  './images/map_ruisuifarm_3.png',
  './images/map_ruisuifarm_4.png',
  './images/map_xiangji_1.jpg',
  './images/map_xiangji_2.jpg',
  './images/book_cover_milopazik.png',
  './images/book_cover_kuairenkuaiyu.jpg',
  './images/book_cover_lalashan_gongzuoji.png',
  './images/book_cover_lalashan_qiyuji.png',
  './images/product_wuhe_wood_tag_v2.png',
  './images/product_wuhe_wood_tag_v3.jpg'
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
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
