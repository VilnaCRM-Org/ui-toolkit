// Chrome for UiStatusBadge (Figma Board A, state nodes 451:25843 rest /
// 451:25849 hover / 451:25845 active / 451:25852 disabled). The badge is a 26x26
// circle holding a 16x16 check glyph, and EVERY state delta is colour-only: the
// three chrome fields below are the entire state ramp, so no rule in this module
// may ever touch geometry (the UiPagination no-jitter law).
import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

const palette: Theme['palette'] = colorTheme.palette;

// Stable class hook on the root: the badge has no descendant chrome of its own
// (the glyph is tinted by `currentColor`), so this exists for the showcase board,
// whose hover tile has to force the interactive recipe from the outside.
export const BADGE_ROOT_CLASS: string = 'ui-status-badge__root';

/** The design's tint strength for a state-coloured surface (the 2.4A recipe). */
const TINT: number = 0.1;

/**
 * One rung of the state ramp. Exactly three colour fields — anything a state
 * cannot express through them does not exist in this design.
 */
export interface StatusBadgeChrome {
  backgroundColor: string;
  borderColor: string;
  color: string;
}

/** Rest: "not done" — a white disc with a pale outline and a pale check. */
export const REST_CHROME: StatusBadgeChrome = {
  backgroundColor: palette.white.main,
  borderColor: palette.brandGray.main,
  color: palette.brandGray.main,
};

/** Hover: the same outline, success-coloured, over a 10% success wash. */
export const HOVER_CHROME: StatusBadgeChrome = {
  backgroundColor: alpha(palette.success.main, TINT),
  borderColor: palette.success.main,
  color: palette.success.main,
};

/** Active: "done" — a solid success disc with a white check. */
export const ACTIVE_CHROME: StatusBadgeChrome = {
  backgroundColor: palette.success.main,
  borderColor: palette.success.main,
  color: palette.white.main,
};

/** Disabled derives from ACTIVE (solid fill, white check), desaturated. */
export const DISABLED_CHROME: StatusBadgeChrome = {
  backgroundColor: palette.brandGray.main,
  borderColor: palette.brandGray.main,
  color: palette.white.main,
};

// Single-layer inset ring (the 3.3/3.4 recipe): inset keeps it inside the circle,
// where an outset ring would ring a square. Declared AFTER every state rule so a
// focused active or disabled badge shows both its state colour and the ring —
// state chrome and focus chrome are orthogonal channels.
const FOCUS_RING: string = `inset 0 0 0 2px ${palette.darkPrimary.main}`;

// Two selectors, one recipe (Amendment A1). CSS keeps per-selector specificity
// inside a selector list, so the bare `:focus-visible` (0,2,0) covers the pressed
// and disabled badges while the second copy repeats the hover rule's own
// negations to tie hover's (0,4,0); declared later, it wins on a badge that is
// focused AND hovered, where the plain rule alone would lose the ring.
const FOCUS_SELECTORS: string =
  '&:focus-visible, &:focus-visible:not([aria-disabled="true"]):not([aria-pressed="true"])';

// Forced-colors discards box-shadow, so the ring is re-expressed as an outline
// pulled inside the border box. The rest/active distinction is fill-colour-only
// by design (the check is drawn in every state), so forced-colors flattens it —
// the surviving non-colour channel is the `role="img"` name (static) or
// `aria-pressed` (interactive), which is why both are mandatory.
//
// The fallback MUST repeat FOCUS_SELECTORS rather than a bare `:focus-visible`.
// A media query adds no specificity, so a single-selector rule loses to the
// negated copy above that declares `outline: none` — and it loses on exactly the
// states a keyboard user is normally in. Repeating the list ties the specificity,
// and being declared later this wins.
const FORCED_COLORS_RING: object = {
  '@media (forced-colors: active)': {
    [FOCUS_SELECTORS]: { outline: '2px solid Highlight', outlineOffset: '-2px' },
  },
};

// The 26x26 master. A circle cannot grow, so this is the one Epic 3 surface with
// a fixed `height` rather than a `minHeight`: it holds no text and cannot reflow.
// Figma's radius is 54 on a 26px box, which `'50%'` reproduces pixel-identically.
// The 2px border is ALWAYS emitted and only its colour swaps: Figma drops the
// stroke on active and disabled, but the stroke is inside-aligned there, so a
// same-colour border renders identically and keeps the geometry frozen.
const BADGE_BASE: object = {
  boxSizing: 'border-box',
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.625rem',
  height: '1.625rem',
  margin: 0,
  padding: 0,
  borderRadius: '50%',
  borderWidth: '2px',
  borderStyle: 'solid',
  ...REST_CHROME,
};

// Button-only additions. Hover is gated on the `aria-disabled` boundary AND on
// `aria-pressed="false"`: hover is an intermediate tint between rest and active,
// so letting it win on an active badge would visually DEMOTE it mid-flow. The
// disabled rule carries the pressed negation for the same reason in reverse —
// an active + disabled badge keeps the active chrome Figma draws. The ring is
// declared last so it wins at equal specificity. No transition: Figma has none.
function interactiveBadgeSx(): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&[aria-disabled="true"]': { cursor: 'default' },
    '&:hover:not([aria-disabled="true"]):not([aria-pressed="true"])': HOVER_CHROME,
    '&[aria-pressed="true"]': ACTIVE_CHROME,
    '&[aria-disabled="true"]:not([aria-pressed="true"])': DISABLED_CHROME,
    [FOCUS_SELECTORS]: { outline: 'none', boxShadow: FOCUS_RING },
    ...FORCED_COLORS_RING,
  };
}

// The static branch has no attribute an ARIA-keyed selector could read: it is a
// `role="img"` whose only other attribute may be `aria-label`, and `aria-pressed`
// is invalid on that role. Painting `active` there is nonetheless legal (spec
// Ruling 4) precisely because the required label — not an attribute — is the
// exposure channel, so the same ramp rung the wired branch reaches through
// `[aria-pressed="true"]` is applied directly here. `disabled` is NOT painted:
// nothing is interactive to disable, and the static branch never renders state it
// cannot expose.
function staticChrome(active: boolean): object | null {
  return active ? ACTIVE_CHROME : null;
}

export interface StatusBadgeStyleConfig {
  interactive: boolean;
  active: boolean;
  sx: SxProps<Theme> | undefined;
}

/** The badge root `sx`: the 26px disc, its state chrome, consumer `sx` last. */
export function statusBadgeSx(config: StatusBadgeStyleConfig): SxProps<Theme> {
  const base: object = {
    ...BADGE_BASE,
    ...(config.interactive ? interactiveBadgeSx() : staticChrome(config.active)),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
