FROM node:24-alpine

RUN apk add --no-cache nginx git inotify-tools && \
    corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# nginx dirs writable for non-root
RUN mkdir -p /var/lib/nginx/tmp /var/log/nginx && \
    chown -R node:node /var/lib/nginx /var/log/nginx /etc/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
COPY rebuild.sh /rebuild.sh
RUN chmod +x /entrypoint.sh /rebuild.sh

USER node

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
