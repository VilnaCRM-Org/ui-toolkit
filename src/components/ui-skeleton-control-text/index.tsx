import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';
import UiSkeletonText from '../ui-skeleton-text';
import { ComposedSkeleton } from '../ui-skeletons';

import {
  CONTROL_SIZE,
  CONTROL_TEXT_BAR_WIDTH,
  DEFAULT_CONTROL,
  controlShapeStyles,
  controlTextContentStyles,
  getControlRadius,
} from './styles';
import type { UiSkeletonControlTextProps } from './types';

/**
 * Board D "control + text" placeholder: a 24x24 control shape beside a 147x18
 * label bar. Both shapes are decorative — the composition exposes no widget
 * role, so assistive technology reads only the shell's busy state.
 */
export default function UiSkeletonControlText({
  id,
  control = DEFAULT_CONTROL,
  loadingText,
  sx = [],
}: Readonly<UiSkeletonControlTextProps>): React.ReactElement {
  return (
    <ComposedSkeleton
      id={id}
      loadingText={loadingText}
      sx={sx}
      contentSx={controlTextContentStyles}
    >
      <UiSkeletonBlock
        width={CONTROL_SIZE}
        height={CONTROL_SIZE}
        borderRadius={getControlRadius(control)}
        sx={controlShapeStyles}
      />
      <UiSkeletonText size="l" width={CONTROL_TEXT_BAR_WIDTH} sx={controlShapeStyles} />
    </ComposedSkeleton>
  );
}
