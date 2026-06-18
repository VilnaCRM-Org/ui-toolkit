import React from 'react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';

import UiInput from '../UiInput';

import { CustomTextField } from './types';

type RenderArgs<T extends FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;
};

function createRenderField<T extends FieldValues>(
  inputProps: Omit<CustomTextField<T>, 'control' | 'defaultValue' | 'name' | 'rules'>
): (args: RenderArgs<T>) => React.ReactElement {
  return function renderField({
    field: { ref, value, onChange, onBlur, ...field },
    fieldState: { error },
  }: RenderArgs<T>): React.ReactElement {
    // Run RHF's handlers (required to track value/validation) AND any handler the
    // consumer passed, instead of letting the spread order silently drop theirs.
    const handleChange: React.ChangeEventHandler<
      HTMLInputElement | HTMLTextAreaElement
    > = event => {
      onChange(event);
      inputProps.onChange?.(event);
    };
    const handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
      onBlur();
      inputProps.onBlur?.(event);
    };

    return (
      <UiInput
        {...inputProps}
        {...field}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
        value={value ?? ''}
        error={!!error}
        helperText={error?.message ?? inputProps.helperText}
      />
    );
  };
}

function UiTextFieldForm<T extends FieldValues>({
  control,
  rules,
  defaultValue,
  name,
  ...inputProps
}: CustomTextField<T>): React.ReactElement {
  const renderField: (args: RenderArgs<T>) => React.ReactElement = createRenderField<T>(inputProps);

  if (defaultValue !== undefined) {
    return (
      <Controller
        control={control}
        defaultValue={defaultValue}
        name={name}
        rules={rules}
        render={renderField}
      />
    );
  }

  return <Controller control={control} name={name} rules={rules} render={renderField} />;
}

export default UiTextFieldForm;
