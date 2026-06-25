#!/usr/bin/env bats

load './test_helper.bash'

CONTRIBUTING="$PROJECT_ROOT/CONTRIBUTING.md"
README="$PROJECT_ROOT/README.md"

# ---- CONTRIBUTING.md has a metrics gate section ------------------------------

@test "CONTRIBUTING.md contains a complexity metrics gate section heading" {
  grep -qiE '#{2,3}.*[Cc]omplexity|#{2,3}.*[Mm]etrics [Gg]ate|#{2,3}.*rust-code-analysis' "$CONTRIBUTING"
}

@test "CONTRIBUTING.md documents make lint-metrics as the run command" {
  grep -q 'make lint-metrics' "$CONTRIBUTING"
}

@test "CONTRIBUTING.md states the governed scope is src/" {
  grep -qE 'src/' "$CONTRIBUTING"
}

@test "CONTRIBUTING.md mentions no-suppression nature of the gate" {
  grep -qiE 'no.suppression|suppression.file|suppression.*baseline|baseline.*suppression' "$CONTRIBUTING"
}

@test "CONTRIBUTING.md documents the findings table columns" {
  grep -qiE 'file.*subject.*line|file.*metric.*value.*threshold|METRIC.*VALUE.*LIMIT' "$CONTRIBUTING"
}

@test "CONTRIBUTING.md notes IDE integration is out of scope" {
  grep -qiE '[Ii][Dd][Ee].*out.of.scope|out.of.scope.*[Ii][Dd][Ee]|editor.*out.of.scope|out.of.scope.*editor' "$CONTRIBUTING"
}

# ---- CONTRIBUTING.md remediation guidance ------------------------------------

@test "CONTRIBUTING.md gives remediation guidance for over-complex functions" {
  grep -qiE 'cyclomatic|over.compl|extract.*function|split.*function|refactor' "$CONTRIBUTING"
}

@test "CONTRIBUTING.md gives remediation guidance for oversized files" {
  grep -qiE 'sloc|loc|oversized|large file|file size|split.*file|too.*long' "$CONTRIBUTING"
}

# ---- README.md brief mention -------------------------------------------------

@test "README.md mentions the complexity metrics gate" {
  grep -qiE 'rust-code-analysis|complexity.*gate|metrics.*gate|code.*metrics' "$README"
}

@test "README.md points to CONTRIBUTING.md for metrics gate details" {
  grep -qE 'CONTRIBUTING\.md' "$README"
}
