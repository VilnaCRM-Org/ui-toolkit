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

# The full bracket content of `target: [...]`, quote-agnostic, with quotes and
# spaces stripped — so a reformatted or multi-element target list changes the
# extracted value instead of slipping past the comparison.
extract_esbuild_targets() {
  sed -nE "s/.*target:[[:space:]]*\[([^]]*)\].*/\1/p" "$BUILD_CONFIG" | tr -d "\"' "
}

@test "tsconfig typecheck target matches the esbuild build target" {
  tsconfig_target=$(jq -r '.compilerOptions.target' "$TSCONFIG" | tr '[:upper:]' '[:lower:]')
  esbuild_targets=$(extract_esbuild_targets)

  if [ -z "$esbuild_targets" ]; then
    echo "Could not extract the esbuild target list from $BUILD_CONFIG" >&2
    return 1
  fi

  if [ "$(printf '%s\n' "$esbuild_targets" | wc -l)" -ne 1 ]; then
    echo "Expected exactly one esbuild target list, got: $esbuild_targets" >&2
    return 1
  fi

  if [ "$tsconfig_target" != "$esbuild_targets" ]; then
    echo "tsconfig target ($tsconfig_target) diverges from esbuild target ($esbuild_targets)" >&2
    return 1
  fi
}

@test "tsconfig lib pins its ECMAScript surface to the build target" {
  tsconfig_target=$(jq -r '.compilerOptions.target' "$TSCONFIG" | tr '[:upper:]' '[:lower:]')
  es_libs=$(jq -r '[.compilerOptions.lib[] | ascii_downcase | select(startswith("es"))] | join(",")' \
    "$TSCONFIG")

  if [ "$es_libs" != "$tsconfig_target" ]; then
    echo "Expected the only ES lib entry to equal the target ($tsconfig_target), got: $es_libs" >&2
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
