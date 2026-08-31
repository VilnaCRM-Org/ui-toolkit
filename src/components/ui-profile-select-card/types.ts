import type { SxProps, Theme } from '@mui/material';

/**
 * One command in the profile menu. The rows are fire-and-forget ACTIONS (open the
 * profile, open settings, log out) — nothing is a persisted selected value — so
 * there is deliberately no `selected` field and no per-item `disabled`
 * (a11y contract §1.1/§6.4). `id` travels back through `onSelect`, so it must be
 * unique inside `items` (duplicates dev-warn, §12).
 */
export interface ProfileSelectItem {
  /** Stable action id handed to `onSelect`; also the React key. */
  id: string;
  /** Visible row text. It IS the item's accessible name — nothing is appended. */
  label: string;
}

/**
 * The profile menu-button card: a 48px-tall trigger (avatar, person name, grey
 * chevron) that opens an action menu 11px below it.
 *
 * The widget is the WAI-ARIA APG **menu button** (a11y contract §1.1) — not a
 * disclosure and not a combobox, because the rows are commands rather than a
 * value axis. The trigger is one native `<button type="button">` carrying
 * `aria-haspopup="menu"`, a permanent `aria-expanded`, and `aria-controls` only
 * while the menu is mounted; the menu is a `role="menu"` of native
 * `role="menuitem"` buttons rendered in place (no portal, §2.4) and unmounted
 * when closed (§2.3).
 *
 * Ownership split (§4): the **consumer owns `open`**, the **component owns
 * focus**. The card never self-flips its open state — it only ever *requests* the
 * next one through `onOpenChange` — while every focus move (into the menu on
 * open, back to the trigger on Escape or activation, the programmatic-close
 * rescue) is performed by the component.
 *
 * The card follows the repo wired/static split (`UiItemRow`/`UiTaskCard`
 * precedent), switched on `onOpenChange`:
 * - Wired → the button trigger above, plus the menu while `open`.
 * - Unwired → a static `<div>`: no button role, no `tabindex`, no ARIA of any
 *   kind, and the menu never renders even if `open` is passed (dev-warn, §12).
 *   Both branches render an identical closed-card content tree.
 *
 * The accessible name is content-derived — the visible person name — and there is
 * no `aria-label` anywhere in the tree (WCAG 2.5.3, §5.1). The avatar is
 * decorative (`alt=""`, §5.2) because the name sits beside it inside the same
 * button, and the chevron is an `aria-hidden` glyph that never rotates: the open
 * state reaches assistive tech through `aria-expanded` (§1.3, §5.3).
 *
 * Shared prop-contract mapping (a11y contract §11):
 *
 * | Field      | UiProfileSelectCard | Rationale                                 |
 * | ---------- | ------------------- | ----------------------------------------- |
 * | `value`    | N/A                 | Actions menu; the state axis is `open`    |
 * | `onChange` | N/A                 | `onOpenChange` + `onSelect` are analogues |
 * | `disabled` | as `disabled`       | `aria-disabled` boundary, never native    |
 * | `error`    | N/A                 | Not a form field                          |
 * | `size`     | N/A                 | One master; height is a `minHeight`       |
 * | `variant`  | N/A                 | Rest/hover/open/disabled are states       |
 * | `sx`       | supported           | Wrapper root, merged last; plus `menuSx`  |
 *
 * There is no typeahead, no hover-open, no animation and no live region in any
 * state (§4.3, §10.1, §9.1, §8.1).
 */
export interface UiProfileSelectCardProps {
  /** Person name; rendered beside the avatar and used as the trigger's name. */
  name: string;
  /** 32×32 profile photo — a URL string or a static import (`{ src }`). */
  avatarSrc: { src: string } | string;
  /** Menu commands. An empty list renders no menu at all (§3.4). */
  items: ProfileSelectItem[];
  /**
   * Menu open state (wired cards only). Always controlled; defaults to `false`.
   * The component never flips it — feed the next state back via `onOpenChange`.
   */
  open?: boolean;
  /**
   * Requests the next open state, carrying the requested boolean. Presence makes
   * the card a wired menu button. The payload is a deliberate, documented
   * deviation from `UiItemRow`'s bare `onToggle()` (§3.1): five close paths exist
   * (Escape, Tab, outside pointer, item activation, trigger re-click) and a
   * payload-free toggle races against stale state when two fire together.
   */
  onOpenChange?: (next: boolean) => void;
  /** Fired with the activated item's `id`, after focus returns to the trigger. */
  onSelect?: (itemId: string) => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover recipe is
   * suppressed and every open path no-ops — so keyboard focus is never dropped
   * when a focused card flips disabled (WCAG 2.4.3). While `disabled`, the closed
   * presentation wins over `open` (§6.3).
   */
  disabled?: boolean;
  /** `id` for the trigger; falls back to a generated one so the menu can name itself. */
  id?: string;
  /** Only when the card's language differs from the page language (SC 3.1.2). */
  lang?: string;
  /** Merged last on the positioning wrapper. */
  sx?: SxProps<Theme>;
  /** Merged last on the `role="menu"` element. */
  menuSx?: SxProps<Theme>;
}
