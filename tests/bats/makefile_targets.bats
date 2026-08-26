#!/usr/bin/env bats

load './test_helper.bash'

setup() {
  setup_makefile_test_env
}

@test "help lists the Bats entrypoint" {
  run_make_target help
  [ "$status" -eq 0 ]
  assert_output_contains 'Usage:'
  assert_output_contains 'test-bats'
}

@test "developer utility targets delegate to the expected docker and bun commands" {
  while IFS='|' read -r target expected_one expected_two; do
    [ -n "$target" ] || continue

    reset_command_log
    run_make_target "$target"
    [ "$status" -eq 0 ]
    [ -z "$expected_one" ] || assert_log_contains "$expected_one"
    [ -z "$expected_two" ] || assert_log_contains "$expected_two"
  done <<'EOF'
build|docker compose run --rm bun node ./build.config.mjs|
install|docker compose run --rm bun bun install --frozen-lockfile|
storybook-start|docker compose run --rm bun bun x storybook dev -p 6006|
storybook-build|docker compose run --rm bun bun x storybook build|
generate-ts-doc|docker compose run --rm bun bun x api-extractor run --local --verbose|
playwright-install|docker compose build playwright|
test-e2e-local|docker compose run --rm --build playwright bun x playwright test ./tests/e2e|
update|docker compose run --rm bun bun update|
sh|docker compose run --rm --entrypoint sh bun|
ps|docker compose ps|
logs|docker compose logs --follow|
new-logs|docker compose logs --tail=0 --follow|
stop|docker compose stop|
lighthouse-desktop|docker compose run --rm --entrypoint sh bun -lc bun x storybook build|bun x lhci autorun --collect.settings.preset=desktop
lighthouse-mobile|docker compose run --rm --entrypoint sh bun -lc bun x storybook build|bun x lhci autorun --collect.settings.formFactor=mobile
EOF
}

@test "git-hooks-install runs husky 9 on the host, not inside the bun container" {
  reset_command_log
  run_make_target git-hooks-install
  [ "$status" -eq 0 ]

  # Husky must write .husky/_ and core.hooksPath into the developer's own clone. The bun
  # image bakes the repository without .git and is not bind-mounted, so a containerised run
  # would silently no-op.
  assert_log_contains 'bun x husky'
  assert_log_not_contains 'docker compose run --rm bun bun x husky'

  # `husky install` is the Husky 8 form; Husky 9 deprecates it and Husky 10 removes it.
  assert_log_not_contains 'husky install'
}

@test "run-storybook-playwright preserves the shared docker compose flow" {
  reset_command_log
  run_make_target_with_env run-storybook-playwright PLAYWRIGHT_TEST_TARGET=./tests/e2e
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose build playwright'
  assert_log_contains 'docker compose up -d --build storybook'
  assert_log_contains 'docker compose run --rm playwright sh -lc bun x wait-on --timeout 120000 http-get://storybook:6006/iframe.html'
  assert_log_contains 'docker compose run --rm playwright bun x playwright test ./tests/e2e'
}

@test "storybook-backed and memory targets preserve their current shell flows" {
  while IFS='|' read -r target expected_one expected_two expected_three expected_four; do
    [ -n "$target" ] || continue

    reset_command_log
    run_make_target "$target"
    [ "$status" -eq 0 ]
    assert_log_contains "$expected_one"
    assert_log_contains "$expected_two"
    assert_log_contains "$expected_three"
    [ -z "$expected_four" ] || assert_log_contains "$expected_four"
  done <<'EOF'
test-e2e|docker compose build playwright|docker compose up -d --build storybook|docker compose run --rm playwright sh -lc bun x wait-on --timeout 120000 http-get://storybook:6006/iframe.html|docker compose run --rm playwright bun x playwright test ./tests/e2e
test-visual|docker compose build playwright|docker compose up -d --build storybook|docker compose run --rm playwright sh -lc bun x wait-on --timeout 120000 http-get://storybook:6006/iframe.html|docker compose run --rm playwright bun x playwright test ./tests/visual
test-memory-leak|docker compose build bun|bun x storybook dev --ci --host 0.0.0.0 -p 3000|bun x wait-on --timeout 180000 http://127.0.0.1:3000|MEMLAB_WEBSITE_URL=http://127.0.0.1:3000 bun ./tests/memory-leak/run-memlab-tests.js
EOF
}

@test "test-memory-leak keeps no bootstrap skip path and names the real runner" {
  reset_command_log
  run_make_target test-memory-leak
  [ "$status" -eq 0 ]
  assert_log_not_contains 'Skipping memory leak tests'
  assert_log_not_contains 'runMemlabTests.js'
  assert_log_contains 'bun ./tests/memory-leak/run-memlab-tests.js'
}

