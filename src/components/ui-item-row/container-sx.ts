// The recipe-driven half of UiItemRow's container `sx`: border, tint, the child
// ink/shadow rules, the button-only hover/focus block and the expanded chevron flip.
// Split from the element layout in `styles.ts` so both modules stay within the
// maintainability budget; the per-method colours arrive pre-resolved as a
// `RowRecipe` (see `recipe.ts`).
import type { SxProps, Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

import type { RowRecipe } from './recipe';
import {
  BADGE_CLASS,
  CHEVRON_CLASS,
  CONTAINER_BASE,
  DESC_CLASS,
  MOBILE_MAX,
  PATH_CLASS,
} from './styles';

const palette: Theme['palette'] = colorTheme.palette;

// The mobile badge is transparent, so `box-shadow` would paint a rounded-rectangle
// smudge behind the glyphs Figma does not have — Figma shadows the text itself.
// Re-express the recipe's box-shadow as a `drop-shadow` filter, which follows the
// glyph alpha. Derived mechanically from `recipe.badgeShadow` (no colour table).
function toDropShadow(shadow: string): string {
  return `drop-shadow(${shadow})`;
}

// Border + tint + the child ink/shadow rules driven by the recipe.
function containerColorSx(recipe: RowRecipe): object {
  return {
    borderColor: recipe.accent,
    backgroundColor: recipe.tint,
    [`& .${BADGE_CLASS}`]: {
      color: recipe.badgeInk,
      boxShadow: recipe.badgeShadow,
      [MOBILE_MAX]: { boxShadow: 'none', filter: toDropShadow(recipe.badgeShadow) },
    },
    [`& .${PATH_CLASS}`]: { color: recipe.pathInk },
    [`& .${DESC_CLASS}`]: { color: recipe.descInk },
    [`& .${CHEVRON_CLASS}`]: { color: recipe.chevronInk },
  };
}

// Button-only additions: pointer cursor, hover recipe (accent border/ink darken +
// row shadow), and the inset focus ring (inset so the overflow:hidden radius
// never clips it — a11y contract §3.5). Focus-visible is declared last so the ring
// wins over the hover shadow when a row is both hovered and focused.
function interactiveContainerSx(recipe: RowRecipe): object {
  return {
    cursor: 'pointer',
    appearance: 'none',
    '&:hover': {
      borderColor: recipe.accentHover,
      boxShadow: recipe.rowHoverShadow,
      [`& .${BADGE_CLASS}`]: { color: recipe.badgeInkHover },
      [`& .${PATH_CLASS}`]: { color: recipe.pathInkHover },
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: `inset 0 0 0 2px ${palette.darkPrimary.main}`,
    },
  };
}

// Expanded state: chevron flips up and tints to the recipe accent (grey rows keep
// their brand-gray, since that is their accent).
function expandedChevronSx(recipe: RowRecipe): object {
  return {
    [`& .${CHEVRON_CLASS}`]: { color: recipe.accent, transform: 'rotate(180deg)' },
  };
}

export interface RowStyleConfig {
  recipe: RowRecipe;
  interactive: boolean;
  expanded: boolean;
  sx: SxProps<Theme> | undefined;
}

// The container `sx`: static layout + recipe colours + (button) hover/focus +
// (expanded) chevron flip, with the consumer `sx` merged last.
export function rowContainerSx(config: RowStyleConfig): SxProps<Theme> {
  const base: object = {
    ...CONTAINER_BASE,
    ...containerColorSx(config.recipe),
    ...(config.interactive ? interactiveContainerSx(config.recipe) : null),
    // The expanded chevron flip/tint is a disclosure affordance, so it is gated to
    // wired rows: a static row (no `onToggle`) exposes no `aria-expanded`, so it
    // must never show the expanded visual either, matching the "wired rows only"
    // contract in `types.ts`.
    ...(config.interactive && config.expanded ? expandedChevronSx(config.recipe) : null),
  };
  const extra: SxProps<Theme> = config.sx ?? {};
  return [base, ...(Array.isArray(extra) ? extra : [extra])];
}
