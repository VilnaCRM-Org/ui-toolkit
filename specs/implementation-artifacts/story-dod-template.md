# Story Definition of Done — Shared Checklist Template

Every story records its completion evidence by instantiating this checklist in its
story artifact (`specs/implementation-artifacts/<story>.md`) or, for closure stories,
in the epic DoD artifact. Referenced by the Epic 4+ acceptance criteria as the shared
Definition of Done checklist (`specs/planning-artifacts/epics.md`).

## 1. Changed files

- [ ] Every created/modified/deleted source, test, story, and spec file is listed in
      the story artifact (or directly reviewable in the linked PR diff).

## 2. Provenance (Reuse-First Delivery Rule, PRD §3.2–3.4)

- [ ] **Source** recorded for each delivered module: `crm` / `website` / `new`,
      with repository remote and the audited commit hash for copied/reused code.
- [ ] **Reuse rationale** recorded: why this source was chosen, and — when both
      sources contain similar components — how the canonical-source policy
      (`crm` behavior-canonical, `website` visual gap-fill) was applied.
- [ ] **Reference IDs** recorded in PR/issue metadata: issue number(s), source
      file paths, and design node IDs (Figma) backing the delivered visuals.
- [ ] `specs/planning-artifacts/component-provenance.md` updated for every
      delivered or materially changed component.

## 3. Tests run

- [ ] Unit tests added/updated for render + key behavior expectations; suite green.
- [ ] Integration/e2e coverage updated where the story touches composed flows.
- [ ] Full local gate evidence captured (lint chain, type check, coverage,
      visual baselines) or explicitly deferred with an owning story noted.

## 4. Stories (Storybook) added/updated

- [ ] Storybook stories exist for every delivered variant/state in scope.
- [ ] Visual regression baselines generated in the pinned Playwright image and
      registered where required (`tests/visual/stories.json`).

## 5. Export changes

- [ ] Public exports added/updated in `src/components/index.ts` (or the owning
      public entry point) and reflected in the export-surface unit test.
- [ ] No unintended export-surface changes (removals/renames) without a
      documented contract note.

## 6. Parity evidence (when the story has a design or source-parity mandate)

- [ ] Figma parity verified against the referenced node IDs (live measurement
      or screenshot comparison) for visual scope.
- [ ] Behavior parity verified against the canonical source (`crm`) for copied
      behavior — including animation timing/easing/keyframes for skeletons
      (PRD §3.4: parity is release-blocking; no redesign allowed).
