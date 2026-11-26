const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
const html='dist/index.html';
const registration = `<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {updateViaCache:'none'}).then(reg => {
    const check = () => reg.update().catch(() => {});
    check();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  }).catch(() => {});
}
</script>`;
fs.writeFileSync(html, fs.readFileSync(html,'utf8').replace('</body>', registration+'</body>'));
for(const route of ['calendrier','reglages']){
  const dir=path.join('dist',route);
  fs.mkdirSync(dir,{recursive:true});
  fs.copyFileSync(html,path.join(dir,'index.html'));
}
const urls=walk('dist').map(f=>'./'+path.relative('dist',f).split(path.sep).join('/')).filter(f=>f!=='./sw.js');
const cache='journal-'+crypto.randomUUID();
fs.writeFileSync('dist/sw.js', `
const name = ${JSON.stringify(cache)};
const files = ${JSON.stringify(urls)};
self.oninstall = event => event.waitUntil(
  caches.open(name).then(cache => cache.addAll(files.map(url => new Request(url, {cache:'reload'}))))
    .then(() => self.skipWaiting())
);
self.onactivate = event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('journal-') && key !== name)
    .map(key => caches.delete(key)))).then(() => self.clients.claim())
);
self.onfetch = event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(name);
    if (request.mode === 'navigate') {
      try {
        const response = await fetch(request, {cache:'no-store'});
        if (response.ok) return response;
      } catch {}
      return await cache.match('./index.html') || Response.error();
    }
    return await cache.match(request) || fetch(request);
  })());
};
`);
