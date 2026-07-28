import type { SxProps, Theme } from '@mui/material';

/**
 * The person a task is assigned to. Name and photo travel as ONE object on
 * purpose: the name is used verbatim as the avatar's `alt`, so the type makes a
 * nameless photo unrepresentable (a11y contract §3). Omit the whole object for an
 * unassigned task — the 34px avatar track stays reserved and nothing is painted.
 */
export interface TaskAssignee {
  /** Assignee full name; used VERBATIM as the avatar alt text. */
  name: string;
  /** 34×34 assignee photo — a URL string or a static import (`{ src }`). */
  avatarSrc: { src: string } | string;
}

/**
 * One kanban board task card: assignee photo, wrapping task title, and a
 * deadline label + deadline chip. Two visual states exist in the design (rest and
 * hover) and nothing else — no variants, no sizes.
 *
 * The card follows the repo wired/static split (`UiItemRow` precedent):
 * - Passing `onActivate` makes the ENTIRE card one native
 *   `<button type="button">`; activation is fire-and-forget.
 * - Without `onActivate` the card is static, non-focusable content — no button
 *   role, no tabindex, no `aria-disabled`. Both branches render an identical
 *   content tree, so the reading order never changes.
 *
 * It is deliberately NOT a disclosure: there is no `aria-expanded`/`panelId`
 * axis, no key handlers (the native button supplies Enter/Space), and no live
 * region in any state — a deadline change must never announce itself.
 *
 * The accessible name is content-derived, never an `aria-label`:
 * `"{assignee.name} {title} {deadlineLabel} {deadline}"`.
 *
 * Shared prop-contract mapping (a11y contract §7):
 *
 * | Field      | UiTaskCard    | Rationale                                              |
 * | ---------- | ------------- | ------------------------------------------------------ |
 * | `value`    | N/A           | Not a value control, and no disclosure boolean either  |
 * | `onChange` | N/A           | `onActivate` is the analogue; it is the wired switch   |
 * | `disabled` | as `disabled` | `aria-disabled` boundary; native `disabled` never set  |
 * | `error`    | N/A           | Presentation, not a form field                         |
 * | `size`     | N/A           | Single master: width fluid, height is a `minHeight`    |
 * | `variant`  | N/A           | Two states, zero variants                              |
 * | `sx`       | supported     | Merged last on the root, `[base, ...consumerSx]`       |
 *
 * There is no roving tabindex or arrow-key navigation — a board column is a list
 * of independent buttons, not a composite widget — and the card never wraps
 * itself in an `<li>`; list semantics belong to the consumer.
 */
export interface UiTaskCardProps {
  /** Task title; wraps naturally over as many lines as it needs, never clamped. */
  title: string;
  /**
   * Visible label in front of the deadline chip (e.g. `Дедлайн`). Required — the
   * card bakes in no natural-language literal of its own (SC 3.1.2).
   */
  deadlineLabel: string;
  /** Deadline chip text (e.g. `12.09 15:00`). Non-interactive, zero ARIA. */
  deadline: string;
  /** Assignee; omit for an unassigned task (track reserved, nothing painted). */
  assignee?: TaskAssignee;
  /** Called on activation of a wired, non-disabled card. Presence makes it a button. */
  onActivate?: () => void;
  /**
   * Disabled status. The repo `aria-disabled` boundary pattern: still a real,
   * focusable `<button>`, but `aria-disabled="true"`, the hover recipe is
   * suppressed and `onActivate` never fires — so keyboard focus is never dropped
   * when a focused card flips disabled (WCAG 2.4.3).
   */
  disabled?: boolean;
  /** `id` for the card; lands on the `<button>` so focus can be re-resolved. */
  id?: string;
  /** Only when the card's language differs from the page language (SC 3.1.2). */
  lang?: string;
  sx?: SxProps<Theme>;
}
