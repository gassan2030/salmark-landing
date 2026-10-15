# salmark.kz — сайт IT-студии Salmark

Статический сайт: мобильные приложения, ИИ-боты, автоматизация, CRM.

- Тексты и страницы — `tools/build.mjs`; после правки: `node tools/build.mjs` (пишет в `public/`)
- Оформление — `public/assets/site.css`, поведение — `public/assets/site.js`
- `public/app/` и `public/app/privacy/` — страницы приложения из App Store и Google Play, адреса НЕ менять
- Заявки с формы — FormSubmit → почта владельца
- Локально: `docker build -t salmark-landing . && docker run -p 8080:8080 salmark-landing`
- Хостинг: Railway (сервис salmark-landing), домены salmark.kz и www.salmark.kz, DNS в Cloudflare