@test "jest and playwright suites never pass over an empty test discovery" {
  reset_command_log
  run_make_target test-unit
  [ "$status" -eq 0 ]
  assert_log_not_contains '--passWithNoTests'

  reset_command_log
  run_make_target test-integration
  [ "$status" -eq 0 ]
  assert_log_not_contains '--passWithNoTests'

  reset_command_log
  run_make_target test-visual
  [ "$status" -eq 0 ]
  assert_log_not_contains '--pass-with-no-tests'
}

@test "lint-next fails closed instead of skipping when there is nothing to lint" {
  reset_command_log
  run_make_target lint-next
  [ "$status" -eq 0 ]

  # The docker stub logs the whole one-line shell body, so the guard can be run
  # directly against fixture trees the stub itself could never provide.
  local logged script
  logged="$(cat "$COMMAND_LOG")"
  script="${logged#docker compose run --rm --entrypoint sh bun -lc }"
  [ "$script" != "$logged" ]

  mkdir -p "$BATS_TEST_TMPDIR/no-src"
  run bash -c 'cd "$1" && shift && sh -c "$1"' _ "$BATS_TEST_TMPDIR/no-src" "$script"
  [ "$status" -eq 1 ]
  assert_output_contains 'Expected lint directory src is missing'

  mkdir -p "$BATS_TEST_TMPDIR/empty/src" "$BATS_TEST_TMPDIR/empty/scripts" \
    "$BATS_TEST_TMPDIR/empty/tests"
  run bash -c 'cd "$1" && shift && sh -c "$1"' _ "$BATS_TEST_TMPDIR/empty" "$script"
  [ "$status" -eq 1 ]
  assert_output_contains 'refusing to report a vacuous pass'
}

@test "storybook-backed playwright targets honor DOCKER_COMPOSE overrides" {
  while IFS='|' read -r target expected_command; do
    [ -n "$target" ] || continue

    reset_command_log
    run_make_target "$target" 'DOCKER_COMPOSE=docker compose -f docker-compose.override.yml'
    [ "$status" -eq 0 ]
    assert_log_contains "$expected_command"
    assert_log_not_contains 'docker compose build playwright'
  done <<'EOF'
test-e2e|docker compose -f docker-compose.override.yml build playwright
test-visual|docker compose -f docker-compose.override.yml build playwright
EOF
}

@test "load-tests reports the deliberately omitted load tier instead of building a phantom image" {
  reset_command_log
  run_make_target load-tests
  [ "$status" -eq 0 ]
  assert_output_contains 'Load tests are deliberately not implemented'
  assert_output_contains 'tests/load/README.md'
  assert_log_not_contains 'docker build -t k6'
}

@test "test-unit prefers docker compose exec when the bun service is running" {
  run_make_target_with_env test-unit FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose ps -q bun'
  assert_log_contains 'docker compose exec -T bun node ./node_modules/jest/bin/jest.js --verbose'
  assert_log_not_contains 'docker compose run --rm bun node ./node_modules/jest/bin/jest.js --verbose'
}

@test "test-unit falls back to docker compose run when the bun service is not running" {
  run_make_target test-unit
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose ps -q bun'
  assert_log_contains 'docker compose run --rm bun node ./node_modules/jest/bin/jest.js --verbose'
  assert_log_not_contains 'docker compose exec -T bun node ./node_modules/jest/bin/jest.js --verbose'
}

@test "test-integration prefers docker compose exec when the bun service is running" {
  run_make_target_with_env test-integration FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose ps -q bun'
  assert_log_contains 'docker compose exec -T bun node ./node_modules/jest/bin/jest.js --config jest.integration.config.ts --verbose'
  assert_log_not_contains 'docker compose run --rm bun node ./node_modules/jest/bin/jest.js --config jest.integration.config.ts --verbose'
}

@test "test-integration falls back to docker compose run when the bun service is not running" {
  run_make_target test-integration
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose ps -q bun'
  assert_log_contains 'docker compose run --rm bun node ./node_modules/jest/bin/jest.js --config jest.integration.config.ts --verbose'
  assert_log_not_contains 'docker compose exec -T bun node ./node_modules/jest/bin/jest.js --config jest.integration.config.ts --verbose'
}

@test "copy-coverage fails clearly when the bun service is not running" {
  run_make_target copy-coverage
  [ "$status" -ne 0 ]
  assert_output_contains 'bun service is not running; start docker before copying coverage'
  assert_log_contains 'docker compose ps -q bun'
}

@test "copy-coverage skips copying when the coverage directory was not generated" {
  run_make_target_with_env copy-coverage FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_output_contains 'coverage directory was not generated; skipping copy'
  assert_log_contains 'docker compose exec -T bun test -d /app/coverage'
  assert_log_not_contains 'docker compose cp bun:/app/coverage ./coverage'
}

