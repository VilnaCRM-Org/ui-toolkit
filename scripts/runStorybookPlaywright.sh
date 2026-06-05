#!/bin/sh

set -eu

docker compose build playwright
docker compose rm -sf storybook >/dev/null 2>&1 || true
trap 'docker compose rm -sf storybook >/dev/null 2>&1 || true' EXIT INT TERM
docker compose up -d --build storybook

if ! docker compose run --rm playwright sh -lc "bun x wait-on --timeout 120000 tcp:storybook:6006"; then
  docker compose logs storybook
  exit 1
fi

docker compose run --rm playwright bun x playwright test "$@"
