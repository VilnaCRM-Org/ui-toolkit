import { Box } from '@mui/material';
import React from 'react';

import { Glyph } from '../field-controls';

import { AVATAR_CLASS, CHEVRON_CLASS, NAME_CLASS, avatarSx, chevronWrapSx, nameSx } from './styles';

// The trigger's chevron. It reuses the shared `Glyph` wrapper (currentColor
// stroke, round caps/joins, aria-hidden + focusable="false") but supplies its own
// path baked at the Figma 1.66667px stroke weight in a 20px box — the shared
// `ChevronDownGlyph` is 1.5px and could not match the export, so this mirrors
// `ui-item-row`'s baked glyph instead (a11y contract §5.3).
//
// It is the Figma chevron-left leaf (`M5.83 10.83L0.83 5.83L5.83 0.83`, a 5×10
// box) rotated −90° into the 20px frame, so it points DOWN. It NEVER flips when
// the menu opens: the open state reaches assistive tech through `aria-expanded`,
// and sighted users see the menu itself (§1.3).
const CHEVRON_DOWN_PATH: string = 'M5 7.5 10 12.5 15 7.5';

function ProfileChevronGlyph(): React.ReactElement {
  return <Glyph path={CHEVRON_DOWN_PATH} viewBox="0 0 20 20" strokeWidth="1.66667" />;
}

interface ProfileAvatarProps {
  src: string;
}

// DECORATIVE, unlike the task card's informative avatar (a11y contract §5.2): the
// person name is adjacent visible text inside the same button, so `alt={name}`
// would say the name twice. Sized in both attributes (the box is reserved before
// the photo loads) and rem CSS (it scales with the user's text size).
function ProfileAvatar({ src }: Readonly<ProfileAvatarProps>): React.ReactElement {
  return (
    <Box
      component="img"
      src={src}
      alt=""
      width={32}
      height={32}
      decoding="async"
      draggable={false}
      className={AVATAR_CLASS}
      sx={avatarSx}
    />
  );
}

export interface ProfileSelectCardContentProps {
  name: string;
  avatarSrc: string | null;
}

/**
 * The visible trigger content shared by the wired (button) and static shells —
 * ONE DOM tree, identical reading order. The person name is a real text node, so
 * the trigger's accessible name is content-derived with no `aria-label` anywhere
 * (WCAG 2.5.3, §5.1); the photo and the chevron are both out of the AT tree.
 */
export function ProfileSelectCardContent({
  name,
  avatarSrc,
}: Readonly<ProfileSelectCardContentProps>): React.ReactElement {
  return (
    <>
      {avatarSrc ? <ProfileAvatar src={avatarSrc} /> : null}
      <Box component="span" className={NAME_CLASS} sx={nameSx}>
        {name}
      </Box>
      <Box component="span" className={CHEVRON_CLASS} sx={chevronWrapSx}>
        <ProfileChevronGlyph />
      </Box>
    </>
  );
}
