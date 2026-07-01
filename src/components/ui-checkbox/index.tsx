import { Box, Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import React from 'react';

import styles from './styles';
import type { UiCheckboxProps } from './types';

function renderCheckbox(
  { onChange, error, disabled, checked, required }: UiCheckboxProps,
  helperTextId: string | undefined
): React.ReactElement {
  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      required={required}
      onChange={onChange}
      disableRipple
      icon={<span className="ui-checkbox-box" />}
      checkedIcon={<span className="ui-checkbox-box ui-checkbox-box--checked" />}
      slotProps={{
        input: {
          'aria-invalid': error ? 'true' : undefined,
          'aria-describedby': helperTextId,
        },
      }}
      sx={error ? styles.checkboxError : styles.checkbox}
    />
  );
}

function UiCheckbox(props: UiCheckboxProps): React.ReactElement {
  const { label, sx, disabled, helperText } = props;
  const generatedId: string = React.useId();
  const helperTextId: string | undefined = helperText ? `${generatedId}-helper-text` : undefined;

  const control: React.ReactElement = (
    <FormControlLabel
      sx={sx}
      disabled={disabled}
      control={renderCheckbox(props, helperTextId)}
      label={label}
    />
  );

  if (!helperText) {
    return control;
  }

  return (
    <Box>
      {control}
      <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
    </Box>
  );
}

export default UiCheckbox;
