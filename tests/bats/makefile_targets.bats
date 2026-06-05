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
git-hooks-install|docker compose run --rm bun bun x husky install|
storybook-start|docker compose run --rm bun bun x storybook dev -p 6006|
storybook-build|docker compose run --rm bun bun x storybook build|
generate-ts-doc|docker compose run --rm bun bun x api-extractor run --local --verbose|
playwright-install|docker compose run --rm bun bun x playwright install --with-deps|
test-e2e-local|docker compose run --rm bun bun x playwright test ./tests/e2e|
update|docker compose run --rm bun bun update|
sh|docker compose run --rm --entrypoint sh bun|
ps|docker compose ps|
logs|docker compose logs --follow|
new-logs|docker compose logs --tail=0 --follow|
stop|docker compose stop|
build-k6-docker|docker build -t k6 -f ./tests/load/Dockerfile .|
lighthouse-desktop|docker compose run --rm bun bun x lhci autorun|
lighthouse-mobile|docker compose run --rm bun bun x lhci autorun|
EOF
}

@test "browser-style and memory targets preserve their expected inline shell flows" {
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
test-e2e|bun x playwright install --with-deps|bun x storybook dev --ci --host 0.0.0.0 -p 6006|bun x wait-on --timeout 120000 tcp:127.0.0.1:6006|bun x playwright test ./tests/e2e
test-visual|bun x playwright install --with-deps|bun x storybook dev --ci --host 0.0.0.0 -p 6006|bun x wait-on --timeout 120000 tcp:127.0.0.1:6006|bun x playwright test ./tests/visual --pass-with-no-tests
test-memory-leak|if [ ! -f tests/memory-leak/runMemlabTests.js ]; then|Skipping memory leak tests because this bootstrap PR does not include the app test files yet.|bun x storybook dev --ci --host 0.0.0.0 -p 3000|MEMLAB_WEBSITE_URL=http://127.0.0.1:3000 bun ./tests/memory-leak/runMemlabTests.js
EOF
}

@test "load-tests builds the k6 image and runs the homepage scenario" {
  run_make_target load-tests
  [ "$status" -eq 0 ]
  assert_log_contains 'docker build -t k6 -f ./tests/load/Dockerfile .'
  assert_log_contains 'docker run -v ./tests/load:/loadTests --network ui-toolkit_default --rm k6 run --summary-trend-stats=avg,min,med,max,p(95),p(99)'
  assert_log_contains '--out web-dashboard=period=1s&export=/loadTests/results/homepage.html /loadTests/homepage.js'
}

@test "test-unit prefers docker compose exec when the bun service is running" {
  run_make_target_with_env test-unit FAKE_DOCKER_COMPOSE_BUN_ID=bun-service-id
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose ps -q bun'
  assert_log_contains 'docker compose exec -T bun node ./node_modules/jest/bin/jest.js --verbose --passWithNoTests'
  assert_log_not_contains 'docker compose run --rm bun node ./node_modules/jest/bin/jest.js --verbose --passWithNoTests'
}

@test "test-unit falls back to docker compose run when the bun service is not running" {
  run_make_target test-unit
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose ps -q bun'
  assert_log_contains 'docker compose run --rm bun node ./node_modules/jest/bin/jest.js --verbose --passWithNoTests'
  assert_log_not_contains 'docker compose exec -T bun node ./node_modules/jest/bin/jest.js --verbose --passWithNoTests'
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
