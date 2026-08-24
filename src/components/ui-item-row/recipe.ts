// Per-method colour recipes for UiItemRow (Figma "atom switcher" colour table).
// Kept apart from the layout `styles.ts` so each module stays small: this file
// owns the accent/tint/ink/shadow values, `styles.ts` owns the sx layout that
// consumes a resolved recipe.
import type { Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

import colorTheme from '@/components/ui-color-theme';

import type { ItemRowMethod } from './types';

const palette: Theme['palette'] = colorTheme.palette;

// ACCENT drives the border + badge ink; the rest accents reuse the shared brand
// tokens, the hover accents are the darkened item-row tokens.
const METHOD_ACCENT: Record<ItemRowMethod, string> = {
  get: palette.primary.main,
  put: palette.secondary.main,
  post: palette.success.main,
  delete: palette.error.main,
};

const METHOD_ACCENT_HOVER: Record<ItemRowMethod, string> = {
  get: palette.getMethodHover.main,
  put: palette.putMethodHover.main,
  post: palette.postMethodHover.main,
  delete: palette.deleteMethodHover.main,
};

// Badge drop shadow: 0 8px 13.5px <tint>, per method.
const METHOD_BADGE_SHADOW: Record<ItemRowMethod, string> = {
  get: '0 8px 13.5px rgba(49, 59, 67, 0.14)',
  put: '0 8px 13.5px rgba(255, 122, 0, 0.48)',
  post: '0 8px 13.5px rgba(54, 185, 137, 0.43)',
  delete: '0 8px 13.5px #F4B0B0',
};

// Row hover shadow: 0 4px 9px <tint>, per method.
const METHOD_ROW_HOVER_SHADOW: Record<ItemRowMethod, string> = {
  get: '0 4px 9px rgba(30, 185, 255, 0.18)',
  put: '0 4px 9px rgba(221, 168, 55, 0.18)',
  post: '0 4px 9px rgba(75, 157, 71, 0.18)',
  delete: '0 4px 9px rgba(199, 44, 44, 0.18)',
};

const GREY_BADGE_SHADOW: string = '0 8px 13.5px rgba(49, 59, 67, 0.14)';
const GREY_ROW_HOVER_SHADOW: string = '0 4px 9px rgba(106, 106, 106, 0.18)';

// The full colour recipe a row renders from. `muted` swaps the whole recipe to
// grey regardless of method (grey is a status applicable to any verb).
export interface RowRecipe {
  accent: string;
  accentHover: string;
  tint: string;
  badgeInk: string;
  badgeInkHover: string;
  badgeShadow: string;
  pathInk: string;
  pathInkHover: string;
  descInk: string;
  chevronInk: string;
  rowHoverShadow: string;
}

// Muted/grey recipe (Figma GREY row): brand-gray border, white badge pill with
// Font/300 ink, Font/300 path over Font/400 description; hover darkens the badge
// ink and path to #1C2022 while the description and border hold.
const GREY_RECIPE: RowRecipe = {
  accent: palette.brandGray.main,
  accentHover: palette.brandGray.main,
  tint: palette.backgroundGrey200.main,
  badgeInk: palette.grey300.main,
  badgeInkHover: palette.mutedInkHover.main,
  badgeShadow: GREY_BADGE_SHADOW,
  pathInk: palette.grey300.main,
  pathInkHover: palette.mutedInkHover.main,
  descInk: palette.grey400.main,
  chevronInk: palette.brandGray.main,
  rowHoverShadow: GREY_ROW_HOVER_SHADOW,
};

// Coloured (active) recipe: the accent drives the border + badge ink, the tint is
// the accent at 10%, the path is Font/100 and the description Font/200. Only the
// accent (border + badge ink) darkens on hover; path/description hold.
function coloredRecipe(method: ItemRowMethod): RowRecipe {
  return {
    accent: METHOD_ACCENT[method],
    accentHover: METHOD_ACCENT_HOVER[method],
    tint: alpha(METHOD_ACCENT[method], 0.1),
    badgeInk: METHOD_ACCENT[method],
    badgeInkHover: METHOD_ACCENT_HOVER[method],
    badgeShadow: METHOD_BADGE_SHADOW[method],
    pathInk: palette.darkPrimary.main,
    pathInkHover: palette.darkPrimary.main,
    descInk: palette.grey200.main,
    chevronInk: palette.darkSecondary.main,
    rowHoverShadow: METHOD_ROW_HOVER_SHADOW[method],
  };
}

export function resolveRecipe(method: ItemRowMethod, muted: boolean): RowRecipe {
  return muted ? GREY_RECIPE : coloredRecipe(method);
}
