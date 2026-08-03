import type { SxProps, Theme } from '@mui/material';

// The neutral lane on its own, so the exported union below fits on ONE line: the
// repo's prettier (3.8.1) and qlty's (3.6.2) format a wrapped union differently,
// and a single-line one is the only shape both leave alone.
type NeutralActionIconName = 'x-close' | 'dots-horizontal' | 'dots-vertical' | 'settings';

/**
 * The six Board A action glyphs, in Figma row order (nodes 439:19830,
 * 439:19860, 451:25809, 451:25817, 451:26186, 632:46703). The name selects the
 * glyph AND its ink lane: `x-close`/`dots-horizontal`/`dots-vertical`/`settings`
 * are the neutral lane, `eye` is the toggle lane, and `trash` is the danger lane
 * — the only one that paints the 40x40 pressed backdrop (Frame 5441).
 */
export type ActionIconName = NeutralActionIconName | 'eye' | 'trash';

/**
 * One action in the bar. Interactivity is switched on callback presence alone
 * (a11y contract S2): an action with neither `onActivate` nor `onToggle` renders
 * as a plain `<span>` holding the glyph — no role, no `tabindex`, and no ARIA of
 * any kind, not even `aria-disabled`. Both branches render the identical content
 * tree, so the reading order never changes.
 *
 * Every wired action is an INDEPENDENT tab stop in DOM order. There is
 * deliberately no roving tabindex and no arrow-key handling here, because the
 * bar is `role="group"` and not `role="toolbar"` — see {@link UiActionIconBarProps}.
 */
export interface UiActionIconBarAction {
  /** Which glyph to paint; also selects the ink lane. */
  icon: ActionIconName;
  /**
   * The action's accessible name (`aria-label`). Required and non-blank: these
   * are icon-only buttons with no visible text, so SC 2.5.3 does not bind and
   * `aria-label` is the only name channel. For the `eye` toggle the label is
   * CONSTANT across both states (e.g. 'Видимість'): swapping it to
   * 'Показати'/'Приховати' alongside `aria-pressed` double-signals the state and
   * reads contradictorily.
   */
  label: string;
  /**
   * Fires the plain action. Presence wires the action as a native
   * `<button type="button">`. Bare and payload-free — close over the row id when
   * mapping bars. Ignored when `onToggle` is also supplied (a toggle has one
   * activation path).
   */
  onActivate?: () => void;
  /**
   * Toggle state for the `eye` visibility control. ALWAYS controlled, coerced
   * from nullish to `false` (S3), and honoured only while `onToggle` is present
   * — a `pressed` on a non-toggle action is ignored and dev-warns. It drives
   * BOTH `aria-pressed` and the eye/eye-off glyph swap; the swap is visual only,
   * the glyph is `aria-hidden` either way. A disabled toggle keeps rendering
   * whichever glyph it is currently in.
   */
  pressed?: boolean;
  /**
   * Requests the toggle flip. Presence makes the action a toggle button carrying
   * `aria-pressed` in BOTH states. The bar NEVER self-flips `pressed`: the next
   * state is fed back through this callback (S3).
   */
  onToggle?: () => void;
  /**
   * Menu passthrough for the dots actions: renders `aria-haspopup="menu"`. The
   * bar owns NO menu of its own — it fires callbacks only. Consumers needing
   * full APG menu-button behaviour compose this with the `UiProfileSelectCard`
   * pattern.
   */
  hasPopup?: 'menu';
  /** Open state of that consumer-owned menu; renders `aria-expanded` in BOTH states. */
  menuOpen?: boolean;
  /**
   * `id` of the consumer-owned menu element. Rendered as `aria-controls` ONLY
   * while `menuOpen` is `true`, so a closed menu leaves no dangling idref (the
   * Story 3.3 rule). Supplying it without `menuOpen` is ambiguous and dev-warns.
   */
  menuId?: string;
  /**
   * Disabled status, via the repo `aria-disabled` boundary (S4): still a real,
   * focusable `<button>` with `aria-disabled="true"`, the hover recipe
   * suppressed, `cursor: default` and the callbacks no-oped — native `disabled`
   * is NEVER set, so keyboard focus is never dropped when a focused action flips
   * disabled (SC 2.4.3). Disabled actions stay in the tab order.
   */
  disabled?: boolean;
  /** `id` for this action; lands on the button so focus can be re-resolved. */
  id?: string;
}

/**
 * A row of icon-only actions (Figma Board A, y = 1412-1422): up to six 24px
 * stroke-only glyphs on a 12px rhythm, with no container chrome of its own.
 *
 * **The root is `role="group"`, NOT `role="toolbar"`.** `role="toolbar"`
 * contractually promises APG arrow-key roving-tabindex navigation, and shipping
 * the role without a complete, tested roving implementation is worse than
 * shipping no role at all. Every action is therefore an independent tab stop in
 * DOM order, exactly as `UiIntegrationCard` rejects composite focus managers.
 * Do NOT add `role="toolbar"` later without a full roving-tabindex
 * implementation in the same change: a toolbar without arrow navigation is a
 * Critical defect, not an enhancement.
 *
 * The bar follows the repo wired/static split, switched on whether ANY action
 * carries a callback:
 * - Wired → a `role="group"` element named by {@link UiActionIconBarProps.label}.
 * - Unwired → a plain `<div>` with no group role and no name, whose actions are
 *   plain `<span>`s. Both branches render the identical content tree.
 *
 * Keyboard: Tab/Shift+Tab between actions, Enter/Space native activation. There
 * are no manual key handlers anywhere — a native button already fires on both,
 * and a manual handler double-fires on Space (S6).
 *
 * Shared prop-contract mapping:
 *
 * | Field      | UiActionIconBar   | Rationale                                  |
 * | ---------- | ----------------- | ------------------------------------------ |
 * | `value`    | ⛔ N/A            | No bar-level state axis; each action owns  |
 * | `onChange` | ⛔ N/A            | its own callback (toggle: `pressed`)       |
 * | `disabled` | supported         | Bar-wide, plus per-action; ARIA boundary   |
 * | `error`    | ⛔ N/A            | A command row has no validity state        |
 * | `size`     | ⛔ N/A            | One master; the 24px slot is invariant     |
 * | `variant`  | ⛔ N/A            | The trash backdrop is a POINTER state, not |
 * |            |                   | a variant, and carries no `aria-pressed`   |
 * | `sx`       | supported         | Merged last on the root, `[base, ...sx]`   |
 *
 * There is no animation, no transition and no live region in any state:
 * announcing the consequences of consumer-owned state changes is the consumer's
 * concern (S9).
 */
export interface UiActionIconBarProps {
  /**
   * The bar's accessible name (`aria-label` on the `role="group"` root).
   * Required: the bar has no visible text, so SC 2.5.3 does not bind and this is
   * the only name channel. A blank label on a wired bar dev-warns.
   */
  label: string;
  /** The actions, painted left to right in array order — which is also tab order. */
  actions: readonly UiActionIconBarAction[];
  /**
   * Disables every action at once, through the same `aria-disabled` boundary as
   * the per-action flag (S4). Bar-wide and per-action disabling OR together.
   */
  disabled?: boolean;
  /** `id` for the bar root. */
  id?: string;
  sx?: SxProps<Theme>;
}
