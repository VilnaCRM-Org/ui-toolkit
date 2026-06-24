import React, { ReactNode } from 'react';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';

type FormProviderBridgeProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  children: ReactNode;
};

export default function FormProviderBridge<T extends FieldValues>({
  methods,
  children,
}: FormProviderBridgeProps<T>): React.ReactElement {
  return <FormProvider {...methods}>{children}</FormProvider>;
}
