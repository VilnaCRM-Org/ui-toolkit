import { Box } from '@mui/material';
import React from 'react';

import type { ResolvedLogo } from './integration-logo';
import {
  GLYPH_CLASS,
  NAME_CLASS,
  headerRowSx,
  integrationLogoSx,
  nameSx,
  radioGlyphSx,
} from './styles';

// The visible content shared by the wired (radio button) and static shells — ONE
// DOM tree, identical reading order (a11y contract §2.2). The brand name is the
// only text node, so the card's accessible name is content-derived and there is no
// `aria-label` anywhere in the tree (WCAG 2.5.3, §5.1). No heading role: the page
// outline belongs to the consumer, and the card bakes in no natural-language
// literal of its own (SC 3.1.2).

// PAINT, never a control (§1.3/§5.3): a CSS-drawn circle, not an `<input
// type="radio">`, not a MUI `Radio`, never focusable and never a nested
// interactive element — the card is a SINGLE control. The checked/unchecked change
// reaches assistive tech through `aria-checked` alone, so the glyph is hidden.
function IntegrationRadioGlyph(): React.ReactElement {
  return <Box component="span" aria-hidden="true" className={GLYPH_CLASS} sx={radioGlyphSx} />;
}

interface IntegrationLogoImageProps {
  logo: ResolvedLogo;
}

// DECORATIVE (§5.2): the brand name is adjacent visible text inside the same
// control, so an informative `alt` would say the brand twice in one accessible
// name. A real `<img>`, sized in BOTH attributes so the box is reserved before the
// mark loads, and deliberately NOT lazy — integration cards are above-the-fold
// setup-flow content.
function IntegrationLogoImage({ logo }: Readonly<IntegrationLogoImageProps>): React.ReactElement {
  return (
    <Box
      component="img"
      src={logo.src}
      alt=""
      width={logo.width}
      height={logo.height}
      decoding="async"
      draggable={false}
      sx={integrationLogoSx(logo.height)}
    />
  );
}

export interface IntegrationCardContentProps {
  name: string;
  logo: ResolvedLogo | null;
}

export function IntegrationCardContent({
  name,
  logo,
}: Readonly<IntegrationCardContentProps>): React.ReactElement {
  return (
    <>
      <Box component="span" sx={headerRowSx}>
        <IntegrationRadioGlyph />
        <Box component="span" className={NAME_CLASS} sx={nameSx}>
          {name}
        </Box>
      </Box>
      {logo ? <IntegrationLogoImage logo={logo} /> : null}
    </>
  );
}
