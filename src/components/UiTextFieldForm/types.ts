import { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

import { UiInputProps } from '../UiInput/types';

export interface CustomTextField<T extends FieldValues> extends Omit<
  UiInputProps,
  'error' | 'onBlur' | 'onChange' | 'ref' | 'value'
> {
  control: Control<T>;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  name: Path<T>;
  placeholder: string;
}
