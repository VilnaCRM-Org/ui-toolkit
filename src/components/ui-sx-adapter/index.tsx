import { ClassNames, type ClassNamesContent } from '@emotion/react';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';
import { useUiTheme } from '@/utils/ui-theme';

import { flattenToInline, resolveSxLayers, type InlineStyles } from './resolve-sx';
import type { UiSxAdapterProps, UiSxAdapterRenderProps } from './types';

interface Resolution {
  sx: SxProps<Theme> | undefined;
  className: string | undefined;
  style: React.CSSProperties | undefined;
  theme: Theme;
  inlineStyles: InlineStyles | null;
}

function droppedRulesWarning(droppedRules: readonly string[]): string | null {
  if (droppedRules.length === 0) {
    return null;
  }
  return (
    `UiSxAdapter received \`inline\` with rules an inline style cannot express ` +
    `(${droppedRules.join(', ')}); they were dropped. Render without \`inline\` to keep them.`
  );
}

function renderPropsFor(
  resolution: Resolution,
  { css, cx }: ClassNamesContent
): UiSxAdapterRenderProps {
  const { sx, className, style, theme, inlineStyles } = resolution;
  if (sx == null) {
    return { className, style };
  }
  if (inlineStyles != null) {
    return { className, style: { ...inlineStyles.style, ...style } };
  }
  return { className: cx(css(resolveSxLayers(sx, theme)), className), style };
}

function UiSxAdapter({
  sx,
  className,
  style,
  inline,
  children,
}: Readonly<UiSxAdapterProps>): React.ReactNode {
  const theme: Theme = useUiTheme();
  const inlineStyles: InlineStyles | null =
    inline === true ? flattenToInline(resolveSxLayers(sx, theme)) : null;
  useDevWarning(droppedRulesWarning(inlineStyles?.droppedRules ?? []));
  const resolution: Resolution = { sx, className, style, theme, inlineStyles };
  return <ClassNames>{content => children(renderPropsFor(resolution, content))}</ClassNames>;
}

export default UiSxAdapter;
