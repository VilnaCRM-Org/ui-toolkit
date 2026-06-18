import type { OutlinedInputProps } from '@mui/material/OutlinedInput';
import type { TextFieldProps } from '@mui/material/TextField';
import type React from 'react';

export type UiInputProps = Omit<TextFieldProps, 'inputRef' | 'onBlur' | 'onChange'> & {
  InputProps?: OutlinedInputProps;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  ref?: React.ForwardedRef<HTMLInputElement>;
};
