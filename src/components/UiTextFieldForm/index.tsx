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
    field: { ref, value, ...field },
    fieldState: { error },
  }: RenderArgs<T>): React.ReactElement {
    return (
      <UiInput
        {...inputProps}
        {...field}
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
  const renderField: (args: RenderArgs<T>) => React.ReactElement =
    createRenderField<T>(inputProps);

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
