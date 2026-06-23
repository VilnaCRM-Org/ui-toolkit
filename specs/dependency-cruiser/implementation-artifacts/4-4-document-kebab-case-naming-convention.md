# Story 4.4: Document the kebab-case naming convention

Status: draft

## Story

As a contributor,
I want documentation stating the kebab-case naming convention and how it is enforced,
so that I name new files and folders correctly and know how to verify them before review.

## Acceptance Criteria

1. `CONTRIBUTING.md` (and a brief pointer in `README.md`) states that all files and folders under
   `src/` and `tests/` are lowercase kebab-case, matching the CRM repo's convention.
2. The documentation gives concrete examples showing the post-migration layout:
   `src/components/ui-button/index.tsx`, `src/components/ui-card-item/card-content.tsx`, and a
   nested subcomponent path such as `src/components/ui-footer/privacy-policy/privacy-policy.tsx`.
3. The documentation explicitly states that only file and directory PATHS become kebab-case;
   React component EXPORT identifiers stay PascalCase (e.g. the file `ui-button/index.tsx` still
   does `export const UiButton`), so the public API and consumer imports are unchanged.
4. The documentation states the convention is enforced by `make lint-dep-cruiser` via the
   `no-uppercase-paths` rule plus the kebab-case naming rules (`component-name-kebab-case` /
   `test-name-kebab-case`), and that the gate is zero-tolerance with no `depcruise-baseline`.
5. The documentation references `make lint-dep-cruiser` as the command contributors run to verify
   naming locally — never the raw `bun x depcruise` invocation.
6. The naming section cross-references the existing dependency-rule documentation added by
   Story 3.1 (the `## Dependency graph hygiene (dependency-cruiser)` section), so naming guidance
   sits alongside, not duplicating, the graph-hygiene guidance.
7. The documentation notes the convention is enforced only after the Epic 4 migration
   (Stories 4.1–4.3) and that test files are likewise kebab-case (e.g. `auth-skeleton.spec.ts`,
   `back-to-main.spec.ts`).

## Tasks / Subtasks

- [ ] Task 1: Add the kebab-case naming convention to `CONTRIBUTING.md` (AC: 1, 2, 3, 7)
  - [ ] 1.1 Add a `## File and folder naming (kebab-case)` subsection adjacent to the existing
        `## Dependency graph hygiene (dependency-cruiser)` section from Story 3.1.
  - [ ] 1.2 State that all files and folders under `src/` and `tests/` are lowercase kebab-case,
        matching the CRM repo.
  - [ ] 1.3 Give concrete examples reflecting the migrated tree: `src/components/ui-button/index.tsx`,
        `src/components/ui-card-item/card-content.tsx`, and a nested example like
        `src/components/ui-footer/privacy-policy/privacy-policy.tsx`; include a test-file example
        (`tests/e2e/auth-skeleton.spec.ts`, `tests/e2e/back-to-main.spec.ts`).
  - [ ] 1.4 State that React component EXPORT identifiers remain PascalCase (the file
        `ui-button/index.tsx` still exports `UiButton`); only file/dir PATHS are kebab-case, so the
        public API and consumer imports are unchanged.

- [ ] Task 2: Document how the convention is enforced (AC: 4, 5, 6)
  - [ ] 2.1 State that `make lint-dep-cruiser` enforces naming via the `no-uppercase-paths` rule
        plus the kebab-case naming rules (`component-name-kebab-case` / `test-name-kebab-case`),
        added in Story 4.3.
  - [ ] 2.2 Reference `make lint-dep-cruiser` only — do NOT instruct contributors to call
        `bun x depcruise --config .dependency-cruiser.js src` directly.
  - [ ] 2.3 State the gate is zero-tolerance with no `depcruise-baseline`: a stray PascalCase path
        fails the gate and the offending path/rule is named in the `text` output.
  - [ ] 2.4 Cross-reference the Story 3.1 `## Dependency graph hygiene (dependency-cruiser)`
        section so naming and graph-hygiene guidance live side by side.

- [ ] Task 3: Add a brief naming pointer to `README.md` (AC: 1, 6)
  - [ ] 3.1 Add a one-line note that file/folder naming is lowercase kebab-case, enforced by
        `make lint-dep-cruiser`, linking to the `CONTRIBUTING.md` naming section.

- [ ] Task 4: Verification (AC: 1-7)
  - [ ] 4.1 Confirm `CONTRIBUTING.md` contains the kebab-case naming subsection with the
        `ui-button/index.tsx` and `card-content.tsx` examples and the PascalCase-export caveat.
  - [ ] 4.2 Confirm the enforcement text names `make lint-dep-cruiser`, the `no-uppercase-paths`
        and kebab-case naming rules, and the zero-tolerance / no-baseline nature, with no raw
        `bun x depcruise` invocation.
  - [ ] 4.3 Confirm the cross-reference to the Story 3.1 dependency-graph-hygiene section resolves.
  - [ ] 4.4 Run `make lint-md` (and `make format-check`) and confirm the edited docs pass the
        Markdown lint / prettier gates.

