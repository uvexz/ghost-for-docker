FROM node:20-alpine as build
RUN apk add git
RUN git clone https://github.com/uvexz/ghost-theme-goods-for-yjk goods
RUN git clone https://github.com/laosb/ghos3.git s3
RUN git clone https://github.com/uvexz/ghost-theme-1ite 1ite
RUN git clone https://github.com/uvexz/ghost-theme-bent bent
RUN cd s3 && npm install && npm run build

FROM ghost:5-alpine
COPY --from=build s3 content/adapters/storage/s3
COPY --from=build goods content/themes/goods
COPY --from=build 1ite content/themes/1ite
COPY --from=build bent content/themes/bent
RUN chown -R node:node content \
    && chmod 1777 -R content

EXPOSE 2368
CMD ["node", "current/index.js"]
