import type { OutlinedInputProps } from '@mui/material/OutlinedInput';
import type { TextFieldProps } from '@mui/material/TextField';
import type React from 'react';

export type UiInputProps = Omit<TextFieldProps, 'inputRef' | 'onBlur' | 'onChange'> & {
  /**
   * Ids of the elements describing this field, written to `aria-describedby` on
   * the native `<input>` and COMPOSED with `helperText`'s own id rather than
   * replacing it — a password-requirements list, say, alongside the field's
   * error message.
   *
   * Supplying this makes the component emit an `id` on the field when the
   * consumer gave none, because MUI derives the helper text's id from it.
   */
  describedBy?: string;
  InputProps?: OutlinedInputProps;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  ref?: React.ForwardedRef<HTMLInputElement>;
};
