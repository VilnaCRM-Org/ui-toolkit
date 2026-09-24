import { ClassNames } from '@emotion/react';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';
import { useUiTheme } from '@/utils/ui-theme';

import { flattenToInline, resolveSxLayers, type InlineStyles } from './resolve-sx';
import type { UiSxAdapterProps } from './types';

type ResolvableProps = Omit<Readonly<UiSxAdapterProps>, 'sx' | 'inline'> & {
  sx: SxProps<Theme>;
};

function droppedRulesWarning(droppedRules: readonly string[]): string | null {
  if (droppedRules.length === 0) {
    return null;
  }
  return (
    `UiSxAdapter received \`inline\` with rules an inline style cannot express ` +
    `(${droppedRules.join(', ')}); they were dropped. Render without \`inline\` to keep them.`
  );
}

function InlineSxAdapter({ sx, className, style, children }: ResolvableProps): React.ReactNode {
  const theme: Theme = useUiTheme();
  const resolved: InlineStyles = flattenToInline(resolveSxLayers(sx, theme));
  useDevWarning(droppedRulesWarning(resolved.droppedRules));
  return children({ className, style: { ...resolved.style, ...style } });
}

function ClassNameSxAdapter({ sx, className, style, children }: ResolvableProps): React.ReactNode {
  const theme: Theme = useUiTheme();
  return (
    <ClassNames>
      {({ css, cx }) =>
        children({ className: cx(css(resolveSxLayers(sx, theme)), className), style })
      }
    </ClassNames>
  );
}

function UiSxAdapter({
  sx,
  className,
  style,
  inline,
  children,
}: Readonly<UiSxAdapterProps>): React.ReactNode {
  if (sx == null) {
    return children({ className, style });
  }
  if (inline === true) {
    return (
      <InlineSxAdapter sx={sx} className={className} style={style}>
        {children}
      </InlineSxAdapter>
    );
  }
  return (
    <ClassNameSxAdapter sx={sx} className={className} style={style}>
      {children}
    </ClassNameSxAdapter>
  );
}

export default UiSxAdapter;
