import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { segmentSx, trackSx } from './styles';
import type { UiSegmentedControlProps } from './types';
import {
  useSegmentedControl,
  type SegmentModel,
  type SegmentedControlModel,
} from './use-segmented-control';

interface ControlShellProps {
  props: UiSegmentedControlProps;
  model: SegmentedControlModel;
  sx: SxProps<Theme>;
  rootRef: React.ForwardedRef<HTMLDivElement>;
}

// One wired segment: a native `<button type="button" role="radio">` carrying a
// permanent `aria-checked`. Every segment is an ordinary tab stop — no roving
// tabindex and no arrow-key handler (the `UiIntegrationCard` shape, not
// `UiRadioGroup`'s native `RadioGroup`). No key handlers either: the native
// button already fires on Enter and Space.
function WiredSegment({ segment }: Readonly<{ segment: SegmentModel }>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      tabIndex={0}
      aria-checked={segment.checked}
      aria-disabled={segment.ariaDisabled}
      onClick={segment.onActivate}
      sx={segmentSx({ interactive: true })}
    >
      {segment.option.label}
    </Box>
  );
}

function WiredControl(shell: Readonly<ControlShellProps>): React.ReactElement {
  const { props, model, sx, rootRef } = shell;
  return (
    <Box
      role="radiogroup"
      id={props.id}
      lang={props.lang}
      aria-label={model.ariaLabel}
      aria-labelledby={model.ariaLabelledBy}
      ref={rootRef}
      sx={sx}
    >
      {model.segments.map((segment: SegmentModel) => (
        <WiredSegment key={segment.option.value} segment={segment} />
      ))}
    </Box>
  );
}

// The unwired control: static, non-interactive content — no role, no
// tabindex, and no ARIA of any kind. The selected value is deliberately NOT
// painted (dev-warned): the static branch never renders state it cannot
// expose programmatically, which is why the styles key the selected pill off
// `[aria-checked="true"]` — an attribute this branch never has.
function StaticControl(shell: Readonly<ControlShellProps>): React.ReactElement {
  const { props, model, sx, rootRef } = shell;
  return (
    <Box component="div" id={props.id} lang={props.lang} ref={rootRef} sx={sx}>
      {model.segments.map((segment: SegmentModel) => (
        <Box key={segment.option.value} component="span" sx={segmentSx({ interactive: false })}>
          {segment.option.label}
        </Box>
      ))}
    </Box>
  );
}

// A period-switcher control (Figma Board B, node 439:19374): a grey track
// holding N text-only segments, one of which is the selected white pill.
// Passing `onChange` wires the whole track into a `role="radiogroup"` of
// `role="radio"` buttons; without it the control is static content. See
// `types.ts` for the full prop contract.
const UiSegmentedControl: React.ForwardRefExoticComponent<
  UiSegmentedControlProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, UiSegmentedControlProps>(
  (props: Readonly<UiSegmentedControlProps>, ref: React.ForwardedRef<HTMLDivElement>) => {
    const model: SegmentedControlModel = useSegmentedControl(props);
    const sx: SxProps<Theme> = trackSx({ sx: props.sx });
    if (model.interactive) {
      return <WiredControl props={props} model={model} sx={sx} rootRef={ref} />;
    }
    return <StaticControl props={props} model={model} sx={sx} rootRef={ref} />;
  }
);

UiSegmentedControl.displayName = 'UiSegmentedControl';

export default UiSegmentedControl;
