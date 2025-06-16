const NAME = 'mito1renraku';
const VERSION = '049'; // バージョンを更新しすると再インストールされる。ここのバージョンを変えないと表示が変わらない
const CACHE_NAME = NAME + VERSION;
// サイトルートからの絶対パスで指定
const urlsToCache = [
  '/servicepage/', // ルートページ (通常 index.html に相当)
  '/servicepage/index.html', // 明示的に index.html も追加 (サーバー設定による)
  '/servicepage/script.js',
  '/servicepage/style.css',
  '/servicepage/materials/close.png',
  '/servicepage/materials/setup.png',
  '/servicepage/materials/menu.svg',
  '/servicepage/materials/share.png',
  '/servicepage/materials/sukashi.png',
  '/servicepage/materials/icon.css',
  '/servicepage/materials/icon/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  '/servicepage/materials/icon/gok-H7zzDkdnRel8-DQ6KAXJ69wP1tGnf4ZGhUce.woff2',
  '/servicepage/materials/icon/LDItaoyNOAY6Uewc665JcIzCKsKc_M9flwmP.woff2',
  '/servicepage/materials/icon/oPWQ_lt5nv4pWNJpghLP75WiFR4kLh3kvmvR.woff2',
  '/servicepage/materials/icon/hESh6WRmNCxEqUmNyh3JDeGxjVVyMg4tHGctNCu0.woff2',
  '/reset.css',
  // 他にオフラインで必要なアセットがあれば絶対パスで追加
];

// Service Worker install event
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        // 念のため、ルートページ '/servicepage/' もキャッシュに追加
        urlsToCache.push('/servicepage/');
        // 重複を削除 (オプション)
        const uniqueUrlsToCache = [...new Set(urlsToCache)];
        return cache.addAll(uniqueUrlsToCache).catch(error => {
          console.error('Failed to cache some assets:', error);
          // キャッシュ失敗時のデバッグに役立つ情報
          error.request && console.error('Failed request:', error.request.url);
        });
      })
      .then(() => self.skipWaiting()) // インストール後すぐに有効化する場合
  );
});

// Fetch event (Cache First, Network Falling Back with corrected fallback path)
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // キャッシュからのレスポンスがあれば返す
        if (response) {
          return response;
        }

        // キャッシュにない場合、ネットワークから取得を試みる
        return fetch(event.request).catch(() => {
          // ネットワークエラー時
          // ナビゲーションリクエストの場合、キャッシュされたルートページを返す
          if (event.request.mode === 'navigate') {
            console.log('Offline fallback for navigation: returning /index.html');
            // '/servicepage/index.html' または '/servicepage/' のどちらかがキャッシュされているはず
            return caches.match('/servicepage/index.html') || caches.match('/servicepage/');
          }
          // 他のアセットタイプの場合は、ここでは何も返さない (必要ならフォールバックを追加)
        });
      })
  );
});

// Activate event to clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key.startsWith(NAME)) { // 同じアプリの古いバージョンのみ削除
          console.log('Deleting old cache:', key);
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log(CACHE_NAME + " activated");
      // 新しいService Workerがすぐにページを制御するようにする
      return self.clients.claim();
    })
  );
});
