import type { Control, FieldValues, Path, PathValue, RegisterOptions } from 'react-hook-form';

import type { UiInputProps } from '../ui-input/types';

/** The react-hook-form validation rules this field forwards to `Controller`. */
export type FieldRules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

export type CustomTextField<T extends FieldValues> = UiInputProps & {
  control: Control<T>;
  rules?: FieldRules<T> | undefined;
  defaultValue?: PathValue<T, Path<T>> | undefined;
  name: Path<T>;
};

/**
 * The conventional props name the export contract's R2 asks of every exported
 * component (`ui-text-field-form` → `UiTextFieldFormProps`).
 *
 * An alias, not a rename: `CustomTextField<T>` is the delivered contract of this
 * seeded `website` parity module and stays exported, so nothing that names it
 * today breaks. The two are the same type, so a consumer may use either.
 */
export type UiTextFieldFormProps<T extends FieldValues> = CustomTextField<T>;
