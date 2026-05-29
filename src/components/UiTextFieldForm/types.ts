import { TextFieldProps } from '@mui/material';
import { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

export interface CustomTextField<T extends FieldValues> extends TextFieldProps<'standard'> {
  control: Control<T>;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  name: Path<T>;
  placeholder: string;
  type?: string;
  fullWidth?: boolean;
}
