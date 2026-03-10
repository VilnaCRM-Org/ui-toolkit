FROM node:20-alpine3.17

RUN apk add --no-cache python3 make g++ \
    && npm install -g pnpm \
    && addgroup -S app \
    && adduser -S -G app app

WORKDIR /app

COPY . .

RUN if [ -f package.json ]; then \
      if [ -f pnpm-lock.yaml ]; then \
        pnpm install --frozen-lockfile; \
      else \
        pnpm install; \
      fi; \
    fi \
    && chown -R app:app /app

USER app

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
