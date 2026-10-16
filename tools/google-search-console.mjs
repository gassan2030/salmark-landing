// Добавить salmark.kz в Google Search Console через сервис-аккаунт kanri-seo-reader.
// Ключ берётся из связки ключей macOS (запись kanri-google-sa-json, hex) и на диск не пишется.
//   node tools/google-search-console.mjs token  — выдать файл подтверждения (положить в public/ и выложить)
//   node tools/google-search-console.mjs all    — подтвердить сайт, добавить владельца, отправить sitemap
import { execSync } from 'node:child_process';
import { createSign } from 'node:crypto';
import { writeFileSync } from 'node:fs';

const SITE = 'https://salmark.kz/';
const OWNER = 'gassanov2030@gmail.com';
const sa = JSON.parse(Buffer.from(execSync('security find-generic-password -s kanri-google-sa-json -w').toString().trim(), 'hex'));

const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = b64({ alg: 'RS256', typ: 'JWT' }) + '.' + b64({
  iss: sa.client_email, aud: sa.token_uri, iat: now, exp: now + 3600,
  scope: 'https://www.googleapis.com/auth/siteverification https://www.googleapis.com/auth/webmasters',
});
const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
const { access_token } = await (await fetch(sa.token_uri, {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${unsigned}.${sig}`,
})).json();

const call = async (method, url, body) => {
  const r = await fetch(url, { method, headers: { authorization: 'Bearer ' + access_token, 'content-type': 'application/json' }, body: body && JSON.stringify(body) });
  const text = await r.text();
  console.log(method, url.replace(/\?.*/, ''), r.status, text.slice(0, 300));
  return text ? JSON.parse(text) : {};
};

const SV = 'https://www.googleapis.com/siteVerification/v1';
const id = encodeURIComponent(SITE);
const site = { type: 'SITE', identifier: SITE };

if (process.argv[2] === 'token') {
  const { token } = await call('POST', `${SV}/token`, { site, verificationMethod: 'FILE' });
  writeFileSync(new URL(`../public/${token}`, import.meta.url), `google-site-verification: ${token}`);
  console.log('файл подтверждения:', token);
} else if (process.argv[2] === 'all') {
  await call('POST', `${SV}/webResource?verificationMethod=FILE`, { site });
  const res = await call('GET', `${SV}/webResource/${id}`);
  if (res.owners && !res.owners.includes(OWNER)) await call('PUT', `${SV}/webResource/${id}`, { ...res, owners: [...res.owners, OWNER] });
  await call('PUT', `https://www.googleapis.com/webmasters/v3/sites/${id}`);
  await call('PUT', `https://www.googleapis.com/webmasters/v3/sites/${id}/sitemaps/${encodeURIComponent(SITE + 'sitemap.xml')}`);
} else {
  console.log('укажите token или all');
}
