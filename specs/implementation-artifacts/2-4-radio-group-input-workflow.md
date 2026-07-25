# Story 2.4 — Radio Group Input Workflow

- **Issue:** [#16](https://github.com/VilnaCRM-Org/ui-toolkit/issues/16)
- **Epic:** Epic 2 — Selection, Search, and Input Workflows
- **Status:** in-progress
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 2.4: Radio Group Input Workflow_

## Scope

Deliver `UiRadioGroup` (`src/components/ui-radio-group`) — a single-choice radio
group where options render as MUI radios inside a named `role="radiogroup"`. It
reuses the shared `field-controls` accessibility guidance from Story 2.1 and
follows the same conventions as the other Epic 2 controls.

Because the radio group depends only on Story 2.1's `field-controls` (the shared
dev-warning helper + `hasText`) and not on the calendar, it is **stacked on the
2.3 branch** (`feat/issue-15-calendar-multi-select`) in epic order:
`main ← 2.1 ← 2.2 ← 2.3 ← 2.4`. Its diff is 2.4-only, it stays conflict-free with
the other open PRs, and it introduces no dependency on a future Epic 2 story.
GitHub retargets the PR up the stack as the one below it merges.

## Design decisions

### Figma alignment (node `151:6441` "radiobutton")

The Figma radiobutton is a single fixed **20px circle** with a white fill. Its two
specified states are: **unselected** — `1px` `#D0D4D8` stroke (the `grey400` /
"Font/400 (Stroke)" token); **selected** — `5px` `#1EAEFF` primary ring (the
thick primary border leaves a white centre, the classic filled-radio look). Both
colours are existing `ui-color-theme` tokens (`grey400` / `primary`), so no new
colour was introduced. The custom icon follows the `UiCheckbox` pattern: a
`.ui-radio-dot` `<span>` styled via `sx`, swapped for `.ui-radio-dot--checked`
on selection. States the Figma frame does not specify (hover / disabled / error)
reuse the established toolkit treatments — hover borders to `primary` and the
error border swaps to `error.main` (both mirror `UiCheckbox`); disabled dims to
`opacity: 0.6` (mirrors the multi-select) so a pre-selected-then-disabled radio
keeps its indicator instead of flattening to grey.

### `UiRadioGroup` (MUI v9 `RadioGroup`)

- Built on MUI `FormControl` + `FormLabel` + `RadioGroup` + `FormControlLabel` +
  `Radio` + `FormHelperText` — the WAI-ARIA / MUI-documented radiogroup pattern.
  `{label,value}` options; the raw MUI `(event, value)` change signature is
  adapted to a clean `onChange(value)`.
- **Always controlled.** `value` is passed as `value ?? ''`, so a nullish `value`
  becomes "nothing selected" rather than flipping the group to uncontrolled. This
  is deliberate: MUI's `RadioGroup` freezes controlled-ness on first render
  (`useControlled`), so the natural consumer pattern `useState<string>()` (initial
  `undefined`) would otherwise lock the group uncontrolled and break on the first
  selection. `UiMultiSelect` gets the same robustness from `value ?? EMPTY`.
- Native roving-focus arrow-key selection (one Tab stop for the group; arrows
  move + select) comes from MUI `RadioGroup` — no custom key handling needed.
- Accessibility: the group is named from a visible `label` (rendered in a
  `FormLabel` linked via `aria-labelledby`) else `aria-label`; `error` →
  `aria-invalid` on the group **plus** a red `FormLabel`/helper via the
  `FormControl` error context; `helperText` → `aria-describedby`; `required`
  marks the radios native-required (an unselected required group reports
  `:invalid`) and MUI renders the native asterisk on the group label; per-option
  `disabled` disables a single radio, group `disabled` the whole set. Dev-only
  name/error guidance uses the shared `useFieldAccessibilityWarnings`.
- The render is split into small helpers (`renderRadio`, `renderOption`,
  `renderGroupLabel`, `renderHelper`, `renderRadioGroup`) so no single function
  exceeds the `rca` Halstead-volume budget; id/handler derivation lives in
  `useRadioGroupField` to keep the component itself small.

### Contract deviations (documented)

- `size` / `variant` are **not applicable** — the Figma radio is a single fixed
  20px glyph with no size/variant axis, matching `UiCheckbox` (which documents
  the same exception). The shared `value`/`onChange`/`disabled`/`error`/`sx`
  fields are all supported.
- Hover / disabled / error visual treatment (for states the Figma frame does not
  spec) and radio-fill contrast / focus-ring pixel hardening follow the same
  accessibility-visuals deferral as Story 1.3, consistent with the other Epic 2
  controls.

## Shared-contract coverage

| Field      | UiRadioGroup                                |
| ---------- | ------------------------------------------- |
| `value`    | ✅ selected option `value` (string)         |
| `onChange` | ✅ `(value: string)`                        |
| `disabled` | ✅ (group + per-option)                     |
| `error`    | ✅ (`aria-invalid` + red label/helper)      |
| `size`     | ⛔ N/A — fixed 20px glyph (documented)      |
| `variant`  | ⛔ N/A — single design variant (documented) |
| `sx`       | ✅ (on the `FormControl` root)              |

## Provenance

Source `new`: behaviour follows `crm`'s canonical MUI `RadioGroup` single-choice
control. Recorded in `component-provenance.md` under the Epic 2 section.

## Governance / CI gates addressed

- Export added to `src/components/index.ts`; `tests/unit/components-index.test.ts`
  expected surface updated (`UiRadioGroup`).
- 100% coverage (`tests/unit/ui-radio-group.test.tsx`): render + radiogroup role,
  accessible name (label / aria-label / precedence / id-seeded label id),
  controlled selection + change + the controlled round-trip (onChange → re-render),
  click + arrow-key selection, group/per-option disabled + disabled tab-order,
  `error`→`aria-invalid`, `helperText`→`aria-describedby` (+ id derivation),
  required radios, and the dev-warning contract.
- Story registered in `tests/visual/stories.json` (the story preselects Email via a stateful
  wrapper, so the baseline shows both the selected ring and the unselected radios); per-state radio
  baselines (error / disabled / hover) added to `tests/visual/states.spec.ts`;
  chromium baselines generated in the pinned Playwright Docker image.
- `rca` complexity budget respected (render split into small helpers; the
  component function's Halstead volume kept under the 1000 limit).

## Notes

- A dedicated memory-leak scenario was intentionally not added: the group is
  controlled (a non-interactive story cannot drive the mount/unmount churn), and
  the radio reuses MUI's `SwitchBase` internals already exercised by the
  `checkbox-toggle` memory-leak scenario.
