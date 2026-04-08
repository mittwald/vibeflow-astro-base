FROM node:24-alpine

RUN apk add --no-cache nginx git inotify-tools && \
    corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# Make nginx dirs writable for any user
RUN mkdir -p /var/lib/nginx/tmp /var/log/nginx && \
    chmod -R 777 /var/lib/nginx /var/log/nginx /etc/nginx /tmp

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
COPY rebuild.sh /rebuild.sh
RUN chmod +x /entrypoint.sh /rebuild.sh

# Default to non-root, can be overridden with --user
USER node

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
