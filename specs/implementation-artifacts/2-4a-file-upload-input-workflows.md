# Story 2.4A — File Upload Input Workflows

- **Issue:** [#17](https://github.com/VilnaCRM-Org/ui-toolkit/issues/17)
- **PR:** [#114](https://github.com/VilnaCRM-Org/ui-toolkit/pull/114)
- **Epic:** Epic 2 — Selection, Search, and Input Workflows
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 2.4A: File Upload Input Workflows_
- **Definition of Done:** deferred to the shared compliance matrix — `specs/implementation-artifacts/5-2-reuse-canonical-compliance-and-provenance-completion.md` → `### Matrix`, row `2-4a-file-upload-input-workflows.md`. This artifact predates `specs/implementation-artifacts/story-dod-template.md`, which was authored with Epic 4 (commit `3c310f9`), so its DoD is instantiated once against the shared template in that matrix rather than restated here. Raised in the PR #126 review.

## Scope

Deliver `UiFileUploadInput` (`src/components/ui-file-upload-input`) — a native
`<input type="file">` presented as the Figma bordered field with a pill trigger,
extended into a full-field drop target. The control owns selection, validation
and assistive-technology reporting; **the upload request itself stays with the
consuming app** — it reports an upload (`status` + `progress`), it does not
perform one.

Stacked in epic order `main ← 2.2 (#109) ← 2.3 (#107) ← 2.4A (#114)`; the 2.4
radio-group branch (#112) has already merged into the 2.3 branch, so this PR is
based on `feat/issue-15-calendar-multi-select`. GitHub retargets the PR up the
stack as the one below it merges.

## Design decisions

### Figma alignment (composed from real nodes — no upload component exists in the file)

The design system has **no** dedicated file-upload component, so the field is
built from the file input on the "Design CRM" page and the design's own
progress/tag parts:

| Element              | Figma node              | Applied                                                                                              |
| -------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| Field + pill trigger | `193:4763` "Input"      | 46px field, 8px radius, 1px `#D0D4D8`, 15px/7px insets; pill 57px radius, `#1EAEFF`, Golos 15/18     |
| Field label          | `193:4764`              | Inter Medium 12/18 `#404142`, 4px above the field                                                    |
| Progress bar         | `269:7159` / `269:7160` | 8px track `#EAECEE`, `#1EAEFF` fill, 72px radius                                                     |
| Status pill          | `345:17479` "Tags"      | 4px radius, 5px 8px padding, 5px dot, Inter Medium 14/18 `#1A1C1E`, background = state colour at 10% |
| Disabled             | grey `187:7912` variant | `#F4F5F6` fill, `#E1E7EA` stroke, `#969B9D` text                                                     |

**No new colours** — every value resolves to an existing `ui-color-theme` token
and every tint derives from one via MUI `alpha()`. Two documented extensions
(the Figma file has no dropzone, file list, remove affordance or spinner):
drag-over styling reuses the established `containedButtonHover` + primary/10%
recipes, and the uploading pill uses `primary` because the design's
"in progress" dot colour (`#E6891C`) is not a toolkit token.

### `UiFileUploadInput` behaviour

- **Selection is always controlled** (`files` + `onFilesChange`, nullish
  coerced to empty) — the same footgun fix as `UiRadioGroup`/`UiMultiSelect`.
- **Validation is all-or-nothing:** one offending file rejects the batch, so
  the picked set and the delivered set cannot diverge silently. Messages name
  the offending file _and_ restate the rule. Both entry paths are validated —
  the `accept` attribute only filters the OS picker, so dropped files are
  re-validated in JS (`accept-matcher.ts` re-implements the three HTML `accept`
  token forms: `.ext`, `type/subtype`, `type/*`).
- **Async reporting:** `status` (`idle`/`uploading`/`success`/`error`) renders
  the Figma "Tags" pill as **text plus** tint (never colour alone);
  `progress` drives a determinate `LinearProgress` (`role="progressbar"` +
  `aria-valuenow`, values clamped into 0–100). Only state transitions are
  announced (polite `role="status"`); per-tick percentages are queryable, not
  spoken.
- **Keyboard-operable:** the native input is **clipped, not hidden**, so it
  stays focusable with native Enter/Space; the pill wears the focus ring via
  `:focus-within`. The native value is cleared after each pick so re-selecting
  the same file still fires `change`. Disabled blocks drag-and-drop too.
- Decomposed across 17 modules (dropzone, native input, progress, status pill,
  validation, accept matcher, announcements, drag-and-drop/selection/field
  hooks…) to stay inside the `rca` per-function budgets.

### Contract deviations (documented)

- `value`/`onChange` are realised as `files`/`onFilesChange` (a file control's
  value is a `File[]`, not a string) — documented in `types.ts`.
- `size`/`variant` are **not applicable** — single Figma field design.
- `required` marks the native input required while empty; `error` combines the
  consumer flag with validation state (red stroke + message).
- Hover/drag-over/focus visuals for states the Figma frames do not spec reuse
  established toolkit recipes; colour/contrast hardening stays deferred to the
  accessibility-visuals PR per Story 1.3.

## Shared-contract coverage

| Field      | UiFileUploadInput                                        |
| ---------- | -------------------------------------------------------- |
| `value`    | ✅ as `files: readonly File[]` (documented exception)    |
| `onChange` | ✅ as `onFilesChange(files: File[])`                     |
| `disabled` | ✅ (field, picker and drop target)                       |
| `error`    | ✅ (consumer flag ∪ validation; `aria-invalid` + helper) |
| `size`     | ⛔ N/A — single Figma field design (documented)          |
| `variant`  | ⛔ N/A — single Figma field design (documented)          |
| `sx`       | ✅ (on the field root)                                   |

## Provenance

Source `new`: no `crm`/`website` file-upload existed; composed from the
design's own field/progress/tag parts. Recorded in `component-provenance.md`
under the Epic 2 section.

## Governance / CI gates addressed

- Export added to `src/components/index.ts`;
  `tests/unit/components-index.test.ts` expected surface updated
  (`UiFileUploadInput`).
- 100% coverage (`tests/unit/ui-file-upload-input.test.tsx`, 63 specs): render,
  labelling, controlled selection, picker + drop validation for both `accept`
  forms and `maxSizeBytes`, status/progress semantics (clamping included),
  announcements (repeated-rejection re-announce), keyboard operation, disabled
  behaviour, and the dev-warning contract. `accept-matcher.ts` is also tested
  directly.
- Storybook: Interactive (picker + drag-and-drop + validation), Uploading,
  Success, Upload Error. Registered in `tests/visual/stories.json` (4 story
  baselines) plus disabled/hover state shots in `tests/visual/states.spec.ts` —
  6 chromium baselines generated in the pinned Playwright image.
- `rca` complexity budget respected via the 17-module decomposition; `tsc`,
  ESLint (no new suppressions), Prettier and `depcruise` all clean.

## Notes

- Fixed a pre-existing coverage gap in `calendar-init.ts` (tests only):
  `clampMonthToRange`'s max-clamp branch and `initialFocus`'s
  fully-disabled-month fallback were unreachable through the public API and
  untested, leaving the global 100% gate red on the branch. Unit-test CI only
  triggers on PRs targeting `main`, so this surfaces when the stack lands.
- `srOnlySx` consolidated into `field-controls` (was duplicated by
  `ui-multi-select` and `ui-calendar-multi-select`).
- `numberControlArgType` / `selectControlArgType` added to the shared
  Storybook argType builders.
