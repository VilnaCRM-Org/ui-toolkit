import { Box } from '@mui/material';
import React from 'react';

import { ItemChevronGlyph, ItemPadlockGlyph } from './item-icons';
import {
  BADGE_CLASS,
  CHEVRON_CLASS,
  DESC_CLASS,
  PATH_CLASS,
  badgeSx,
  chevronWrapSx,
  descriptionSx,
  iconGroupSx,
  pathSx,
  textColumnSx,
} from './styles';
import type { ItemRowMethod } from './types';

// The visible content shared by both the wired (button) and static row shells —
// ONE DOM tree, identical reading order at every breakpoint. The badge label,
// path and description are real text nodes, so the row's accessible name comes
// straight from the content ("{METHOD} {path} {description}"); the class hooks let
// the container colour/hover/expanded rules reach each part.

interface BadgeProps {
  method: ItemRowMethod;
}

// The method badge is real, styled text (never colour-only) — the uppercase verb
// carries the method identity into the accessible name.
function Badge({ method }: Readonly<BadgeProps>): React.ReactElement {
  return (
    <Box component="span" className={BADGE_CLASS} sx={badgeSx}>
      {method.toUpperCase()}
    </Box>
  );
}

interface RowTextProps {
  path: string;
  description?: string;
}

// Path over/next-to description. A blank description renders nothing, so the name
// collapses to "{METHOD} {path}" (a11y contract §2.3).
function RowText({ path, description }: Readonly<RowTextProps>): React.ReactElement {
  return (
    <Box component="span" sx={textColumnSx}>
      <Box component="span" className={PATH_CLASS} sx={pathSx}>
        {path}
      </Box>
      {description ? (
        <Box component="span" className={DESC_CLASS} sx={descriptionSx}>
          {description}
        </Box>
      ) : null}
    </Box>
  );
}

// The trailing chevron + open-padlock. Both are decorative (aria-hidden inside the
// glyphs); the chevron's flip/tint is driven by the container from aria-expanded.
function RowIcons(): React.ReactElement {
  return (
    <Box component="span" sx={iconGroupSx}>
      <Box component="span" className={CHEVRON_CLASS} sx={chevronWrapSx}>
        <ItemChevronGlyph />
      </Box>
      <ItemPadlockGlyph />
    </Box>
  );
}

export interface RowContentProps {
  method: ItemRowMethod;
  path: string;
  description?: string;
}

export function RowContent({
  method,
  path,
  description,
}: Readonly<RowContentProps>): React.ReactElement {
  return (
    <>
      <Badge method={method} />
      <RowText path={path} description={description} />
      <RowIcons />
    </>
  );
}
