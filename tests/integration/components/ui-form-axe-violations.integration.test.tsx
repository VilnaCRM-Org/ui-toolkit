import React from 'react';
import { useFormContext } from 'react-hook-form';

import UiForm from '../../../src/components/ui-form';
import UiTextFieldForm from '../../../src/components/ui-text-field-form';
import expectNoA11yViolations from '../../a11y/expect-no-a11y-violations';
import renderWithProviders from '../../unit/utils/render-with-providers';

type LoginValues = { email: string };

const noop: () => void = () => undefined;

function EmailField(): React.ReactElement {
  const { control } = useFormContext<LoginValues>();
  return (
    <UiTextFieldForm<LoginValues>
      control={control}
      name="email"
      label="Email"
      type="email"
      rules={{ required: 'Email is required' }}
    />
  );
}

function LoginForm(props: { error?: string | null; isSubmitting?: boolean }): React.ReactElement {
  return (
    <UiForm<LoginValues>
      onSubmit={noop}
      defaultValues={{ email: '' }}
      submitLabel="Sign in"
      title="Account access"
      error={props.error}
      isSubmitting={props.isSubmitting}
    >
      <EmailField />
    </UiForm>
  );
}

describe('UiForm composition — zero axe violations (WCAG 2.1 AA)', () => {
  it('default', async () => {
    const { container } = renderWithProviders(<LoginForm />);
    await expectNoA11yViolations(container);
  });

  it('with a form-level error banner', async () => {
    const { container } = renderWithProviders(<LoginForm error="Invalid email or password" />);
    await expectNoA11yViolations(container);
  });

  it('while submitting', async () => {
    const { container } = renderWithProviders(<LoginForm isSubmitting />);
    await expectNoA11yViolations(container);
  });
});
