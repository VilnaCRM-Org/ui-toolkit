# Parameters
K6 = $(DOCKER) run -v ./tests/load:/loadTests --network ui-toolkit_default --rm k6 run --summary-trend-stats="avg,min,med,max,p(95),p(99)"
BATS_FORMATTER ?= pretty

# Executables
DOCKER = docker
DOCKER_COMPOSE = docker compose

# Docker helpers
RUN_BUN = $(DOCKER_COMPOSE) run --rm bun
RUN_BUN_SH = $(DOCKER_COMPOSE) run --rm --entrypoint sh bun -lc
EXEC_BUN = $(DOCKER_COMPOSE) exec -T bun
BUN = $(RUN_BUN) bun
BUN_RUN = $(BUN) run
BUN_X = $(BUN) x

# Misc
.DEFAULT_GOAL = help
.RECIPEPREFIX +=
.PHONY: help build lint lint-next lint-tsc lint-md format-check git-hooks-install \
	storybook-start storybook-build generate-ts-doc test-e2e test-e2e-local \
	test-unit test-integration copy-coverage test-mutation test-memory-leak test-visual \
	lighthouse-desktop lighthouse-mobile install update playwright-install test-bats \
	up down sh ps logs new-logs start stop build-k6-docker load-tests run-storybook-playwright

PLAYWRIGHT_TEST_ARGS =

run-storybook-playwright:
	@test -n "$(PLAYWRIGHT_TEST_TARGET)"
	@set -eu; \
		$(DOCKER_COMPOSE) build playwright; \
		$(DOCKER_COMPOSE) rm -sf storybook >/dev/null 2>&1 || true; \
		$(DOCKER_COMPOSE) up -d --build storybook; \
		trap "$(DOCKER_COMPOSE) rm -sf storybook >/dev/null 2>&1 || true" EXIT; \
		if ! $(DOCKER_COMPOSE) run --rm playwright sh -lc "bun x wait-on --timeout 120000 http-get://storybook:6006/iframe.html"; then \
			$(DOCKER_COMPOSE) logs storybook; \
			exit 1; \
		fi; \
		$(DOCKER_COMPOSE) run --rm playwright bun x playwright test $(PLAYWRIGHT_TEST_TARGET) $(PLAYWRIGHT_TEST_ARGS)

help:
	@printf "\033[33mUsage:\033[0m\n  make [target] [arg=\"val\"...]\n\n\033[33mTargets:\033[0m\n"
	@grep -E '^[-a-zA-Z0-9_\.\/]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build the project inside the docker container.
	$(RUN_BUN) node ./build.config.mjs

lint: lint-next lint-tsc lint-md format-check ## Run all linters inside the docker container.

lint-next: ## Run ESLint inside the docker container.
	@$(RUN_BUN_SH) '\
		set -e; \
		targets=""; \
		for dir in src scripts tests; do \
			if [ -d "$$dir" ]; then \
				targets="$$targets $$dir"; \
			fi; \
		done; \
		if [ -z "$$targets" ]; then \
			echo "No lint targets found, skipping ESLint."; \
			exit 0; \
		fi; \
		files=$$(find $$targets -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \)); \
		if [ -z "$$files" ]; then \
			echo "No lint files found, skipping ESLint."; \
			exit 0; \
		fi; \
		bun x eslint $$files \
	'

lint-tsc: ## Run the TypeScript linter inside the docker container.
	$(BUN_X) tsc --newLine LF

lint-md: ## Run the Markdown linter inside the docker container.
	$(RUN_BUN_SH) 'bun x markdownlint "**/*.md"'

format-check: ## Check Prettier formatting inside the docker container.
	$(BUN_X) prettier . --check

git-hooks-install: ## Install git hooks.
	$(BUN_X) husky install

storybook-start: ## Start Storybook inside the docker container.
	$(BUN_X) storybook dev -p 6006

storybook-build: ## Build Storybook inside the docker container.
	$(BUN_X) storybook build

generate-ts-doc: ## Generate TypeScript documentation inside the docker container.
	$(BUN_X) api-extractor run --local --verbose

test-e2e: PLAYWRIGHT_TEST_TARGET = ./tests/e2e
test-e2e: ## Start Storybook and run e2e tests inside a Docker container.
	@$(MAKE) --no-print-directory run-storybook-playwright PLAYWRIGHT_TEST_TARGET="$(PLAYWRIGHT_TEST_TARGET)"

test-e2e-local: ## Open the local Playwright runner inside the docker container.
	$(DOCKER_COMPOSE) run --rm --build playwright bun x playwright test ./tests/e2e

test-unit: ## Run Jest unit tests inside the docker container.
	@container_id=$$($(DOCKER_COMPOSE) ps -q bun); \
	if [ -n "$$container_id" ]; then \
		$(EXEC_BUN) node ./node_modules/jest/bin/jest.js --verbose --passWithNoTests; \
	else \
		$(RUN_BUN) node ./node_modules/jest/bin/jest.js --verbose --passWithNoTests; \
	fi

