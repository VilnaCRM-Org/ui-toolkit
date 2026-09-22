# CLAUDE.md

Entry point for AI coding agents working in `@vilnacrm/ui-toolkit`. Every path and command
named here exists in the repository; `tests/unit/config/claude-md-pointers.test.ts` fails when
one stops resolving.

## What this repository is

A shared React component library: React 19, MUI 9 with Emotion, TypeScript 6, Storybook 10,
Jest with React Testing Library, Playwright (e2e, visual, a11y) and Stryker mutation testing.
The package manager is `bun@1.3.5`; Node is `^20.19.0 || ^22.13.0 || >=24`. It is published as
a tarball attached to each GitHub release, not to the npm registry.

## Read these first

- [agents.md](agents.md) — the binding test-coverage contract: which test layer a change needs,
  the mandatory scenario classes (positive, negative, edge, state matrix), the observability
  stance, and the Definition of Done. Nothing here overrides it.
- [CONTRIBUTING.md](CONTRIBUTING.md) — the merge bar in detail: `make ci` / `make verify`, the
  commit convention, file naming, the dependency-graph and complexity gates, the Docker and
  supply-chain pinning policies.
- [README.md](README.md) — the consumer-facing API: installing, theming, localization, the
  public-API and versioning contract, and the development setup.
- `specs/planning-artifacts/` — requirements traceability:
  [prd.md](specs/planning-artifacts/prd.md),
  [architecture.md](specs/planning-artifacts/architecture.md),
  [epics.md](specs/planning-artifacts/epics.md), the component provenance ledger and the export
  contract. Reference the story or issue a change implements.

## Commands

Every command is a Makefile target run from the repository root; `make help` prints the
authoritative list. The targets run inside the Docker `bun` service, so `make start-bun` (or
`make install`) comes first in a fresh checkout.

| Target                                     | Purpose                                             |
| ------------------------------------------ | --------------------------------------------------- |
| `make ci`                                  | Pre-push set: lint, build, unit, integration, Bats  |
| `make verify`                              | Merge bar: `ci` + mutation, e2e, visual, Lighthouse |
| `make lint`                                | ESLint, tsc, Markdown, Prettier, ranges, i18n keys  |
| `make lint-deps` / `make lint-metrics`     | dependency-cruiser / rust-code-analysis gates       |
| `make test-unit` / `make test-integration` | Jest suites with the 100% coverage threshold        |
| `make test-bats`                           | Bats coverage of Makefile and `scripts/ci/` flows   |
| `make test-storybook` / `make test-a11y`   | Story play functions / axe-core gates               |
| `make test-visual` / `make test-e2e`       | Playwright against a static Storybook build         |
| `make storybook-start`                     | Storybook on port 6006                              |
| `make build` / `make package`              | Library build / release tarball                     |

Static gates that need no container also run on the host once `bun install --frozen-lockfile`
has completed: `bun x tsc --noEmit`, `bun x eslint .`, `bun x prettier . --check`,
`bun x markdownlint "**/*.md"` and `bun scripts/ci/check-referenced-paths.ts`. The suites
(Jest, Playwright, Stryker, Lighthouse, memlab) stay in Docker: they depend on the pinned
images.

## Rules that gate a merge

- Commits and pull-request titles follow `<type>(#<issue>): <subject>`; the `.husky/commit-msg`
  hook and the `commit convention` workflow enforce it.
- Tests live under the root `tests/` tree, mirrored by layer (`tests/unit`, `tests/integration`,
  `tests/e2e`, `tests/visual`, `tests/a11y`, `tests/bats`); `make lint-test-structure` rejects
  anything else.
- Coverage is 100% on unit and integration, and the mutation gate is fail-closed. Never lower a
  threshold, disable a rule or skip a gate to get green — fix the code.
- Files and directories are kebab-case; components live in `src/components/<ui-name>/` with
  their `index.tsx`, `styles.ts`, story and types beside each other.
- New root-level files must be added to the `COPY` list in the `Dockerfile`, or the container
  gates never see them.

## Environment bootstrap

- `.claude/settings.json` (tracked) allowlists the read-only verification commands and runs
  `.claude/hooks/session-start.sh` at session start, which installs dependencies from the
  lockfile and prints which targets run natively and which need Docker.
- `.devcontainer/devcontainer.json` builds the same digest-pinned image as CI from the
  repository `Dockerfile` with the workspace bind-mounted, so the native commands above run
  inside it; the Docker-only `make` targets run from the host beside it.

## BMAD-METHOD integration (local tooling only)

The slash commands in this section come from the `bmalph` CLI, which generates `_bmad/` and
`.claude/commands/` in a clone; both are gitignored, so the commands exist only where the tool
has been run. Skip this section when `_bmad/` is absent.

Use `/bmalph` to navigate phases, `/bmad-help` to discover all commands, `/bmalph-status` for a
quick overview, and see `_bmad/COMMANDS.md` for the full reference.

Phases:

1. Analysis — understand the problem: `/create-brief`, `/brainstorm-project`, `/market-research`.
2. Planning — define the solution: `/create-prd`, `/create-ux`.
3. Solutioning — design the architecture: `/create-architecture`, `/create-epics-stories`,
   `/implementation-readiness`.
4. Implementation — build it: `/sprint-planning`, `/create-story`, then `/bmalph-implement`
   for Ralph.

Work through phases 1–3 with the BMAD agents and workflows, then run `/bmalph-implement` to
transition the planning artifacts into Ralph format and start Ralph.

Management commands: `/bmalph-status` (current phase, Ralph progress, version),
`/bmalph-implement` (planning artifacts → Ralph loop), `/bmalph-upgrade` (update bundled assets),
`/bmalph-doctor` (project health).

Agents: `/analyst` (research, briefs, discovery), `/architect` (technical design), `/pm` (PRDs,
epics, stories), `/sm` (sprint planning, status), `/dev` (implementation), `/ux-designer` (user
experience, wireframes), `/qa` (test automation, quality assurance).
