FROM oven/bun:1.3.14-alpine@sha256:5acc90a93e91ff07bf72aa90a7c9f0fa189765aec90b47bdbf2152d2196383c0

# Chromium is only needed by the memory-leak (memlab/puppeteer) job.
ARG INSTALL_CHROMIUM=false

SHELL ["/bin/sh", "-lc"]

RUN apk add --no-cache \
      bash \
      g++ \
      make \
      nodejs \
      npm \
      procps \
      python3 \
    && if [ "$INSTALL_CHROMIUM" = "true" ]; then \
         apk add --no-cache \
           chromium=142.0.7444.59-r0 \
           font-freefont=20120503-r4 \
           freetype=2.13.3-r0 \
           harfbuzz=11.2.1-r0 \
           nss=3.114-r0; \
       fi \
    && addgroup -S appuser \
    && adduser -S -G appuser -h /home/appuser appuser

# memlab/puppeteer must use the system Chromium, never its own download.
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY . .

RUN if [ -f package.json ]; then \
      bun install --frozen-lockfile; \
    fi \
    && chown -R appuser:appuser /app

USER appuser

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
