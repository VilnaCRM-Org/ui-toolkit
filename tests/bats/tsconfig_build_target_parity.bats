#!/usr/bin/env bats

load './test_helper.bash'

TSCONFIG="$PROJECT_ROOT/tsconfig.json"
BUILD_CONFIG="$PROJECT_ROOT/build.config.mjs"

HARDENING_FLAGS=(
  noUncheckedIndexedAccess
  exactOptionalPropertyTypes
  noImplicitReturns
  noImplicitOverride
  noUnusedLocals
  noUnusedParameters
)

DELETED_OPTIONS=(
  experimentalDecorators
  emitDecoratorMetadata
)

@test "tsconfig typecheck target matches the esbuild build target" {
  tsconfig_target=$(jq -r '.compilerOptions.target' "$TSCONFIG" | tr '[:upper:]' '[:lower:]')
  esbuild_target=$(sed -n "s/^.*target: \['\([a-z0-9]*\)'\].*$/\1/p" "$BUILD_CONFIG")

  if [ -z "$esbuild_target" ]; then
    echo "Could not extract the esbuild target from $BUILD_CONFIG" >&2
    return 1
  fi

  if [ "$tsconfig_target" != "$esbuild_target" ]; then
    echo "tsconfig target ($tsconfig_target) diverges from esbuild target ($esbuild_target)" >&2
    return 1
  fi
}

@test "tsconfig keeps every strictness hardening flag enabled" {
  for flag in "${HARDENING_FLAGS[@]}"; do
    value=$(jq -r --arg flag "$flag" '.compilerOptions[$flag]' "$TSCONFIG")
    if [ "$value" != "true" ]; then
      echo "Expected compilerOptions.$flag to be true, got: $value" >&2
      return 1
    fi
  done
}

@test "tsconfig keeps the dead decorator options deleted" {
  for option in "${DELETED_OPTIONS[@]}"; do
    present=$(jq -r --arg option "$option" '.compilerOptions | has($option)' "$TSCONFIG")
    if [ "$present" != "false" ]; then
      echo "Expected compilerOptions.$option to stay deleted from tsconfig.json" >&2
      return 1
    fi
  done
}
