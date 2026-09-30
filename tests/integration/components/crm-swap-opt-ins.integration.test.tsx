import { act, render, screen, within } from '@testing-library/react';
import i18next from 'i18next';
import React from 'react';

import AuthSkeleton from '../../../src/components/auth-skeleton';
import UiFooter from '../../../src/components/ui-footer';
import UiForm from '../../../src/components/ui-form';

function SignIn({
  isSubmitting,
  announce,
}: Readonly<{ isSubmitting: boolean; announce?: boolean }>): React.ReactElement {
  return (
    <UiForm
      onSubmit={jest.fn()}
      defaultValues={{}}
      title="Sign in"
      submitLabel="Submit"
      submittingLabel="Signing in"
      submitLoadingMode="native"
      submitKitInk
      submitResponsiveLabel={false}
      submitLoadingIndicator={<span aria-hidden="true">arc</span>}
      isSubmitting={isSubmitting}
      submittingAnnouncement={announce}
    >
      <input aria-label="Email" />
    </UiForm>
  );
}

describe('AuthSkeleton crm options (integration)', () => {
  it('renders a named busy region that fills its column with the crm card', () => {
    render(<AuthSkeleton landmark="section" layout="fill" cardTone="crm" ariaLabel="Loading" />);
    const region: HTMLElement = screen.getByRole('region', { name: 'Loading' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(within(region).queryByText('Loading')).not.toBeInTheDocument();
  });
});

describe('UiFooter crm slots (integration)', () => {
  it('swaps in a decorative logo and styles the links from an sx object', () => {
    render(
      <UiFooter
        variant="crm"
        logo={<svg aria-hidden="true" />}
        slotProps={{ link: { sx: { color: 'rgb(1, 2, 3)' } } }}
      />
    );
    const footer: HTMLElement = screen.getByRole('contentinfo');
    expect(within(footer).queryByRole('img')).not.toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: i18next.t('footer.privacy') })).toHaveStyle({
      color: 'rgb(1, 2, 3)',
    });
  });

  it('accepts an sx array for the links and no logo at all', () => {
    render(
      <UiFooter
        variant="crm"
        logo={null}
        slotProps={{ link: { sx: [{ color: 'rgb(4, 5, 6)' }] } }}
      />
    );
    const footer: HTMLElement = screen.getByRole('contentinfo');
    expect(within(footer).queryByAltText(i18next.t('footer.logo_alt'))).not.toBeInTheDocument();
    expect(
      within(footer).getByRole('link', { name: i18next.t('footer.usage_policy') })
    ).toHaveStyle({ color: 'rgb(4, 5, 6)' });
  });
});

describe('UiForm native crm submit (integration)', () => {
  it('announces the submit, draws the indicator and returns focus afterwards', () => {
    const { rerender } = render(<SignIn isSubmitting={false} />);
    const submit: HTMLElement = screen.getByRole('button', { name: 'Submit' });
    act((): void => submit.focus());
    rerender(<SignIn isSubmitting />);
    expect(screen.getByRole('status')).toHaveTextContent('Signing in');
    expect(screen.getByText('arc')).toBeInTheDocument();
    expect(submit).toBeDisabled();
    act((): void => submit.blur());
    rerender(<SignIn isSubmitting={false} />);
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(submit).toHaveFocus();
  });

  it('lets the announcement run on its own schedule', () => {
    render(<SignIn isSubmitting={false} announce />);
    expect(screen.getByRole('status')).toHaveTextContent('Signing in');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});
