import type { Control, FieldValues, Path, PathValue, RegisterOptions } from 'react-hook-form';

import type { UiInputProps } from '../ui-input/types';

/** The react-hook-form validation rules this field forwards to `Controller`. */
type FieldRules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

export type CustomTextField<T extends FieldValues> = UiInputProps & {
  control: Control<T>;
  rules?: FieldRules<T> | undefined;
  defaultValue?: PathValue<T, Path<T>> | undefined;
  name: Path<T>;
};