test-integration: ## Run Jest integration (composition) tests inside the docker container.
	@container_id=$$($(DOCKER_COMPOSE) ps -q bun); \
	if [ -n "$$container_id" ]; then \
		$(EXEC_BUN) node ./node_modules/jest/bin/jest.js --config jest.integration.config.ts --verbose --passWithNoTests; \
	else \
		$(RUN_BUN) node ./node_modules/jest/bin/jest.js --config jest.integration.config.ts --verbose --passWithNoTests; \
	fi

copy-coverage: ## Copy the Jest coverage directory from the docker container.
	@container_id=$$($(DOCKER_COMPOSE) ps -q bun); \
	if [ -z "$$container_id" ]; then \
		echo "bun service is not running; start docker before copying coverage"; \
		exit 1; \
	fi; \
	if ! $(EXEC_BUN) test -d /app/coverage; then \
		echo "coverage directory was not generated; skipping copy"; \
		exit 0; \
	fi; \
	$(DOCKER_COMPOSE) cp bun:/app/coverage ./coverage

test-mutation: ## Run mutation tests inside the docker container.
	$(BUN_X) stryker run

test-memory-leak: ## Start the app and run Memlab inside a Docker container.
	INSTALL_CHROMIUM=true $(DOCKER_COMPOSE) build bun
	@$(RUN_BUN_SH) '\
		set -e; \
		if [ ! -f tests/memory-leak/runMemlabTests.js ]; then \
			echo "Skipping memory leak tests because this bootstrap PR does not include the app test files yet."; \
			exit 0; \
		fi; \
		CI=1 bun x storybook dev --ci --host 0.0.0.0 -p 3000 >/tmp/ui-toolkit-app.log 2>&1 & \
		pid=$$!; \
		trap "kill $$pid >/dev/null 2>&1 || true" EXIT; \
		if ! bun x wait-on --timeout 180000 http://127.0.0.1:3000; then \
			cat /tmp/ui-toolkit-app.log; \
			exit 1; \
		fi; \
		MEMLAB_WEBSITE_URL=http://127.0.0.1:3000 bun ./tests/memory-leak/runMemlabTests.js \
	'

lighthouse-desktop: ## Run desktop Lighthouse checks inside the docker container.
	$(RUN_BUN_SH) 'bun x storybook build && bun x lhci autorun --collect.settings.preset=desktop'

lighthouse-mobile: ## Run mobile Lighthouse checks inside the docker container.
	$(RUN_BUN_SH) 'bun x storybook build && bun x lhci autorun --collect.settings.formFactor=mobile'

install: ## Install dependencies inside the docker container.
	$(RUN_BUN) bun install --frozen-lockfile

update: ## Update dependencies inside the docker container.
	$(BUN) update

playwright-install: ## Build the Playwright runner image with browsers and system dependencies.
	$(DOCKER_COMPOSE) build playwright

test-bats: ## Run Bats coverage for Makefile shell flows and coverage contracts inside the docker container.
	$(DOCKER_COMPOSE) run --rm --build bun bun x bats --formatter $(BATS_FORMATTER) -r tests/bats

test-visual: PLAYWRIGHT_TEST_TARGET = ./tests/visual
test-visual: PLAYWRIGHT_TEST_ARGS = --pass-with-no-tests
test-visual: ## Start Storybook and run visual tests inside a Docker container.
	@$(MAKE) --no-print-directory run-storybook-playwright PLAYWRIGHT_TEST_TARGET="$(PLAYWRIGHT_TEST_TARGET)" PLAYWRIGHT_TEST_ARGS="$(PLAYWRIGHT_TEST_ARGS)"

up: ## Start the docker hub (Bun).
	$(DOCKER_COMPOSE) up -d --build

down: ## Stop the docker hub.
	$(DOCKER_COMPOSE) down --remove-orphans

sh: ## Open a shell inside the docker container.
	@$(DOCKER_COMPOSE) run --rm --entrypoint sh bun

ps: ## Show docker compose services.
	@$(DOCKER_COMPOSE) ps

logs: ## Show all docker compose logs.
	@$(DOCKER_COMPOSE) logs --follow

new-logs: ## Show live docker compose logs without history.
	@$(DOCKER_COMPOSE) logs --tail=0 --follow

start: up ## Start docker.

stop: ## Stop docker services.
	$(DOCKER_COMPOSE) stop

build-k6-docker:
	$(DOCKER) build -t k6 -f ./tests/load/Dockerfile .

load-tests: build-k6-docker
	$(K6) --out 'web-dashboard=period=1s&export=/loadTests/results/homepage.html' /loadTests/homepage.js
