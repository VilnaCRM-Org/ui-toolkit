import React from 'react';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from 'react-hook-form';

import UiInput from '../ui-input';

import { toControllerRules, type ControllerRules } from './controller-rules';
import type { CustomTextField } from './types';

type RenderArgs<T extends FieldValues> = {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;
};

type InputProps<T extends FieldValues> = Omit<
  CustomTextField<T>,
  'control' | 'defaultValue' | 'name' | 'rules'
>;

type ControlledInputProps<T extends FieldValues> = RenderArgs<T> & {
  inputProps: InputProps<T>;
};

function ControlledInput<T extends FieldValues>({
  field: { ref, value, onChange, onBlur, ...field },
  fieldState: { error },
  inputProps,
}: ControlledInputProps<T>): React.ReactElement {
  // Run RHF's handlers (required to track value/validation) AND any handler the
  // consumer passed, instead of letting the spread order silently drop theirs.
  const { onChange: consumerChange, onBlur: consumerBlur } = inputProps;
  const handleChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    event => {
      onChange(event);
      consumerChange?.(event);
    },
    [onChange, consumerChange]
  );
  const handleBlur = React.useCallback<
    React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    event => {
      onBlur();
      consumerBlur?.(event);
    },
    [onBlur, consumerBlur]
  );

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
}

function createRenderField<T extends FieldValues>(
  inputProps: InputProps<T>
): (args: RenderArgs<T>) => React.ReactElement {
  return function renderField({ field, fieldState }: RenderArgs<T>): React.ReactElement {
    return <ControlledInput field={field} fieldState={fieldState} inputProps={inputProps} />;
  };
}

function UiTextFieldForm<T extends FieldValues>({
  control,
  rules: providedRules,
  defaultValue,
  name,
  ...inputProps
}: CustomTextField<T>): React.ReactElement {
  const renderField: (args: RenderArgs<T>) => React.ReactElement = createRenderField<T>(inputProps);
  const rules: ControllerRules<T> = toControllerRules<T>(providedRules);

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
