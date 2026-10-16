// Сообщить Яндексу и Bing о страницах из sitemap (IndexNow). Ключ — файл <ключ>.txt в public/.
import { readdirSync, readFileSync } from 'node:fs';
const pub = new URL('../public/', import.meta.url);
const key = readdirSync(pub).find(f => /^[0-9a-f]{32}\.txt$/.test(f)).slice(0, 32);
const urlList = [...readFileSync(new URL('sitemap.xml', pub), 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
for (const ep of ['https://yandex.com/indexnow', 'https://api.indexnow.org/indexnow']) {
  const r = await fetch(ep, { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify({ host: 'salmark.kz', key, keyLocation: `https://salmark.kz/${key}.txt`, urlList }) });
  console.log(ep, r.status, urlList.length, 'адресов');
}
