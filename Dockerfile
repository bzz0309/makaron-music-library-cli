FROM node:20-bookworm-slim

ENV NODE_ENV=production
ENV MUSICLIB_LIBRARY=/data/library

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY bin ./bin
COPY skills ./skills
COPY vendor ./vendor
COPY README.md LICENSE ./

RUN mkdir -p /data/library /home/node/.ssh \
    && chmod 0700 /home/node/.ssh \
    && chown -R node:node /app /data /home/node/.ssh

USER node

EXPOSE 10000

CMD ["sh", "/app/bin/server-entrypoint.sh"]
