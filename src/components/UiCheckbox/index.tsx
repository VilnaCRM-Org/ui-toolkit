import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';

import styles from './styles';
import { UiCheckboxProps } from './types';

function UiCheckbox({
  label,
  sx,
  onChange,
  error,
  disabled,
  checked,
}: UiCheckboxProps): React.ReactElement {
  return (
    <FormControlLabel
      sx={sx}
      disabled={disabled}
      control={
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          disableRipple
          icon={<span className="ui-checkbox-box" />}
          checkedIcon={<span className="ui-checkbox-box ui-checkbox-box--checked" />}
          slotProps={{ input: { 'aria-invalid': error ? 'true' : undefined } }}
          sx={error ? styles.checkboxError : styles.checkbox}
        />
      }
      label={label}
    />
  );
}

export default UiCheckbox;
