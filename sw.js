const CACHE_NAME = 'wuheyouhao-v38';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css?v=20',
  './js/app.js?v=24',
  './data/fortunes.json',
  './audio/youhao.mp3',
  './images/crane_front_v2.jpg',
  './images/crane_back_v2.png',
  './images/icons/icon-192.png?v=5',
  './images/icons/icon-512.png?v=5',
  './images/intro_bg_panorama_v2.png',
  './images/product_xiangji_books.jpg',
  './images/product_wuhe_cards.jpg',
  './images/map_ruisui_11villages.png',
  './images/map_wuhe_satellite.png',
  './images/map_saoba_stones_new.png',
  './images/map_saoba_new_1.png',
  './images/map_saoba_new_2.png',
  './images/map_maibul_stone_new.jpg',
  './images/map_maibul_assembly_hall.jpg',
  './images/map_maibul_church.png',
  './images/map_tropic_park_new.png',
  './images/map_kiispring_new_1.png',
  './images/map_kiispring_new_2.png',
  './images/map_kiispring_new_3.jpg',
  './images/map_kiispring_new_4.jpg',
  './images/map_kiispring_new_5.jpg',
  './images/map_ruisuifarm_1.png',
  './images/map_ruisuifarm_2.png',
  './images/map_ruisuifarm_3.png',
  './images/map_ruisuifarm_4.png',
  './images/map_xiangji_1.jpg',
  './images/map_xiangji_2.jpg',
  './images/map_xiangji_3.jpg',
  './images/map_xiangji_4.jpg',
  './images/map_xiangji_5.jpg',
  './images/map_xiangji_6.jpg',
  './images/book_cover_milopazik.png',
  './images/book_cover_kuairenkuaiyu.jpg',
  './images/book_cover_lalashan_gongzuoji.png',
  './images/book_cover_lalashan_qiyuji.png',
  './images/product_wuhe_wood_tag_v2.png',
  './images/product_wuhe_wood_tag_v3.jpg',
  './images/sakizaya_crane_brand.png',
  './images/contact_info_card.png',
  './images/contact_qrcodes.png',
  './images/product_rizhaojinshan.png',
  './images/product_sanshifo_jintang.png',
  './images/product_bingsi_accessories.png',
  './images/product_wuhe_sachet.png',
  './images/puzzle_wuhe_crane.jpg',
  './images/puzzle_xiangji_stone.jpg',
  './images/puzzle_kiispring_dog.jpg',
  './images/puzzle_pond.jpg',
  './images/puzzle_waterfall.jpg',
  './images/puzzle_bird.jpg',
  './images/puzzle_xiangji_stone2.jpg',
  './images/puzzle_xiangji_stone3.jpg',
  './images/puzzle_xiangji_fayin_stone.jpg',
  './images/puzzle_kiispring_new.jpg',
  './images/puzzle_mountain_rainbow.jpg',
  './images/puzzle_wuhe_qiangong.jpg'
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
