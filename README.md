# Salmark Landing

Лендинг маркетингового агентства для медицинских клиник — salmark.kz

## Стек

- Static HTML + Tailwind CSS (CDN)
- Nginx в Docker
- Railway для хостинга

## Локально

```bash
docker build -t salmark-landing .
docker run -p 8080:8080 salmark-landing
# открой http://localhost:8080
```

## Деплой

Автодеплой с GitHub через Railway на push в `main`.

Домен: salmark.kz (Cloudflare DNS, Railway SSL).

## Структура

- `index.html` — вся страница
- `nginx.conf` — конфиг веб-сервера (порт 8080)
- `Dockerfile` — мульти-образ на nginx:alpine
