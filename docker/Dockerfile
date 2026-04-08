FROM node:24-alpine

RUN apk add --no-cache nginx git inotify-tools && \
    corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
COPY rebuild.sh /rebuild.sh
RUN chmod +x /entrypoint.sh /rebuild.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
