①public_html直下にsw.js配置


②PWAでローカルに保存したいページのjsかhtmlに以下記述
registSW();
function registSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      // sw.jsがルートにあると仮定し、スコープを '/' に設定
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
}

③manifest.jsonにデバイスごとのアイコン指定
