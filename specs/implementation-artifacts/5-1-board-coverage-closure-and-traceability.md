# Story 5.1 — Board Coverage Closure and Traceability

- **Issue:** [#31](https://github.com/VilnaCRM-Org/ui-toolkit/issues/31)
- **PR:** [#125](https://github.com/VilnaCRM-Org/ui-toolkit/pull/125)
- **Epic:** Epic 5 — Production Adoption Readiness
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 5.1: Board Coverage
  Closure and Traceability_

## Scope

Establish the canonical board-to-component coverage map required by `prd.md` §5.6,
FR-01 and §9.1, so that every board element in `prd.md` §4 resolves to a delivered
component or an explicit non-goal decision, with export, Storybook and unit-test
evidence attached to each row. This story is documentation + traceability + one
drift-guard test, plus the closure of the single blocker the mapping surfaced
(BLOCK-01 — the `UiLink` `disabled` state that Board A paints and `prd.md` FR-04
acceptance 4 requires): no export-surface change, no provenance completion, no
governance report.

Boundaries held deliberately:

- **Story 5.2** owns provenance completion and canonical-compliance rulings.
- **Story 5.3** owns export-contract remediation.
- **Story 5.4** owns the consolidated release-readiness governance report.
- The Epic 1–4 quality-gate closure stories
  ([#27](https://github.com/VilnaCRM-Org/ui-toolkit/issues/27),
  [#28](https://github.com/VilnaCRM-Org/ui-toolkit/issues/28),
  [#29](https://github.com/VilnaCRM-Org/ui-toolkit/issues/29),
  [#30](https://github.com/VilnaCRM-Org/ui-toolkit/issues/30)) own gate sign-off;
  the checklist's `Done` token asserts delivery evidence only, never gate closure.

## Coverage finding

Board scope was measured against the Figma frames directly rather than inferred from
the implementation inventory. All 38 mapped board elements resolve to a delivered
component or to an explicit non-goal; none remains blocked:

| Board                                      | Figma frame | Required elements | `Done` | `Non-goal` | `Blocked` | Verdict |
| ------------------------------------------ | ----------- | ----------------- | ------ | ---------- | --------- | ------- |
| A — buttons, core controls, micro-parts    | `439:19252` | 13                | 13     | 0          | 0         | CLOSED  |
| B — inputs, lists, pagination, multiselect | `439:19374` | 7                 | 6      | 1          | 0         | CLOSED  |
| C — cards                                  | `439:19893` | 3                 | 3      | 0          | 0         | CLOSED  |
| D — skeletons                              | `538:38316` | 15                | 15     | 0          | 0         | CLOSED  |
| **Total**                                  | —           | **38**            | **37** | **1**      | **0**     | CLOSED  |

`prd.md` §9.1 ("the canonical coverage checklist is fully closed and current") is
therefore **satisfied**. The single `Non-goal` (D-15, Board B's period segmented
switcher) carries an explicit recorded decision, and the one blocker this story
surfaced — BLOCK-01 — was closed inside the story by delivering the missing state
rather than by waiving it.

### BLOCK-01 — Board A §4.1 item 3, "Link states": RESOLVED (disabled delivered)

Board A `439:19252` is a four-column Rest/Hover/Active/**Disabled** grid (headers
`439:19261`, `439:19263`, `439:19264`, `439:19265`) and the link row is painted in all
four columns (`439:19361`-`439:19364`, plus the second link row
`439:19611`-`439:19614`). The disabled column is a **distinct** paint, not a rest
copy: rest `439:19361` is `#969B9D` (Font/300 Placeholder), disabled `439:19364` is
`#E1E7EA` (Brand gray). Both cells were re-measured for this closure by sampling the
rendered node bitmaps: the two glyph runs are pixel-identical in extent and count
(346 ink pixels each at the same size), so the board carries **no typography and no
text-decoration delta** between rest and disabled — the ink alone changes. The same
`#E1E7EA` applies to the second row's disabled cell `439:19614`.

`UiLink` originally could not express it: `src/components/ui-link/types.ts` declared
`disabled` a contract exception, and the string appeared nowhere else under
`src/components/ui-link/` — no prop, no styling, no test — while `prd.md:182` (FR-04
acceptance 4) independently requires `UiLink` to expose `disabled`.

**Closed via the checklist's "Deliver" closure path**, in this story:

- `src/components/ui-link/types.ts` — `disabled?: boolean` added with JSDoc semantics;
  the shared-contract exception list shrank to `value`, `onChange`, `error`, `size`,
  `variant`.
- `src/components/ui-link/index.tsx` — the anchor keeps `href` (dropping it would
  strip the `link` role and the accessible name) and additionally renders
  `aria-disabled="true"`, `tabIndex={-1}` (the Story 1.3 tab-order-exclusion pattern)
  and a click handler that calls `preventDefault()`, so activation cannot navigate.
  Props are applied explicitly — no spread, no `eslint-disable`, no `@ts-ignore`; the
  `rel` merge moved into a small module-private helper so every function stays inside
  the rust-code-analysis per-function ceilings.
- `src/components/ui-link/theme.ts` — `&[aria-disabled="true"]` sets `color` to the
  `brandGray` token (`#E1E7EA`) from `ui-color-theme` and `cursor: default`, with
  nested `:hover`/`:active` resets so the `textLinkHover`/`textLinkActive` accents
  cannot fire while disabled. No hex literal was added, and no decoration override was
  emitted (the board shows no such delta). `pointer-events` is deliberately **not**
  set: the state is enforced semantically, and suppressing pointer events would make
  the suppressed-activation behaviour untestable.
- `src/components/ui-link/link.stories.tsx` — a `disabled` boolean control on the
  existing `Link` story. No new story export, so `tests/visual/stories.json` and the
  smoke baselines are untouched; the state is forced through the story-arg URL, the
  established repo pattern.
- `tests/visual/states.spec.ts` — `link disabled` test
  (`openStory(page, 'uicomponents-uilink--link', 'disabled:!true')` →
  `link-disabled.png`).
- `tests/unit/ui-link.test.tsx` — pins both sides of every added branch: the ARIA flag
  present/absent (including an explicit `disabled={false}`), `tabindex="-1"` vs
  absent, activation cancelled vs allowed (`fireEvent.click` return value), the
  `brandGray` ink asserted from the emitted emotion rule, the retained underline, and
  the new-tab `rel`/notice contract still intact under `disabled`.
- `tests/unit/core-controls-accessibility.test.tsx` — the core-control disabled
  contract now covers `UiLink`: `aria-disabled` present when disabled and absent when
  not, and the disabled link skipped by `Tab` via the shared
  `expectSkippedInTabOrder` helper.
- `specs/planning-artifacts/component-provenance.md` — the `UiLink` row records
  `rest/hover/active/disabled`, the node ids and the token; `error` is now the sole
  documented contract exception (FR-04 marks it optional).

The checklist's Board A row is `Done`, Board A's verdict is CLOSED, and the
"Unresolved blockers" section keeps BLOCK-01 as a resolution record rather than
deleting it, so the audit trail survives.

## Deliverables

1. `specs/planning-artifacts/board-coverage-checklist.md` — the canonical checklist.
   Four board sections, each a table carrying the `prd.md` §5.6 row contract (board
   element → component → implementation status → `src/components/index.ts` export link
   → Storybook coverage URL/status → unit test coverage report link/status) plus a
   "delivering story / notes" column, and each closed by an explicit bold board
   verdict line. Supporting sections: a "how to read this file" legend fixing the
   three allowed status tokens (`Done` / `Non-goal` / `Blocked`) and the `Done` scope
   disclaimer; the local Storybook URL template (no public deployment — issue
   [#88](https://github.com/VilnaCRM-Org/ui-toolkit/issues/88)); the local coverage
   report path template (no published coverage artifact — issue
   [#103](https://github.com/VilnaCRM-Org/ui-toolkit/issues/103)); the Figma board node
   map; the coverage roll-up; 18 documented non-goals/deferrals (D-01…D-18) each with
   kind, citation and board impact; the BLOCK-01 blocker record; an appendix recording
   board paints that no `prd.md` §4 item enumerates; an appendix mapping every public
   export outside board scope, making the mapping bidirectional; and a hand-offs
   section for items owned by Stories 5.2–5.4.
2. `tests/unit/board-coverage-traceability.test.ts` — drift guard. Parses the
   checklist and fails the unit suite when a row's backticked export identifier is
   missing from `src/components/index.ts`, when a referenced story or test path does
   not exist on disk, when a status cell carries a token outside the allowed set, or
   when the per-board counts drift from the rows above them. This makes "objectively
   verifiable" (Story 5.1 AC 2) machine-enforced instead of review-dependent.
3. This artifact, plus the `sprint-status.yaml` transition of Epic 5 to `in-progress`.

## Verification performed

- Every backticked `src/…`, `tests/…` and `specs/…` path in the checklist exists on
  disk, with one intentional exception:
  `tests/unit/board-coverage-traceability.test.ts` is referenced by the header as the
  machine check and is delivered by this same story.
- Every backticked export identifier in all 37 export-bearing cells resolves in
  `src/components/index.ts` (the one `Non-goal` row maps to no export by definition).
- Every primary Storybook story id cited was cross-checked against the 120 ids in
  `tests/visual/stories.json` — zero mismatches.
- Per-board counts in the verdict lines and in the roll-up table match a parse of the
  rows above them.
- Board scope and the BLOCK-01 colour evidence were read from the Figma frames
  A `439:19252`, B `439:19374`, C `439:19893`, D `538:38316` (file
  `xZ7ccrH6d4QyqLQsayFSEX`, page "Ui kit" `439:19251`).

## Figma verification round 1

The checklist was re-audited against the four board frames (file `xZ7ccrH6d4QyqLQsayFSEX`:
A `439:19252`, B `439:19374`, C `439:19893`, D `538:38316`) — one audit per board, followed by an
independent adversarial refutation pass over every candidate. 13 candidates were raised; 9 survived
refutation, 4 were refuted and dropped. All 9 are documentation-only; no component code changed.

| Finding                                                                             | Disposition applied                                                                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A-02 — social-icon 4-state row (`439:19285`, `439:19296`, `439:19307`, `439:19318`) | Recorded in the new "board paints outside `prd.md` §4 scope" appendix: board-painted, §4.1-absent, expressed by no delivered component (`UiFooter`'s 20×20 glyph links are not it), flagged for Component Lead confirmation in this PR, candidate follow-up story; kept distinct from D-02's 189×58 Google `socialButton`.                                                                                        |
| A-03 — "option group" cluster (`448:25628`/`448:25615`)                             | Ruled a consumer composition of `UiCheckbox` rows (Story 3.5 composition-boundary precedent), board-present but §4.1-absent. Note on the Board A checkbox row + `component-provenance.md` mirror. No count change.                                                                                                                                                                                                |
| A-04 — `UiFileUploadInput` "no Figma component" gloss                               | Board A item-7 note and D-12 reworded: no reusable Figma **master**, but the titled five-state cluster (`449:25635`, `449:25710`, `449:25717`, `449:25703`, `449:25724`, `449:25676`, labels `449:25668`-`449:25672`) is on the board and the component's styling tracks it. The stale provenance row (`193:4763`/`269:7159`) is handed to Story 5.2.                                                             |
| A-06 — `UiFilterChip` node-range gloss                                              | Replaced with the measured per-state ids (rest `439:19370`, hover `439:19372`, active `439:19373`, disabled `439:19371`), matching `component-provenance.md` verbatim.                                                                                                                                                                                                                                            |
| B-01 — period segmented switcher (`439:19868`/`439:19877`)                          | **Scope ruling, not a blocker:** recorded as a Board B `Non-goal` row plus deferral D-15 — board-painted but unenumerated in `prd.md` §4.2 (PRD transcription gap), ruled outside `v1.0.0` required scope by the release owner, surfaced for Component Lead confirmation in this PR, with a dedicated segmented period-switcher component as the recommended follow-up story. Board B stays CLOSED at 7 elements. |
| B-02 — calendar Figma provenance missing                                            | Measured ids added to the Board B calendar row and mirrored into `component-provenance.md` (rest `601:54620`, hover `606:41801`, range selection `606:41904`, cross-month pair `606:42007`/`606:42218`).                                                                                                                                                                                                          |
| C-02 — `UiIntegrationCard` disabled escalation unregistered                         | Added as escalation D-16; Board C row 3 now cites it beside D-03.                                                                                                                                                                                                                                                                                                                                                 |
| BD-01 — wide medium block/chart paints unreachable                                  | Added as deviation D-17; the Board D medium row now scopes `columns` to `variant="task-list"` and cites the real provenance (the 4.3 artifact + the Epic 4 provenance row) instead of the mislabeled "derived-table-footprint" citation, which belonged to `UiSkeletonTable`.                                                                                                                                     |
| BD-02 — dual-avatar anatomy of `632:46480`                                          | Added as deviation D-18; the Board D medium row no longer lets the cited `632:46444`-`632:46506` range silently absorb it, and the provenance "matching the board" claim is qualified.                                                                                                                                                                                                                            |

Counts moved by exactly one element: Board B 6 → 7 (`6 Done, 1 Non-goal, 0 Blocked`, still CLOSED)
and the total 37 → 38. Deferral ids D-15…D-18 were assigned sequentially in file order after the
previous highest, D-14. BLOCK-01 was left untouched by this round and closed separately within the
same story by delivering the `UiLink` disabled state, which took the total to
`37 Done, 1 Non-goal, 0 Blocked` (CLOSED).

## Hand-offs recorded, owned elsewhere

Recorded in the checklist so they are not lost; resolving them is out of this story's
scope:

- `ComposedSkeleton` (`src/components/ui-skeletons/composed.tsx`) is deliberately
  internal and not publicly exported — Story 5.3's export sweep must not read it as a
  missing export.
- `src/components/ui-card-item` has stories, unit tests and committed visual baselines
  but is not exported from `src/components/index.ts` — outside board scope, but a real
  export-surface inconsistency for Story 5.3.
- Epic 1 issue mapping (Story 1.1 = [#10](https://github.com/VilnaCRM-Org/ui-toolkit/issues/10),
  1.2 = [#11](https://github.com/VilnaCRM-Org/ui-toolkit/issues/11),
  1.3 = [#12](https://github.com/VilnaCRM-Org/ui-toolkit/issues/12)) is captured in the
  checklist rows, because Epic 1 branches carry no issue prefix.

## Changed files

| File                                                                            | Change   |
| ------------------------------------------------------------------------------- | -------- |
| `specs/planning-artifacts/board-coverage-checklist.md`                          | new      |
| `specs/implementation-artifacts/5-1-board-coverage-closure-and-traceability.md` | new      |
| `specs/planning-artifacts/component-provenance.md`                              | modified |
| `specs/implementation-artifacts/sprint-status.yaml`                             | modified |
| `tests/unit/board-coverage-traceability.test.ts`                                | new      |
| `src/components/ui-link/types.ts`                                               | modified |
| `src/components/ui-link/index.tsx`                                              | modified |
| `src/components/ui-link/theme.ts`                                               | modified |
| `src/components/ui-link/link.stories.tsx`                                       | modified |
| `tests/unit/ui-link.test.tsx`                                                   | modified |
| `tests/unit/core-controls-accessibility.test.tsx`                               | modified |
| `tests/visual/states.spec.ts`                                                   | modified |

The traceability work itself delivers no component code. The seven `ui-link` and
`tests` entries above are the BLOCK-01 closure: a state that the board already
specified and `prd.md` FR-04 acceptance 4 already required, added to an existing
component. No new module, no `package.json` change, and no public-export change
(`UiLink` was already exported).

## Definition of Done (instantiated from `story-dod-template.md`)

### 1. Changed files

- [x] Every created/modified file is listed in the Changed files table above and is
      reviewable in the PR diff.

### 2. Provenance (Reuse-First Delivery Rule, PRD §3.2–3.4)

- [x] **Source** — not applicable as a component source: this story delivers no
      component code, so no module carries a new `crm` / `website` / `new` marking.
      The per-element source markings already recorded by Stories 1.1–4.3 are cited
      in the checklist's notes column rather than re-derived.
- [x] **Reuse rationale** — no new module, so no canonical-source selection was made.
      The checklist reproduces the existing rationale citations by reference.
- [x] **Reference IDs** — issue [#31](https://github.com/VilnaCRM-Org/ui-toolkit/issues/31),
      the delivering-story issue numbers on all 37 delivered rows, and the Figma board node ids
      (A `439:19252`, B `439:19374`, C `439:19893`, D `538:38316`) are recorded in the
      checklist and in this artifact.
- [x] `component-provenance.md` updated — the `UiLink` row now records the delivered
      `disabled` state (FR-04 acceptance 4, BLOCK-01, this story) with the measured node
      ids `439:19364` / `439:19614`, the `brandGray` (`#E1E7EA`) token it is painted from,
      and `error` as the sole remaining contract exception. The remaining edits are
      traceability mirrors of Figma verification round 1 (`UiCheckbox` option-group ruling,
      `UiCalendarMultiSelect` node ids, `UiSkeletonWidget` D-17/D-18 deviations) so the
      checklist and the registry do not disagree. Provenance **completion** across the
      delivered set remains Story 5.2's acceptance criteria and is not pre-empted here — the
      stale `UiFileUploadInput` row is handed over, not fixed.

### 3. Tests run

- [x] Unit test added: `tests/unit/board-coverage-traceability.test.ts` locks the
      checklist against export, path, status-token and count drift.
- [x] Unit tests added for the BLOCK-01 closure: `tests/unit/ui-link.test.tsx` pins both
      sides of every added branch (`aria-disabled` present/absent, `tabindex="-1"` vs
      absent, activation cancelled vs allowed, the `brandGray` ink, the retained
      underline, and the new-tab `rel`/notice contract under `disabled`), and
      `tests/unit/core-controls-accessibility.test.tsx` extends the shared core-control
      disabled contract to `UiLink`.
- [ ] Integration/e2e coverage — **not applicable.** This story touches no composed
      runtime flow; there is no behaviour to exercise end-to-end.
- [x] Local gate evidence: unit suite plus the formatter/lint chain run for the added
      test and the Markdown artifacts. Coverage, mutation and visual gate closure
      remain owned by the Epic 1–4 closure stories (issues #27–#30) and by Story 5.4,
      as recorded in the checklist's `Done` scope disclaimer.

### 4. Stories (Storybook) added/updated

- [x] Storybook — no new story export. The BLOCK-01 closure adds a `disabled` boolean
      control to the existing `uicomponents-uilink--link` story, so
      `tests/visual/stories.json` and the smoke baselines stay unchanged and the state is
      forced through the story-arg URL, per the established repo pattern. Existing story
      coverage for all 38 board elements is inventoried in the checklist's Storybook
      column.
- [x] Visual regression baseline — `tests/visual/states.spec.ts` gains a `link disabled`
      test producing `link-disabled.png`, generated in the pinned Playwright Docker image
      like every other state baseline. `tests/visual/stories.json` is unchanged (it is
      read by this story as the verification source for story ids, not modified).

### 5. Export changes

- [x] No public export was added, removed or renamed; `src/components/index.ts` is
      untouched. The checklist instead asserts, per row, that the mapped export already
      exists — enforced by the drift guard.
- [x] No unintended export-surface change. The two export-surface inconsistencies found
      while mapping (`ui-card-item` unexported, `ComposedSkeleton` internal-by-design)
      are recorded as hand-offs to Story 5.3, not acted on here.

### 6. Parity evidence

- [x] Figma parity verified against the board frames A `439:19252`, B `439:19374`,
      C `439:19893`, D `538:38316` (file `xZ7ccrH6d4QyqLQsayFSEX`, page "Ui kit"
      `439:19251`): board element counts per board were read from the frames.
- [x] Parity of the delivered `UiLink` disabled state verified against the named nodes:
      `439:19364` and `439:19614` (disabled) re-measured at `#E1E7EA` against
      `439:19361` (rest) at `#969B9D`, with identical glyph extent — no typography and no
      text-decoration delta — so `ui-link/theme.ts` repaints only the ink, from the
      `brandGray` token rather than a hex literal.
- [x] Behaviour parity against `crm` — no copied behaviour in this story; the Board D
      animation-parity contract stays locked by the Story 4.1 test
      `tests/unit/skeleton-crm-parity.test.ts`, which this story cites but does not
      modify.
