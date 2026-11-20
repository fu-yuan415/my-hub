/* Service Worker：网络优先，确保总是拿到最新代码。
 * 只有完全离线时才用缓存兜底。
 */
const CACHE = 'personal-hub-v25';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // 网络优先：成功就用网络结果并更新缓存；失败才回退缓存
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

// 允许页面主动要求跳过等待
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
