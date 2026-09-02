// Forced interaction-state visuals for the remaining six of Story 3.7's nine
// board follow-up controls (see `followup-styles-a.ts` for the split
// rationale and the shared gating convention).

// UiChevronButton's own hover/active recipes (styles.ts): hover adds the
// grey300 border plus the drop-shadow tint; active repeats the same border
// alone. Glyph ink never moves — grey300 in every state.
export const CHEVRON_HOVER_SX = {
  borderColor: '#969B9D',
  boxShadow: '0 4px 13px 0 rgba(0, 0, 0, 0.25)',
} as const;
export const CHEVRON_ACTIVE_SX = {
  borderColor: '#969B9D',
} as const;

// UiAddButton's own hover/active recipes (styles.ts): both carry the same
// elevated shadow; only the border colour differs — active's is the
// LIGHTER one (brandGray, equal to rest), kept exactly as painted.
export const ADD_BUTTON_HOVER_SX = {
  borderColor: '#D0D4D8',
  boxShadow: '0 8px 15px rgba(49, 59, 67, 0.14)',
} as const;
export const ADD_BUTTON_ACTIVE_SX = {
  borderColor: '#E1E7EA',
  boxShadow: '0 8px 15px rgba(49, 59, 67, 0.14)',
} as const;

// UiClearButton's own hover/active ink (styles.ts): the root ink (the label,
// via `currentColor`) and the glyph class hook retint together.
export const CLEAR_BUTTON_HOVER_SX = {
  color: '#1A1C1E',
  '& .ui-clear-button__glyph': { color: '#1A1C1E' },
} as const;
export const CLEAR_BUTTON_ACTIVE_SX = {
  color: '#1B2327',
  '& .ui-clear-button__glyph': { color: '#1B2327' },
} as const;

// UiCopyField's own hover/active chrome (styles.ts): hover adds the shadow,
// active drops it; both retint the value + glyph class hooks the same way.
export const COPY_FIELD_HOVER_SX = {
  backgroundColor: '#FFFFFF',
  borderColor: '#D0D4D8',
  boxShadow: '0 8px 15px rgba(49, 59, 67, 0.14)',
  '& .ui-copy-field__value': { color: '#1A1C1E' },
  '& .ui-copy-field__glyph': { color: '#1EAEFF' },
} as const;
export const COPY_FIELD_ACTIVE_SX = {
  backgroundColor: '#FFFFFF',
  borderColor: '#D0D4D8',
  '& .ui-copy-field__value': { color: '#1A1C1E' },
  '& .ui-copy-field__glyph': { color: '#1EAEFF' },
} as const;

// UiSocialIconButton's own hover/active fills (styles.ts): both invert the
// glyph ink to white over a solid brand fill.
export const SOCIAL_ICON_HOVER_SX = {
  backgroundColor: '#00A3FF',
  color: '#FFFFFF',
} as const;
export const SOCIAL_ICON_ACTIVE_SX = {
  backgroundColor: '#0399ED',
  color: '#FFFFFF',
} as const;

// UiSegmentedControl's own hover recipe (styles.ts): a translucent white
// pill on ONE unselected segment, gated the same way so it never fires on
// the selected pill. Targets the second segment, the Figma hover frame's own
// choice (the selected first segment stays selected at the same time).
export const SEGMENTED_HOVER_SX = {
  '& > button:nth-of-type(2):not([aria-checked="true"])': {
    backgroundColor: 'rgba(255, 255, 255, 0.52)',
    color: '#1A1C1E',
  },
} as const;
