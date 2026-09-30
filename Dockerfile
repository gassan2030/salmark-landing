FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY robots.txt /usr/share/nginx/html/robots.txt
COPY sitemap.xml /usr/share/nginx/html/sitemap.xml
COPY app /usr/share/nginx/html/app
COPY assets /usr/share/nginx/html/assets

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
