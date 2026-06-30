# Component Provenance Registry

Central source-provenance registry for the toolkit, mandated by
`architecture.md#provenance--governance-patterns` and `epics.md` (FR: provenance
tracked centrally with `crm | website | new` source labels and rationale).

For each delivered or enhanced component, record:

- **source** — `crm` (canonical behavior), `website` (visual/variant gap-fill), or `new`
- **rationale** — why that source is canonical for this component
- **alignment notes** — behavior/visual decisions and any documented deviations

New entries are appended by the delivering story. Existing entries are updated
(not rewritten) when a later story enhances a component.

## Registry

### Epic 1 — Core Controls

| Component                                   | Source | Rationale                                                                                         | Alignment notes / deviations                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UiButton` (`src/components/ui-button`)     | `crm`  | Core control already present from the canonical toolkit; behavior follows `crm` button semantics. | States `rest/hover/active/disabled` styled from `crm`-canonical tokens (`ui-color-theme`). **Note:** Board A scopes the button to these states (`prd.md:78`); `error`/`invalid` is optional per FR-04 (`prd.md:179`), only in form-validation contexts — outside this scope and not implemented (deferred, not a parity gap). `socialButton` variant per-state visual coverage deferred (non-blocking) — see Story 1.2 artifact. |
| `UiInput` (`src/components/ui-input`)       | `crm`  | Canonical text-field behavior; wraps MUI `TextField` with the shared contract.                    | States `rest/hover/active/disabled/error` styled from `crm` tokens. **Deviation:** `active` ≡ `Mui-focused` — an MUI text field has no distinct pressed appearance separate from focus; the board "active" cell maps to the focused appearance (`ui-input/theme.ts:15-17`).                                                                                                                                                      |
| `UiCheckbox` (`src/components/ui-checkbox`) | `crm`  | Canonical checkbox behavior with a custom `.ui-checkbox-box` affordance.                          | States `rest/hover/checked/disabled/error` styled from `crm` tokens; `error` also sets `aria-invalid`. `active` (pressed) is N/A in the state grid.                                                                                                                                                                                                                                                                              |
| `UiLink` (`src/components/ui-link`)         | `crm`  | Canonical link behavior.                                                                          | States `rest/hover/active` styled from `crm` tokens. **Deviation:** `disabled`/`error` props are not exposed — declared contract exceptions in `ui-link/types.ts`; FR-04 (`prd.md:182`) lists `disabled` for link and marks `error/invalid` optional, but the toolkit contract omits these props.                                                                                                                                |

## Quality Enforcement Checklist — Epic 1 core controls

| Check                                       | UiButton                                                    | UiInput                     | UiCheckbox                  | UiLink                      |
| ------------------------------------------- | ----------------------------------------------------------- | --------------------------- | --------------------------- | --------------------------- |
| Export present in `src/components/index.ts` | ✅                                                          | ✅                          | ✅                          | ✅                          |
| Required state matrix covered               | ✅                                                          | ✅                          | ✅                          | ✅                          |
| Accessibility baseline                      | baseline present; full hardening tracked in Story 1.3 (#12) | baseline present; Story 1.3 | baseline present; Story 1.3 | baseline present; Story 1.3 |
| Storybook coverage present                  | ✅                                                          | ✅                          | ✅                          | ✅                          |
| Unit tests present in `tests/unit`          | ✅                                                          | ✅                          | ✅                          | ✅                          |
| Provenance entry exists                     | ✅                                                          | ✅                          | ✅                          | ✅                          |

State-parity demonstrability (rest/hover/active/disabled/error visual baselines + prop→semantic
unit assertions) was completed in **Story 1.2** (`#11`). Accessibility/keyboard/focus-visible
hardening is **Story 1.3** (`#12`) and is intentionally out of scope for the rows above.
