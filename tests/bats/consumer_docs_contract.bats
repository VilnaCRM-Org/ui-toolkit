#!/usr/bin/env bats

load './test_helper.bash'

README="$PROJECT_ROOT/README.md"
MANIFEST="$PROJECT_ROOT/package.json"
BARREL="$PROJECT_ROOT/src/components/index.ts"

root_value_exports() {
  awk '
    function emit(text,   n, parts, i, name) {
      sub(/^export \{/, "", text)
      sub(/\}.*$/, "", text)
      n = split(text, parts, ",")
      for (i = 1; i <= n; i++) {
        name = parts[i]
        gsub(/^[ \t]+|[ \t]+$/, "", name)
        sub(/^default as /, "", name)
        if (name != "") print name
      }
    }
    /^export type/ { next }
    /^export \{/ {
      buf = $0
      if ($0 ~ /\}/) { emit(buf) } else { collecting = 1 }
      next
    }
    collecting {
      buf = buf " " $0
      if ($0 ~ /\}/) { collecting = 0; emit(buf) }
    }
  ' "$BARREL" | sort -u
}

peer_dependencies() {
  awk '
    /"peerDependencies": \{/ { inside = 1; next }
    inside && /\}/ { exit }
    inside {
      gsub(/^[ \t]+|,[ \t]*$/, "")
      gsub(/"/, "")
      sub(/: /, "\t")
      print
    }
  ' "$MANIFEST"
}

@test "the barrel and manifest parsers see the surface they guard" {
  [ "$(root_value_exports | wc -l)" -ge 40 ]
  [ "$(peer_dependencies | wc -l)" -ge 5 ]
  root_value_exports | grep -qx 'UiButton'
  root_value_exports | grep -qx 'heightBreakpoints'
  peer_dependencies | grep -q "^react	"
}

@test "README installs the release tarball under the package name" {
  grep -qF 'bun add "$BASE/v$VERSION/vilnacrm-ui-toolkit-$VERSION.tgz"' "$README"
  grep -qF 'releases/download' "$README"
}

@test "README quick start imports the stylesheet and a component from the package root" {
  grep -qF "import '@vilnacrm/ui-toolkit/styles.css';" "$README"
  grep -qE "^import \{ [A-Za-z, ]+ \} from '@vilnacrm/ui-toolkit';$" "$README"
  grep -qF "from '@vilnacrm/ui-toolkit/ui-button';" "$README"
}

@test "README names every peer dependency with its declared range" {
  local name range
  while IFS=$'\t' read -r name range; do
    grep -qF "\`$name\`" "$README" || { echo "peer $name is not documented" >&2; return 1; }
    grep -qF "\`$range\`" "$README" || { echo "range $range of $name is not documented" >&2; return 1; }
  done < <(peer_dependencies)
}

@test "README lists every value the package root exports" {
  local name missing=''
  while IFS= read -r name; do
    grep -qF "\`$name\`" "$README" || missing="$missing $name"
  done < <(root_value_exports)
  if [ -n "$missing" ]; then
    echo "README.md does not mention:$missing" >&2
    return 1
  fi
}

@test "README documents theming, the UiThemeProvider contract, and localization" {
  grep -qE '^## Theming$' "$README"
  grep -qF '<UiThemeProvider variant="crm"' "$README"
  grep -qF 'createUiTheme({' "$README"
  grep -qE '^## Localization$' "$README"
}

@test "README documents the shipped locales subpath and init helper" {
  grep -qF '@vilnacrm/ui-toolkit/locales' "$README"
  grep -qF 'initI18n' "$README"
  grep -qF 'escapeValue' "$README"
}

@test "README keeps the contributor content under a Development heading" {
  grep -qE '^## Development$' "$README"
  awk '/^## Development$/ { inside = 1 } inside && /make verify/ { found = 1 } END { exit !found }' "$README"
}

@test "README points consumers at CONSUMING.md" {
  grep -qF '[CONSUMING.md](CONSUMING.md)' "$README"
}
