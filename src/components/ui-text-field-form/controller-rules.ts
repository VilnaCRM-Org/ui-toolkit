import type { FieldValues } from 'react-hook-form';

import type { CustomTextField } from './types';

/** react-hook-form validation rules for a single field, with `undefined` removed. */
export type ControllerRules<T extends FieldValues> = NonNullable<CustomTextField<T>['rules']>;

// `Controller`'s `rules` prop is an exact-optional member of react-hook-form's
// own props type, so an omitted `rules` (an explicit `undefined`) is not
// assignable under `exactOptionalPropertyTypes` — and the prop cannot be widened
// because the type is external. react-hook-form only ever spreads `rules` into
// `register` (`{ ...props.rules, value }`), so an empty options object and
// `undefined` produce byte-identical registrations; substituting one for the
// other here is a type-level adaptation with no behavioural difference.
export function toControllerRules<T extends FieldValues>(
  rules: ControllerRules<T> | undefined
): ControllerRules<T> {
  const noRules: ControllerRules<T> = {};
  return rules ?? noRules;
}
