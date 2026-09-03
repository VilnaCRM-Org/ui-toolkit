// Forced interaction-state visuals for three of Story 3.7's nine board
// follow-up controls (split across `followup-styles-a.ts`/`-b.ts` per the
// `micro-styles.ts` `lloc_file` budget precedent). Each const re-applies the
// EXACT chrome the component's own `styles.ts`/`theme.ts` paints under a real
// `:hover`/`:active` pseudo-class — which never fires under a static
// screenshot — through the tile's own `sx`. Gated consts keep the
// component's own state-negation selector, so a Selected/Disabled tile is
// never overridden by a Hover one (the `ui-integration-card` precedent).

// UiBackgroundPicker's own HOVER_CHROME (styles.ts): white fill (unchanged),
// grey400 border, the tighter 15px shadow.
export const PICKER_HOVER_SX = {
  borderColor: '#D0D4D8',
  boxShadow: '0 8px 15px rgba(49, 59, 67, 0.14)',
} as const;

// UiButton's `danger` variant own `&:hover`/`&:active` recipes (theme.ts).
// Active is deliberately LIGHTER than hover — kept exactly as painted.
export const DANGER_BUTTON_HOVER_SX = {
  backgroundColor: '#DC3939',
  border: '1px solid transparent',
  color: '#FFFFFF',
} as const;
export const DANGER_BUTTON_ACTIVE_SX = {
  backgroundColor: '#DF7878',
  border: '1px solid transparent',
  color: '#FFFFFF',
} as const;

// UiOptionCard's own hover recipe (styles.ts), gated the SAME way the
// component gates it, so a Selected or Disabled tile is never overridden.
export const OPTION_CARD_HOVER_SX = {
  '&:not([aria-checked="true"]):not([aria-disabled="true"]) .ui-option-card__box': {
    borderColor: '#D0D4D8',
    boxShadow: '0 8px 15px rgba(49, 59, 67, 0.14)',
  },
} as const;