## Dev Notes

### Architecture Decisions (from specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md)

**Kebab-case path normalization (Decision 7).** The naming rules (`no-uppercase-paths`,
`component-name-kebab-case`, `test-name-kebab-case`) are adopted but enabled only in the Epic 4
slice AFTER the kebab-case migration. Decision 7 is explicit that React export IDENTIFIERS stay
PascalCase (`export const UiButton`) and only file/directory PATHS become kebab-case
(`ui-button/ui-button.tsx`) — this story documents exactly that distinction so contributors do not
rename their exports. The migration covers `src/components/**` (dir + file renames, barrels),
`tests/**` (camelCase spec renames), and all internal imports/stories/tests referencing renamed
paths. This story is the documentation deliverable for that decision and adds no rules itself.

**Sequencing.** Per Decision 7 and the Decision Impact Analysis (step 8, "Document the gate in
`CONTRIBUTING.md` and `README.md`"), documentation lands after the rules exist. Stories 4.1/4.2
perform the rename, Story 4.3 enables the three naming rules and verifies a clean gate, and this
story (4.4) documents the resulting convention. It is purely additive to the docs — no
`.dependency-cruiser.js`, `Makefile`, or source changes.

### Project Structure Notes

- **Files modified:** `CONTRIBUTING.md` (add the kebab-case naming subsection beside the
  Story 3.1 `## Dependency graph hygiene (dependency-cruiser)` section) and `README.md` (one-line
  pointer). No source, config, or `Makefile` changes.
- **Examples must reflect the migrated tree, not the current one.** The current tree is still
  PascalCase (`src/components/UiButton/index.tsx`, `src/components/UiCardItem/CardContent.tsx`,
  `src/components/UiFooter/PrivacyPolicy/PrivacyPolicy.tsx`, `tests/e2e/authSkeleton.spec.ts`); the
  documented examples are the post-4.1/4.2 kebab-case forms (`src/components/ui-button/index.tsx`,
  `src/components/ui-card-item/card-content.tsx`,
  `src/components/ui-footer/privacy-policy/privacy-policy.tsx`, `tests/e2e/auth-skeleton.spec.ts`).
- **No new files** are created. The renames themselves (via `git mv`) are Stories 4.1/4.2; the
  rule additions are Story 4.3.

### Testing Approach

This story is documentation-authoring; verification is by inspection plus the Markdown gates:

- Inspect `CONTRIBUTING.md` for the kebab-case naming subsection: the all-lowercase statement, the
  `ui-button/index.tsx` / `card-content.tsx` examples, the PascalCase-export caveat, the
  `make lint-dep-cruiser` enforcement note (`no-uppercase-paths` + kebab-case naming rules,
  zero-tolerance/no-baseline), and the Story 3.1 cross-reference.
- Inspect `README.md` for the one-line naming pointer linking to the `CONTRIBUTING.md` section.
- Run `make lint-md` and `make format-check` to confirm the edited docs pass the Markdown lint and
  prettier gates (host-side, per repository convention).

### References

- Architecture:
  `specs/dependency-cruiser/planning-artifacts/architecture-dependency-cruiser-2026-06-23.md`
  - Decision 7: Kebab-case Path Normalization & Migration (paths kebab-case, exports stay
    PascalCase, Epic 4 sequencing)
  - Decision Impact Analysis (step 8 — document the gate in `CONTRIBUTING.md` / `README.md`)
- Epics: `specs/dependency-cruiser/planning-artifacts/epics-dependency-cruiser-2026-06-23.md`
  (Story 4.4)
- PRD: `specs/dependency-cruiser/planning-artifacts/prd-dependency-cruiser-2026-06-23.md`
  - FR24 (contributor documentation of the all-lowercase kebab-case convention, matching CRM)
- Related story:
  `specs/dependency-cruiser/implementation-artifacts/3-1-contributor-documentation-dependency-cruiser-gate.md`
  (the `## Dependency graph hygiene (dependency-cruiser)` section this story cross-references)
- Previous story:
  `specs/dependency-cruiser/implementation-artifacts/4-3-kebab-case-naming-rules-and-clean-gate.md`

## Dev Agent Record

### Agent Model Used

_Pending implementation._

### Debug Log References

_Pending implementation._

### Completion Notes List

_Pending implementation._

### File List

_Pending implementation._

### Change Log

_Pending implementation._
