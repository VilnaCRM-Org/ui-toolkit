FROM oven/bun:1.4.2-alpine@sha256:d888c0ae6c86d7866ff10c5aafdd9077b36aee6455b33dd270fb93c0dd5cef6f

# Chromium is only needed by the memory-leak (memlab/puppeteer) job.
ARG INSTALL_CHROMIUM=false

SHELL ["/bin/sh", "-lc"]

# Alpine's nodejs links against the system ICU, whose data ships split: the
# default icu-data-en carries English only, so every other locale silently
# resolves back to English and the calendar's `locale` prop looks like a no-op.
# icu-data-full replaces it and keeps the localisation tests meaningful.
RUN apk add --no-cache \
      bash=5.2.37-r0 \
      g++=14.2.0-r6 \
      icu-data-full=76.1-r1 \
      jq=1.8.2-r0 \
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

# Explicit paths instead of `COPY . .`: a recursive build-context copy is refused
# by SonarCloud (docker:S6470), and --chown here replaces the `chown -R /app` that
# rewrote every inode and made overlayfs duplicate the whole tree into the next
# layer (dive wasted-bytes gate). Every tracked top-level entry is listed; .env and
# .qlty are the only omissions and .dockerignore already excludes both.
COPY --chown=appuser:appuser .github ./.github
COPY --chown=appuser:appuser .husky ./.husky
COPY --chown=appuser:appuser .storybook ./.storybook
COPY --chown=appuser:appuser config ./config
COPY --chown=appuser:appuser i18n ./i18n
COPY --chown=appuser:appuser scripts ./scripts
COPY --chown=appuser:appuser specs ./specs
COPY --chown=appuser:appuser src ./src
COPY --chown=appuser:appuser tests ./tests
COPY --chown=appuser:appuser \
      .dependency-cruiser.js .dive-ci .dockerignore .editorconfig .env.example .gitignore \
      .hadolint.yaml .markdownlint.yaml .markdownlintignore .prettierignore .prettierrc \
      CLAUDE.md CONSUMING.md CONTRIBUTING.md Dockerfile Dockerfile.playwright \
      Dockerfile.rca LICENSE Makefile README.md SECURITY.md agents.md api-extractor.json \
      babel.config.js build.config.mjs bun.lock checkNodeVersion.js commitlint.config.js \
      docker-compose.yml eslint.config.mjs i18n.js jest.config.ts \
      jest.integration.config.ts jest.mutation.config.ts jest.setup.ts lighthouserc.js \
      package.json playwright.config.ts robots.txt stryker.config.mjs \
      stryker.shard.config.mjs tsconfig.api-extractor.json tsconfig.dts.json tsconfig.json \
      tsconfig.paths.json tsconfig.stryker.json \
      ./

RUN if [ -f package.json ]; then \
      bun install --frozen-lockfile; \
    fi \
    && chown appuser:appuser /app \
    && if [ -d node_modules ]; then chown -R appuser:appuser node_modules; fi

USER appuser

CMD ["sh", "-lc", "while :; do sleep 3600; done"]
