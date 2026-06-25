# Welcome to contributing guide

Thank you for investing your time in contributing to our project!

Read our
[Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/)
to keep our community approachable and respectable.

In this guide you will
get an overview of the contribution
workflow from opening an issue, creating a PR, reviewing, and merging the PR.

Use the table of contents icon on the top left corner
of this document to get to a specific section of this guide quickly.

## New contributor guide

To get an overview of the project,
read the [README](README.md). Here are some resources
to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

### Issues

#### Create a new issue

If you spot a problem with this toolkit,
[search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments).
If a related issue doesn't exist, open a new issue in the repository that hosts this project.

#### Solve an issue

Scan through the repository's existing issues to find one that interests you.
You can narrow down the search using `labels` as filters.
As a general rule, we don’t assign issues to anyone.
If you find an issue to work on, you are welcome to open a PR with a fix.

### Make Changes

#### Make changes locally

1. Fork the repository.

- Using GitHub Desktop:
  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop)
    will guide you through setting up Desktop.
  - Once Desktop is set up, you can use
    it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository)
    so that you can make your changes without affecting the original project until
    you're ready to merge them.

1. Install or update to **Docker** and **Docker Compose**. For more information, see [the README](README.md).

2. Create a working branch and start with your changes!

When you add or change a public Make target:

- keep `tests/bats/make-target-coverage.tsv` in sync with the current Makefile target list
- add or update Bats coverage for uncovered shell flows, or record the PR workflow that already
  exercises the target end to end

### Dependency version ranges

Every entry in `dependencies` and `devDependencies` of the root `package.json`
must use a caret (`^`) version range.

Non-semver specifiers (git, file, workspace, link, npm, url, and github
shorthand) and dist-tags such as `latest` are exempt and may stay as-is.
The `packageManager` field and the package's own `version` are not
dependencies and are unaffected. `peerDependencies` and
`optionalDependencies` are out of scope.

This is enforced by `make lint-dep-ranges`, which runs
`scripts/ci/check-dependency-ranges.ts`:

```bash
make lint-dep-ranges
```

The static testing workflow runs it on every pull request, and the policy is
unit-tested in `tests/unit/dependency-range-policy.test.ts`.

### Test directory layout

All test files live under the root `tests/` tree — never under `src/`. Each test type has its
own subdirectory:

- `tests/unit` — Jest unit and component tests (`*.test.ts`, `*.test.tsx`, `*.spec.js`)
- `tests/integration` — Jest composition tests across components
- `tests/e2e` — Playwright end-to-end specs run against Storybook
- `tests/visual` — Playwright visual-regression specs and their snapshots
- `tests/load` — k6 load tests
- `tests/memory-leak` — Memlab leak scenarios
- `tests/bats` — Bats coverage for Makefile and CI shell flows

`make lint-test-structure` enforces this layout: it fails when any `*.test.*` or `*.spec.*` file
lives outside the root `tests/` tree. The check runs on every pull request through the static
testing workflow, so a misplaced test file fails CI.

### Complexity metrics gate

`make lint-metrics` runs a complexity analysis over the `src/` scope using a pinned
`rust-code-analysis-cli` instance inside the project's `rca` Docker service. The policy is
committed at `config/metrics-policy.json` with thresholds validated by
`config/metrics-policy.schema.json`. No additional setup beyond the repository's existing
Docker workflow is required.

Run the check locally before pushing:

```bash
make lint-metrics
```

**No suppression file is allowed.** There is no baseline or suppression mechanism — every file
in `src/` must comply with the committed policy thresholds.

When the gate finds violations it prints a findings table, one row per breach:

| FILE | SUBJECT | LINE | METRIC | VALUE | THRESHOLD |
|------|---------|------|--------|-------|-----------|

Each row names the file, the function or closure that violated the limit, the start line, the
metric name (`cyclomatic_max`, `sloc_function_max`, …), the measured value, and the policy
threshold.

**Remediating common violations:**

- **Over-complex functions (`cyclomatic_max`, `cognitive_max`)** — extract helper functions,
  reduce branching, or refactor deeply nested logic into smaller well-named functions.
- **Oversized files (`sloc_file_max`, `loc_file_max`)** — split large files into focused
  modules; move unrelated utilities to a separate file.
