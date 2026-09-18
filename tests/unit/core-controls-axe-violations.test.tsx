import React from 'react';

import UiButton from '../../src/components/ui-button';
import UiCheckbox from '../../src/components/ui-checkbox';
import UiInput from '../../src/components/ui-input';
import UiLink from '../../src/components/ui-link';
import expectNoA11yViolations from '../a11y/expect-no-a11y-violations';

import renderWithProviders from './utils/render-with-providers';

const noop: () => void = () => undefined;

describe('Core controls — zero axe violations (WCAG 2.1 AA)', () => {
  it('UiButton contained', async () => {
    const { container } = renderWithProviders(<UiButton variant="contained">Save</UiButton>);
    await expectNoA11yViolations(container);
  });

  it('UiButton outlined', async () => {
    const { container } = renderWithProviders(<UiButton variant="outlined">Cancel</UiButton>);
    await expectNoA11yViolations(container);
  });

  it('UiButton loading', async () => {
    const { container } = renderWithProviders(<UiButton loading>Saving</UiButton>);
    await expectNoA11yViolations(container);
  });

  it('UiInput labelled', async () => {
    const { container } = renderWithProviders(<UiInput label="Email" />);
    await expectNoA11yViolations(container);
  });

  it('UiInput in error with helper text', async () => {
    const { container } = renderWithProviders(
      <UiInput label="Email" error helperText="Enter a valid email" />
    );
    await expectNoA11yViolations(container);
  });

  it('UiInput disabled', async () => {
    const { container } = renderWithProviders(<UiInput label="Email" disabled />);
    await expectNoA11yViolations(container);
  });

  it('UiCheckbox labelled', async () => {
    const { container } = renderWithProviders(<UiCheckbox label="Terms" onChange={noop} />);
    await expectNoA11yViolations(container);
  });

  it('UiCheckbox required with helper text', async () => {
    const { container } = renderWithProviders(
      <UiCheckbox label="Terms" required helperText="You must accept" onChange={noop} />
    );
    await expectNoA11yViolations(container);
  });

  it('UiCheckbox in error', async () => {
    const { container } = renderWithProviders(
      <UiCheckbox label="Terms" error helperText="Required" onChange={noop} />
    );
    await expectNoA11yViolations(container);
  });

  it('UiLink internal', async () => {
    const { container } = renderWithProviders(<UiLink href="/account">Account</UiLink>);
    await expectNoA11yViolations(container);
  });

  it('UiLink opening in a new tab', async () => {
    const { container } = renderWithProviders(
      <UiLink href="https://example.com" target="_blank" newTabLabel="(opens in new tab)">
        Docs
      </UiLink>
    );
    await expectNoA11yViolations(container);
  });
});
