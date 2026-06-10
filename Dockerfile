FROM oven/bun:1.3.14-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0

SHELL ["/bin/sh", "-lc"]

RUN apk add --no-cache \
      bash \
      g++ \
      make \
      nodejs \
      npm \
      procps \
      python3 \
    && addgroup -S appuser \
    && adduser -S -G appuser -h /home/appuser appuser

WORKDIR /app

COPY . .

RUN if [ -f package.json ]; then \
      bun install --frozen-lockfile; \
    fi \
    && chown -R appuser:appuser /app

USER appuser

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