- **Too many closures (`nom_closures_file_max`)** — lift inline closures into named functions
  or move them to a shared utility module.

On a passing run the script prints a measured-metric summary table with the header
`| METRIC | VALUE | LIMIT |` so you can see the current headroom against each threshold.

**Out of scope:** IDE/editor integration is explicitly out of scope for this gate. Run
`make lint-metrics` from the command line or rely on CI — there is no language-server
plugin.

### Commit your update

Commit the changes once you are happy with them.
Don't forget to self-review to speed up the review process :zap:.

Our commits are based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Docker base-image policy (Alpine)

Every Dockerfile must use an Alpine-based image wherever an Alpine variant exists, for a
smaller image and reduced attack surface.

This is enforced by `scripts/ci/alpine_base_guard.sh scan`, run by the `alpine base guard`
workflow on PRs to `main`. Run it locally before pushing:

```bash
bash scripts/ci/alpine_base_guard.sh scan
```

The guard checks every `Dockerfile`, `Dockerfile.<suffix>`, `<prefix>.Dockerfile`,
`Containerfile`, and `Containerfile.<suffix>` in the repo. A base counts as Alpine when its tag
or final repository segment says so (e.g. `oven/bun:1.3.14-alpine`, `alpine:3.19`); an
Alpine-based image that does not advertise this in its name (e.g. `alpine/git`) still needs an
exception.

Exceptions (default-deny): when no Alpine variant is usable, add an inline
`# alpine-exception: <reason>` comment to the Dockerfile (a reason is required), or apply the
`docker-alpine-exception` PR label for emergencies. The marker is file-scoped — one marker
waives every non-Alpine base in that file — so scrutinise multi-stage Dockerfiles carrying one.

Current documented exception: `Dockerfile.playwright` — the official Playwright browser base
is glibc-only, with no Alpine/musl variant published.

### Pull Request

When you're finished with the changes, create a pull request, also known as a PR.

- Fill the "Ready for review" template so that we can
  review your PR. This template helps reviewers understand your changes as well
  as the purpose of your pull request.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
  if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork)
  so the branch can be updated for a merge. Once you submit your PR, our team member
  will review your proposal. We may ask questions or request additional information.
- We may ask for changes to be made before a PR can be merged, either using
  [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request)
  or pull request comments. You can apply suggested changes directly through the UI.
  You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as
  [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, checkout this
  [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you
  resolve merge conflicts and other issues.

### Dockerfile build performance

If your change touches a Dockerfile or the gate's own config, CI rebuilds each
configured image, measures its size and build time, and runs `dive` plus
`hadolint` checks against per-image budgets. Budgets live in
`.github/dockerfile-perf.json`, and exceptions are granted via an inline
`# perf-exception[:gate]: <reason>` marker or a
`docker-perf-exception[:name]` PR label.

Current image matrix and thresholds:

- `toolkit` -> `Dockerfile` -> 1550 MiB budget with 10% tolerance
- `playwright` -> `Dockerfile.playwright` -> 1500 MiB budget with 15% tolerance

All three gates are evaluated for every configured image:

- final image size versus the configured budget and tolerance
- `dive --ci` layer-efficiency checks from `.dive-ci`
- `hadolint` warning-and-above checks from `.hadolint.yaml`

The known documented exception in this repo is `Dockerfile.playwright`, which
contains:

`# perf-exception:size,dive: glibc-only Playwright vendor base`

That exception keeps the Playwright runner measured and reported, but waives the
`size` and `dive` gates that its glibc-only vendor base makes unavoidable: the
image is far larger than any musl base and, at >99% layer efficiency, still
trips dive's absolute wasted-bytes gate purely on scale. `hadolint` stays
enforced, and other images are unaffected. Prefer the inline marker over PR
labels because it documents the reason next to the Dockerfile. Use
`docker-perf-exception` only when every image in the PR needs the waiver, or
`docker-perf-exception:<name>` when only one configured image should be waived;
a PR label grants a blanket waiver and widens any inline marker, so it waives
every gate even when the Dockerfile documents a narrower exception.

### Your PR is merged

Congratulations :tada::tada: Our team thanks you :sparkles:.

Now that you are part of the ui-toolkit community.
