FROM node:20-alpine as build
RUN apk add git
RUN git clone https://github.com/uvexz/ghost-theme-goods goods
RUN git clone https://github.com/laosb/ghos3.git s3
RUN cd s3 && npm install && npm build

FROM ghost:5-alpine
COPY --from=build s3 content/adapters/storage/s3
COPY --from=build goods content/themes/goods
RUN chown node:node content \
    && chmod 1777 content

EXPOSE 2368
CMD ["node", "current/index.js"]
