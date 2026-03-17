FROM public.ecr.aws/docker/library/node:24.8.0-alpine3.21

ARG CURL_VERSION=8.14.1-r2

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

RUN apk add --no-cache \
    bash=5.2.37-r0 \
    curl=${CURL_VERSION} \
    g++=14.2.0-r4 \
    make=4.4.1-r2 \
    python3=3.12.12-r0 \
    && addgroup -S app \
    && adduser -S -G app app

ENV BUN_INSTALL=/home/app/.bun
ENV PATH="/home/app/.bun/bin:$PATH"

WORKDIR /app

COPY . .

RUN curl --retry 5 --retry-delay 2 -fsSL https://bun.sh/install | bash -s "bun-v1.3.5" \
    && if [ -f package.json ]; then \
      if [ -f bun.lock ]; then \
        bun install --frozen-lockfile; \
      else \
        bun install; \
      fi; \
    fi \
    && chown -R app:app /app /home/app/.bun

USER app

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
