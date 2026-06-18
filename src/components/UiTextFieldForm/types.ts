import { Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import type { PathValue } from 'react-hook-form';

import type { UiInputProps } from '../UiInput/types';

export type CustomTextField<T extends FieldValues> = UiInputProps & {
  control: Control<T>;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  defaultValue?: PathValue<T, Path<T>>;
  name: Path<T>;
};
