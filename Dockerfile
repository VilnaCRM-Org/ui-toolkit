FROM oven/bun:1.3.5@sha256:e90cdbaf9ccdb3d4bd693aa335c3310a6004286a880f62f79b18f9b1312a8ec3 AS bun

FROM public.ecr.aws/docker/library/node:24.8.0-alpine3.21

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk add --no-cache \
    bash=5.2.37-r0 \
    g++=14.2.0-r4 \
    make=4.4.1-r2 \
    python3=3.12.12-r0 \
    && addgroup -S app \
    && adduser -S -G app -h /home/app app \
    && mkdir -p /home/app \
    && chown app:app /home/app

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

ENV HOME=/home/app

WORKDIR /app

COPY . .

RUN if [ -f package.json ]; then \
      if [ -f bun.lock ]; then \
        bun install --frozen-lockfile; \
      else \
        bun install; \
      fi; \
    fi \
    && chown -R app:app /app

USER app

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
