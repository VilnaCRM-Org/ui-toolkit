FROM oven/bun:1.4.0-alpine@sha256:07235578f79ef8c6f97d94aee7938e76f5cdba5f21ae5dbfdd3d3d38058437eb

# Chromium is only needed by the memory-leak (memlab/puppeteer) job.
ARG INSTALL_CHROMIUM=false

SHELL ["/bin/sh", "-lc"]

RUN apk add --no-cache \
      bash=5.2.37-r0 \
      g++=14.2.0-r6 \
      jq=1.8.1-r0 \
      make=4.4.1-r3 \
      nodejs=22.23.2-r0 \
      npm=11.6.4-r0 \
      procps-ng=4.0.4-r3 \
      python3=3.12.14-r0 \
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
