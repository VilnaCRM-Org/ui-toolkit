import { Box, FormControl, FormHelperText } from '@mui/material';
import React from 'react';

import { PinCells } from './pin-cells';
import { pinGroupSx, pinInputSx } from './styles';
import type { UiPinInputProps } from './types';
import { usePinInput, type PinInputModel } from './use-pin-input';

interface PinGroupProps {
  field: UiPinInputProps;
  model: PinInputModel;
  groupRef: React.ForwardedRef<HTMLDivElement>;
}

// The `role="group"` wrapper: it names the set of cells and nothing else. It is
// NOT a widget role, so it carries no `aria-disabled`, no `aria-invalid` and no
// tabindex — every one of those lives on the cells, where a screen reader in
// forms mode actually meets them. `labelledBy` wins over `label`, so the two
// naming attributes are never both present.
function PinGroup({ field, model, groupRef }: Readonly<PinGroupProps>): React.ReactElement {
  return (
    <Box
      component="div"
      role="group"
      id={field.id}
      aria-label={model.group.label}
      aria-labelledby={model.group.labelledBy}
      ref={groupRef}
      sx={pinGroupSx}
    >
      <PinCells model={model} cellLabel={field.cellLabel} />
    </Box>
  );
}

/**
 * One-time-code / PIN field: N discrete digit cells (Figma "2FA item", master
 * `72:5172`) inside a named `role="group"`, with the helper text rendered once
 * below and linked from every cell.
 *
 * The field is always controlled and holds no React state of its own: `value`
 * comes in filtered and clamped, and every edit — typed, pasted or autofilled —
 * goes back out through `onChange` as the full concatenated string. There is no
 * `onComplete`; compare `next.length === length`. The only state the component
 * owns is the DOM focus target, which is why the forwarded ref lands on the
 * group element rather than on a cell: focus INSIDE the field is the field's
 * business, while returning focus TO the field is the consumer's. See `types.ts`
 * for the full keyboard table and the `readOnly` + `aria-disabled` boundary.
 */
const UiPinInput: React.ForwardRefExoticComponent<
  UiPinInputProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, UiPinInputProps>(
  (props: Readonly<UiPinInputProps>, ref: React.ForwardedRef<HTMLDivElement>) => {
    const model: PinInputModel = usePinInput(props);
    return (
      <FormControl error={props.error} sx={pinInputSx(props.sx)}>
        <PinGroup field={props} model={model} groupRef={ref} />
        {model.helperTextId == null ? null : (
          <FormHelperText id={model.helperTextId}>{props.helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);

UiPinInput.displayName = 'UiPinInput';

export default UiPinInput;