@test "copy-coverage copies coverage when the directory exists inside the bun container" {
  run_make_target_with_env copy-coverage FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id FAKE_BUN_COVERAGE_EXISTS=1
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose exec -T bun test -d /app/coverage'
  assert_log_contains 'docker compose cp bun:/app/coverage ./coverage'
}

@test "package fails clearly when the bun service is not running" {
  reset_command_log
  run_make_target package
  [ "$status" -ne 0 ]
  assert_output_contains "bun service is not running; run 'make start-bun' first"
  assert_log_contains 'docker compose ps -q bun'
  assert_log_not_contains 'npm pack'
}

@test "package builds, packs, verifies and copies the tarball out of the bun container" {
  reset_command_log
  run_make_target_with_env package FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose exec -T bun sh -lc rm -rf dist build && mkdir -p dist'
  assert_log_contains 'docker compose exec -T bun node ./build.config.mjs'
  assert_log_contains 'docker compose exec -T bun npm pack --pack-destination dist'
  assert_log_contains 'docker compose exec -T bun sh scripts/ci/verify-package-tarball.sh dist'
  assert_log_contains 'docker compose cp bun:/app/dist ./dist'
  assert_log_not_contains 'docker compose run --rm'
}

@test "package stops at the first failing step instead of shipping a stale tarball" {
  reset_command_log
  run_make_target_with_env package \
    FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id \
    FAKE_DOCKER_FAILING_COMMAND='node ./build.config.mjs'
  [ "$status" -ne 0 ]
  assert_log_not_contains 'npm pack'
  assert_log_not_contains 'docker compose cp bun:/app/dist ./dist'
}

@test "package does not attach an unverified tarball when verification fails" {
  reset_command_log
  run_make_target_with_env package \
    FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id \
    FAKE_DOCKER_FAILING_COMMAND='verify-package-tarball.sh'
  [ "$status" -ne 0 ]
  assert_log_contains 'docker compose exec -T bun node ./build.config.mjs'
  assert_log_contains 'docker compose exec -T bun npm pack --pack-destination dist'
  assert_log_not_contains 'docker compose cp bun:/app/dist ./dist'
}

@test "start-bun builds and starts only the bun service" {
  reset_command_log
  run_make_target start-bun
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose up -d --build bun'
  assert_log_not_contains 'storybook'
  assert_log_not_contains 'playwright'
}

@test "test-mutation-shard runs in the running bun container via docker compose exec" {
  reset_command_log
  run_make_target_with_env test-mutation-shard FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose ps -q bun'
  assert_log_contains 'docker compose exec -T -e MUTATION_SHARD_INDEX=0 -e MUTATION_SHARD_TOTAL=1 bun bun x stryker run stryker.shard.config.mjs'
  assert_log_not_contains 'docker compose run --rm'
}

@test "test-mutation-shard fails clearly when the bun service is not running" {
  reset_command_log
  run_make_target test-mutation-shard
  [ "$status" -ne 0 ]
  assert_output_contains 'bun service is not running'
  assert_log_not_contains 'docker compose run --rm'
}

@test "copy-mutation-report fails clearly when the bun service is not running" {
  reset_command_log
  run_make_target copy-mutation-report
  [ "$status" -ne 0 ]
  assert_output_contains 'bun service is not running; start docker before copying the report'
  assert_log_contains 'docker compose ps -q bun'
}

@test "copy-mutation-report copies the shard report when the bun service is running" {
  reset_command_log
  run_make_target_with_env copy-mutation-report FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose cp bun:/app/reports/mutation/mutation-shard-0.json reports/mutation/mutation-shard-0.json'
}

@test "stage-mutation-reports fails clearly when the bun service is not running" {
  reset_command_log
  run_make_target stage-mutation-reports
  [ "$status" -ne 0 ]
  assert_output_contains 'bun service is not running; start docker before staging reports'
}

@test "stage-mutation-reports copies host reports into the bun container when it is running" {
  reset_command_log
  run_make_target_with_env stage-mutation-reports FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose exec -T bun mkdir -p reports/mutation'
  assert_log_contains 'docker compose cp reports/mutation/. bun:/app/reports/mutation'
}

@test "merge-mutation-reports runs in the running bun container via docker compose exec" {
  reset_command_log
  run_make_target_with_env merge-mutation-reports FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose exec -T -e MUTATION_SHARD_TOTAL=1 bun bun scripts/ci/merge-mutation-reports.ts'
  assert_log_not_contains 'docker compose run --rm'
}

@test "merge-mutation-reports fails clearly when the bun service is not running" {
  reset_command_log
  run_make_target merge-mutation-reports
  [ "$status" -ne 0 ]
  assert_output_contains 'bun service is not running'
  assert_log_not_contains 'docker compose exec -T'
}
