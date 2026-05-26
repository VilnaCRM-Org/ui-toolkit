FROM oven/bun:1.3.5@sha256:e90cdbaf9ccdb3d4bd693aa335c3310a6004286a880f62f79b18f9b1312a8ec3

SHELL ["/bin/sh", "-lc"]

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash \
      g++ \
      make \
      nodejs \
      npm \
      procps \
      python3 \
    && groupadd --system appuser \
    && useradd --system --gid appuser --create-home --home-dir /home/appuser appuser \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN if [ -f package.json ]; then \
      bun install --frozen-lockfile; \
    fi \
    && chown -R appuser:appuser /app

USER appuser

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
