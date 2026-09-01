import type { SxProps, Theme } from '@mui/material';

/**
 * One 26px check-circle status badge (Figma Board A row y=1790, state nodes
 * 451:25843 rest / 451:25849 hover / 451:25845 active / 451:25852 disabled): a
 * circular container plus one stroked check glyph, and nothing else. There is no
 * text, no padding, no shadow and no transition in any state, and every delta
 * between the four states is COLOUR-ONLY — box size, radius, glyph geometry,
 * glyph path, stroke weight and glyph position are byte-identical throughout.
 *
 * Note for the docs reader: the **disabled presentation derives from ACTIVE, not
 * from rest** — a solid fill with a white check, desaturated to `brandGray`. A
 * disabled badge therefore looks "done and frozen", never "empty".
 *
 * The badge is DUAL-MODE, switched on `onToggle` alone (a11y contract S2):
 *
 * - **Static (default)** → a `<span role="img" aria-label={label}>` wrapping the
 *   `aria-hidden` glyph. Nothing else: no `tabindex`, no other ARIA.
 * - **Interactive** (`onToggle` present) → ONE native `<button type="button">`
 *   with `aria-pressed`. `role="switch"` and `aria-checked` are **forbidden**:
 *   this is a toggle, not a switch and not a radio, so neither the on/off switch
 *   contract nor the mutual-exclusivity contract of a radio may be promised (the
 *   inverse of the `UiIntegrationCard` §1.1 ruling, from the same reasoning).
 *
 * **The two label regimes.** `label` is required in both modes, but it means a
 * different thing in each, and mixing them up is the one way to get this
 * component wrong:
 *
 * - Static → the label MUST NAME THE STATE BEING PAINTED (`'Завдання виконано'`
 *   when `active`, `'Завдання не виконано'` at rest). `role="img"`'s name is the
 *   entire non-visual signal here, so it is also the colour-only mitigation: the
 *   green-vs-pale distinction never travels alone (SC 1.4.1, SC 1.1.1).
 * - Interactive → the label MUST BE CONSTANT and state-free (`'Виконано'`).
 *   `aria-pressed` already carries the state, so a state-describing label would
 *   double-signal it ("Завдання виконано, pressed").
 *
 * A static badge painting `active` is deliberately LEGAL (spec Ruling 4): unlike
 * `UiIntegrationCard`'s static branch, this one does expose its state
 * programmatically — through the required `role="img"` name — so the burden sits
 * on the label text rather than on an ARIA attribute. Consequently there is
 * **no dev warning for `active` without `onToggle`**; the only warning is a
 * blank `label` (see `status-badge-warnings.ts`).
 *
 * Shared prop-contract mapping (a11y contract §11):
 *
 * | Field      | UiStatusBadge   | Rationale                                  |
 * | ---------- | --------------- | ------------------------------------------ |
 * | `value`    | as `active`     | The state axis is a boolean toggle         |
 * | `onChange` | as `onToggle()` | Bare payload — one control, one axis       |
 * | `disabled` | as `disabled`   | `aria-disabled` boundary, never native     |
 * | `error`    | N/A             | A badge reports progress, never validity   |
 * | `size`     | N/A             | One 26px master, no size scale             |
 * | `variant`  | N/A             | Rest/hover/active/disabled are states      |
 * | `lang`     | N/A             | `label` is consumer text; the ancestor owns|
 * | `sx`       | supported       | Merged last on the root, `[base, ...sx]`   |
 *
 * There is no animation, no live region in any state and no hover- or
 * focus-triggered content: announcing the consequence of a toggle belongs to the
 * consumer that owns the state (S9).
 */
export interface UiStatusBadgeProps {
  /**
   * The badge's whole accessible name — required in both modes. State-describing
   * when static, constant and state-free when interactive (see the two label
   * regimes above). A blank value dev-warns: it leaves a nameless image or a
   * nameless button (SC 4.1.2, SC 1.1.1).
   */
  label: string;
  /**
   * Active ("done") state. ALWAYS controlled, default `false`: a nullish value is
   * coerced so a badge that starts inactive never silently flips uncontrolled on
   * the first toggle (the `UiRadioGroup` `value ?? ''` footgun). The component
   * NEVER self-flips it — the next state is fed back through `onToggle`. Wired
   * badges expose it as `aria-pressed`; static badges expose it through `label`.
   */
  active?: boolean;
  /**
   * Requests the opposite state. Bare and payload-free (this widget has exactly
   * one state axis, so nothing can race — close over the task id when mapping
   * badges). Presence is what makes the badge a native toggle button; without it
   * the badge is a static `role="img"`. Unlike a radio, a toggle fires from BOTH
   * states, so an active badge activated again requests deactivation.
   */
  onToggle?: () => void;
  /**
   * Disabled status (wired badges only). The repo `aria-disabled` boundary: still
   * a real, focusable `<button>`, but `aria-disabled="true"`, the hover recipe is
   * suppressed and `onToggle` never fires — so keyboard focus is never dropped
   * when a focused badge flips disabled (SC 2.4.3). Native `disabled` is never
   * set. An active + disabled badge keeps its ACTIVE chrome, exactly as Figma
   * draws it; the disabled fill only replaces the rest presentation.
   */
  disabled?: boolean;
  /** `id` for the badge; lands on the root so focus can be re-resolved. */
  id?: string;
  sx?: SxProps<Theme>;
}
