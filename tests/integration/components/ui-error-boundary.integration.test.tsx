import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';

import { UiButton, UiErrorBoundary, UiForm, UiInput } from '../../../src/components';
import mockConsoleError from '../../unit/utils/mock-console-error';
import mockConsoleWarn from '../../unit/utils/mock-console-warn';

// Integration tier: a real composed page fragment. A sibling region holding a
// real interactive toolkit control sits OUTSIDE the boundary, while the boundary
// wraps a real UiForm subtree whose field throws during render. No child mocks —
// the point is that one failing region degrades alone and recovers in place.

const SIBLING_REGION_LABEL: string = 'Account sidebar';
const SIBLING_BUTTON_LABEL: string = 'Open settings';
const FIELD_LABEL: string = 'Nickname';
const SUBMIT_LABEL: string = 'Save profile';
const FORM_TITLE: string = 'Profile';
const FALLBACK_TEXT: string = 'Something went wrong.';

type ProfileForm = {
  nickname: string;
};

const DEFAULT_VALUES: ProfileForm = { nickname: '' };

// React logs every caught error; the boundary warns because no onError is wired.
mockConsoleError();
mockConsoleWarn();

function ProfileField({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  if (shouldThrow) {
    throw new Error('profile field failed to render');
  }

  return <UiInput label={FIELD_LABEL} />;
}

type CompositionProps = {
  shouldThrow: boolean;
  resetKeys: unknown[];
  onSiblingClick: () => void;
  onSubmit: SubmitHandler<ProfileForm>;
};

function Composition({
  shouldThrow,
  resetKeys,
  onSiblingClick,
  onSubmit,
}: CompositionProps): React.ReactElement {
  return (
    <div>
      <section aria-label={SIBLING_REGION_LABEL}>
        <UiButton onClick={onSiblingClick}>{SIBLING_BUTTON_LABEL}</UiButton>
      </section>
      <UiErrorBoundary resetKeys={resetKeys}>
        <UiForm<ProfileForm>
          onSubmit={onSubmit}
          defaultValues={DEFAULT_VALUES}
          submitLabel={SUBMIT_LABEL}
          title={FORM_TITLE}
        >
          <ProfileField shouldThrow={shouldThrow} />
        </UiForm>
      </UiErrorBoundary>
    </div>
  );
}

describe('UiErrorBoundary in a composed page fragment', () => {
  it('contains the failure and leaves the sibling region interactive', async () => {
    const user: UserEvent = userEvent.setup();
    const onSiblingClick = jest.fn();
    const onSubmit = jest.fn();

    render(
      <Composition
        shouldThrow
        resetKeys={[1]}
        onSiblingClick={onSiblingClick}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(FALLBACK_TEXT);
    expect(screen.queryByRole('button', { name: SUBMIT_LABEL })).not.toBeInTheDocument();
    expect(screen.queryByText(FORM_TITLE)).not.toBeInTheDocument();

    expect(screen.getByRole('region', { name: SIBLING_REGION_LABEL })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: SIBLING_BUTTON_LABEL }));

    expect(onSiblingClick).toHaveBeenCalledTimes(1);
  });

  it('recovers through a resetKeys change and renders the real subtree again', async () => {
    const user: UserEvent = userEvent.setup();
    const onSiblingClick = jest.fn();
    const onSubmit = jest.fn();

    const { rerender } = render(
      <Composition
        shouldThrow
        resetKeys={[1]}
        onSiblingClick={onSiblingClick}
        onSubmit={onSubmit}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <Composition
        shouldThrow={false}
        resetKeys={[2]}
        onSiblingClick={onSiblingClick}
        onSubmit={onSubmit}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(FORM_TITLE)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: SUBMIT_LABEL })).toBeInTheDocument();

    const field: HTMLElement = screen.getByRole('textbox', { name: FIELD_LABEL });

    await user.type(field, 'ada');

    expect(field).toHaveValue('ada');
  });
});
