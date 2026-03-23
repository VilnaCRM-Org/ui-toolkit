# Parameters
PROJECT = frontend-ssr-template
K6 = $(DOCKER) run -v ./src/test/load:/loadTests --net=host --rm k6 run --summary-trend-stats="avg,min,med,max,p(95),p(99)"

# Executables: local only
BUN_BIN = bun
DOCKER = docker
DOCKER_COMPOSE = docker compose

# Executables
EXEC_BUN = $(DOCKER_COMPOSE) exec -T bun
BUN = $(EXEC_BUN) bun
BUN_RUN = $(BUN) run
BUN_X = $(BUN) x
HOST_BUN = bun
HOST_BUN_X = bun x
GIT = git

# Misc
.DEFAULT_GOAL = help
.RECIPEPREFIX +=
.PHONY: help build lint-next lint-tsc lint-md format-check git-hooks-install \
	storybook-start storybook-build generate-ts-doc test-e2e test-e2e-local \
	test-unit copy-coverage test-mutation test-memory-leak lighthouse-desktop \
	lighthouse-mobile install update ci-install ci-playwright-install ci-test-e2e \
	ci-test-visual ci-test-memory-leak up down sh ps logs new-logs start stop \
	build-k6-docker load-tests

# Variables
REPORT_FILENAME ?= default_value

help:
	@printf "\033[33mUsage:\033[0m\n  make [target] [arg=\"val\"...]\n\n\033[33mTargets:\033[0m\n"
	@grep -E '^[-a-zA-Z0-9_\.\/]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[32m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build the project inside the docker container.
	$(BUN_RUN) build

lint-next: ## Run the Next.js linter inside the docker container.
	$(BUN_RUN) lint:next

lint-tsc: ## Run the TypeScript linter inside the docker container.
	$(BUN_RUN) lint:tsc

lint-md: ## Run the Markdown linter inside the docker container.
	$(BUN_RUN) lint:md

format-check: ## Check Prettier formatting inside the docker container.
	$(BUN_X) prettier . --check

git-hooks-install: ## Install git hooks.
	$(BUN_RUN) prepare

storybook-start: ## Start Storybook inside the docker container.
	$(BUN_RUN) storybook-start

storybook-build: ## Build Storybook inside the docker container.
	$(BUN_RUN) storybook-build

generate-ts-doc: ## Generate TypeScript documentation inside the docker container.
	$(BUN_RUN) generate-ts-doc

test-e2e: ## Run the package e2e script inside the docker container.
	$(BUN_RUN) test:e2e

test-e2e-local: ## Open the local Playwright runner inside the docker container.
	$(BUN_RUN) test:e2e-local

test-unit: ## Run Jest unit tests inside the docker container.
	$(BUN_RUN) test:unit

copy-coverage: ## Copy the Jest coverage directory from the docker container.
	$(DOCKER_COMPOSE) cp bun:/app/coverage ./coverage

test-mutation: ## Run mutation tests inside the docker container.
	$(BUN_RUN) test:mutation

test-memory-leak: ## Run memory leak tests inside the docker container.
	$(BUN_RUN) test:memory-leak

lighthouse-desktop: ## Run desktop Lighthouse checks inside the docker container.
	$(BUN_RUN) lighthouse:desktop

lighthouse-mobile: ## Run mobile Lighthouse checks inside the docker container.
	$(BUN_RUN) lighthouse:mobile

install: ## Install dependencies inside the docker container.
	$(BUN) install

update: ## Update dependencies inside the docker container.
	$(BUN) update

ci-install: ## Install Bun and project dependencies on the CI runner.
	npm install -g bun
	bun install --frozen-lockfile

ci-playwright-install: ## Install Playwright browsers on the GitHub runner.
	$(HOST_BUN_X) playwright install --with-deps

ci-test-e2e: ## Start Storybook on the GitHub runner and run e2e tests.
	@set -e; \
	nohup $(HOST_BUN) run storybook-start >/tmp/ui-toolkit-storybook.log 2>&1 & \
	pid=$$!; \
	trap 'kill $$pid >/dev/null 2>&1 || true' EXIT; \
	$(HOST_BUN_X) wait-on --timeout 120000 tcp:127.0.0.1:6006; \
	$(HOST_BUN_X) playwright test ./src/test/e2e

ci-test-visual: ## Start Storybook on the GitHub runner and run visual tests.
	@set -e; \
	nohup $(HOST_BUN) run storybook-start >/tmp/ui-toolkit-storybook.log 2>&1 & \
	pid=$$!; \
	trap 'kill $$pid >/dev/null 2>&1 || true' EXIT; \
	$(HOST_BUN_X) wait-on --timeout 120000 tcp:127.0.0.1:6006; \
	$(HOST_BUN_X) playwright test ./src/test/visual --pass-with-no-tests

ci-test-memory-leak: ## Start the app on the GitHub runner and run Memlab.
	@set -e; \
	nohup $(HOST_BUN) start >/tmp/ui-toolkit-app.log 2>&1 & \
	pid=$$!; \
	trap 'kill $$pid >/dev/null 2>&1 || true' EXIT; \
	$(HOST_BUN_X) wait-on --timeout 180000 http://127.0.0.1:3000; \
	MEMLAB_WEBSITE_URL=http://127.0.0.1:3000 $(HOST_BUN) ./src/test/memory-leak/runMemlabTests.js

up: ## Start the docker hub (Bun).
	$(DOCKER_COMPOSE) up -d --build

down: ## Stop the docker hub.
	$(DOCKER_COMPOSE) down --remove-orphans

sh: ## Open a shell inside the docker container.
	@$(EXEC_BUN) sh

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
	$(DOCKER) build -t k6 -f ./src/test/load/Dockerfile .

load-tests: build-k6-docker
	$(K6) --out 'web-dashboard=period=1s&export=/loadTests/results/homepage.html' /loadTests/homepage.js
