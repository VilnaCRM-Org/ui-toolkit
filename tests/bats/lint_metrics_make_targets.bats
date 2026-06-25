#!/usr/bin/env bats

load './test_helper.bash'

MAKEFILE="$PROJECT_ROOT/Makefile"

setup() {
  setup_makefile_test_env
}

# ---- variable definitions ----------------------------------------------------

@test "Makefile defines RCA_VERSION as 0.0.25" {
  grep -qE '^RCA_VERSION\s*=\s*0\.0\.25' "$MAKEFILE"
}

@test "Makefile defines RCA_SCOPE as src/" {
  grep -qE '^RCA_SCOPE\s*=\s*src/' "$MAKEFILE"
}

@test "Makefile defines RCA_EXCLUDES" {
  grep -qE '^RCA_EXCLUDES\s*=' "$MAKEFILE"
}

@test "Makefile defines METRICS_POLICY_PATH pointing to config/metrics-policy.json" {
  grep -qE '^METRICS_POLICY_PATH\s*=.*config/metrics-policy\.json' "$MAKEFILE"
}

# ---- .PHONY declarations ------------------------------------------------------

@test "lint-metrics is declared in .PHONY" {
  grep -q 'lint-metrics' "$MAKEFILE" | grep -q 'PHONY' || \
    grep -E '\.PHONY.*lint-metrics|lint-metrics.*\.PHONY' "$MAKEFILE" -q || \
    awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-metrics/ && flag){found=1; exit}} END{exit !found}' "$MAKEFILE"
}

@test "lint-metrics-run is declared in .PHONY" {
  awk '/^\.PHONY/{buf=""; flag=1} flag{buf=buf $0; if(/\\$/)next; if(buf ~ /lint-metrics-run/ && flag){found=1; exit}} END{exit !found}' "$MAKEFILE"
}

# ---- lint-metrics target recipe ----------------------------------------------

@test "lint-metrics delegates to docker compose run --rm rca make lint-metrics-run" {
  run_make_target lint-metrics
  [ "$status" -eq 0 ]
  assert_log_contains 'docker compose run --rm rca make lint-metrics-run'
}

# ---- lint-metrics-run recipe content -----------------------------------------

@test "lint-metrics-run recipe exports RCA_BIN" {
  grep -A 20 '^lint-metrics-run:' "$MAKEFILE" | grep -q 'RCA_BIN'
}

@test "lint-metrics-run recipe exports RCA_SCOPE" {
  grep -A 20 '^lint-metrics-run:' "$MAKEFILE" | grep -q 'RCA_SCOPE'
}

@test "lint-metrics-run recipe exports METRICS_POLICY" {
  grep -A 20 '^lint-metrics-run:' "$MAKEFILE" | grep -q 'METRICS_POLICY'
}

@test "lint-metrics-run recipe runs scripts/lint-metrics.sh" {
  grep -A 20 '^lint-metrics-run:' "$MAKEFILE" | grep -q 'scripts/lint-metrics.sh'
}

# ---- lint chain registration -------------------------------------------------

@test "lint target chain includes lint-metrics as a dependency" {
  grep -qE '^lint:.*lint-metrics' "$MAKEFILE"
}
