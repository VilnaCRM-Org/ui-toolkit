// Forced interaction-state visuals for the six Board A micro-components (Story
// 3.5). Each const re-applies the EXACT Figma hover/active/focus values through
// the component's own class hooks, and — this is the load-bearing part — keeps
// the component's own gates (`:not([aria-disabled="true"])`,
// `:not([aria-checked="true"])`, `:not([aria-pressed="true"])`). That is what
// makes a "Selected + Hover" tile paint the SELECTED chrome instead of the hover
// chrome: the precedence rule is drawn on the board rather than asserted in prose.
//
// They live here rather than in `styles.ts` because that module is already at its
// `lloc_file` budget; this is the `media-nodes.tsx` split precedent applied to the
// style side.

// Hover (Figma 439:19372): white pill, grey400 stroke, the chip drop shadow, and
// the × tinted brand-blue. The gate is the component's own hover negation, so a
// disabled chip cannot pick this up.
export const FILTER_CHIP_HOVER_SX = {
  '&:not([aria-disabled="true"])': {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D4D8',
    boxShadow: '0 4px 4px rgba(26, 27, 36, 0.09)',
    '& .ui-filter-chip__glyph': { color: '#1EAEFF' },
  },
} as const;

// Active (Figma 439:19373) is hover plus ONE darker step on the border and the
// glyph — it is the pressed state, not an "applied filter" variant (A2).
export const FILTER_CHIP_ACTIVE_SX = {
  '&:not([aria-disabled="true"])': {
    backgroundColor: '#FFFFFF',
    borderColor: '#969B9D',
    boxShadow: '0 4px 4px rgba(26, 27, 36, 0.09)',
    '& .ui-filter-chip__glyph': { color: '#0399ED' },
  },
} as const;

// Figma specifies no focus ring at all, so the Amendment-A1 single-layer inset
// ring ships in addition to the state chrome. `:focus-visible` never fires under
// a static screenshot, so the tile forces the ring the component declares last.
export const FILTER_CHIP_FOCUS_SX = {
  outline: 'none',
  boxShadow: 'inset 0 0 0 2px #1A1C1E',
} as const;

// Cell hover (Figma 439:19617): the constant 1px border steps brandGray → grey400
// and nothing else moves. Reached through the cell class hook so the tile can stay
// one `UiPinInput` rather than a hand-built cell.
export const PIN_CELL_HOVER_SX = {
  '& .ui-pin-input__cell:not([aria-disabled="true"])': { borderColor: '#D0D4D8' },
} as const;

// Board A's "Active" column IS the focused cell — the Figma drop shadow plus the
// brand-blue caret. The caret cannot be captured statically (and the visual suite
// freezes it), so the shadow is what this tile locks.
export const PIN_CELL_FOCUS_SX = {
  '& .ui-pin-input__cell:not([aria-disabled="true"])': {
    boxShadow: '0 7px 12px rgba(76, 90, 126, 0.15)',
  },
} as const;

// Card hover (Figma 439:19643): white fill, primary stroke, and the selection
// circle's own stroke tinted primary. The `:not([aria-checked="true"])` gate is
// the component's own, so the "Selected + Hover" tile paints SELECTED — no
// hover-on-selected master exists, and selected dominates hover.
export const PAYMENT_CARD_HOVER_SX = {
  '&:not([aria-disabled="true"]):not([aria-checked="true"])': {
    backgroundColor: '#FFFFFF',
    borderColor: '#1EAEFF',
    '& .ui-payment-option-card__circle': { border: '1px solid #1EAEFF' },
  },
} as const;

// The bar has three ink lanes, so the forced hover is three rules on the row's own
// buttons: neutral → primary, the eye → grey200 (a visibility toggle is a neutral
// affordance), the trash → strokeDanger. The lane rules are declared after the
// blanket one and carry the extra `nth-of-type` compound, so they win outright.
export const ICON_BAR_HOVER_SX = {
  '& > button:not([aria-disabled="true"])': { color: '#1EAEFF' },
  '& > button:nth-of-type(4):not([aria-disabled="true"])': { color: '#404142' },
  '& > button:nth-of-type(6):not([aria-disabled="true"])': { color: '#DF7878' },
} as const;

// Pressed: every lane steps to containedButtonActive except the danger lane, which
// holds its hover ink and adds Frame 5441 — the 40x40 error@10% plate, the only
// authored button chrome anywhere on Board A.
export const ICON_BAR_ACTIVE_SX = {
  '& > button:not([aria-disabled="true"])': { color: '#0399ED' },
  '& > button:nth-of-type(6):not([aria-disabled="true"])': { color: '#DF7878' },
  '& > button:nth-of-type(6) .ui-action-icon-bar__backdrop': {
    backgroundColor: 'rgba(220, 57, 57, 0.1)',
  },
} as const;

// Hover (Figma 451:25849): the success outline over a 10% success wash. A static
// badge has no `:hover` rule AT ALL — the recipe only exists on the wired branch —
// so forcing it through the root class hook is this tile's whole purpose. The
// component's own negations ride along, which is why an active or disabled badge
// would refuse the tint exactly as it does under a real pointer.
export const STATUS_BADGE_HOVER_SX = {
  '& .ui-status-badge__root:not([aria-disabled="true"]):not([aria-pressed="true"])': {
    backgroundColor: 'rgba(56, 179, 134, 0.1)',
    borderColor: '#38B386',
    color: '#38B386',
  },
} as const;

// Bell hover (Figma 451:26199): a 10% primary wash, the grey400 stroke dropped to
// transparent (geometry never moves), and the glyph tinted primary through
// `currentColor`.
export const NOTIFICATION_HOVER_SX = {
  '&:not([aria-disabled="true"])': {
    backgroundColor: 'rgba(30, 174, 255, 0.1)',
    borderColor: 'transparent',
    color: '#1EAEFF',
  },
} as const;

// Bell active (Figma 451:26209): a solid primary disc with a white bell, and the
// counter chip gaining its 2px OUTSIDE ring. The ring is cut out of the page
// surface rather than painted white, which is why the board's own #FBFBFB
// background is what makes this tile read as the master does.
export const NOTIFICATION_ACTIVE_SX = {
  '&:not([aria-disabled="true"])': {
    backgroundColor: '#1EAEFF',
    borderColor: 'transparent',
    color: '#FFFFFF',
    '& .ui-notification-badge__count': { boxShadow: '0 0 0 2px #FBFBFB' },
  },
} as const;
