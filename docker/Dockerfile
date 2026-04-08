FROM node:24-alpine

RUN apk add --no-cache nginx git inotify-tools su-exec && \
    corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

RUN mkdir -p /var/lib/nginx/tmp /var/log/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
COPY rebuild.sh /rebuild.sh
RUN chmod +x /entrypoint.sh /rebuild.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
