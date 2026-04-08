FROM node:22-alpine

RUN apk add --no-cache nginx && \
    corepack enable && corepack prepare pnpm@latest --activate

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
