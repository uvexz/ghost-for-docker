FROM ghost:5-alpine

RUN apk add --no-cache git

RUN git clone https://github.com/uvexz/ghost-theme-goods.git /var/lib/ghost/content/themes/goods \
    && mkdir -p /var/lib/ghost/content/adapters/storage/

COPY ./ghost-cloudflare-r2 /var/lib/ghost/content/adapters/storage

RUN chown node:node /var/lib/ghost/content; \
    chmod 1777 /var/lib/ghost/content

EXPOSE 2368
CMD ["node", "current/index.js"]
