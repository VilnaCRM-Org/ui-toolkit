import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useFormContext } from 'react-hook-form';

import UiForm from '../../../src/components/ui-form';
import { RESTORED_NOTICE_MS } from '../../../src/components/ui-form/offline-notice';
import UiTextFieldForm from '../../../src/components/ui-text-field-form';

type SignInForm = { email: string };

const COPY: { offline: string; restored: string } = {
  offline: 'You are offline.',
  restored: 'Connection restored.',
};

let online: boolean = true;

function setOnline(next: boolean): void {
  online = next;
  act((): void => {
    window.dispatchEvent(new Event(next ? 'online' : 'offline'));
  });
}

function EmailField(): React.ReactElement {
  const { control } = useFormContext<SignInForm>();
  return <UiTextFieldForm<SignInForm> control={control} name="email" label="Email" />;
}

function SignIn({
  onSubmit,
  offlineAware = true,
}: Readonly<{
  onSubmit: (data: SignInForm) => void;
  offlineAware?: boolean;
}>): React.ReactElement {
  return (
    <UiForm<SignInForm>
      onSubmit={onSubmit}
      defaultValues={{ email: '' }}
      title="Sign in"
      titleComponent="h1"
      submitLabel="Submit"
      submitLoadingMode="native"
      offlineNotice={offlineAware ? COPY : undefined}
    >
      <EmailField />
    </UiForm>
  );
}

beforeEach(() => {
  online = true;
  jest.spyOn(navigator, 'onLine', 'get').mockImplementation((): boolean => online);
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('UiForm with the CRM options (integration)', () => {
  it('renders the page heading, the empty notice and a described submit', () => {
    render(<SignIn onSubmit={jest.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    const notice: HTMLElement = screen.getAllByRole('status')[0] as HTMLElement;
    expect(notice).toBeEmptyDOMElement();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute(
      'aria-describedby',
      notice.id
    );
  });

  it('blocks the submit while offline and submits again once back online', async () => {
    const user: ReturnType<typeof userEvent.setup> = userEvent.setup();
    const onSubmit: jest.Mock = jest.fn();
    render(<SignIn onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Email'), 'a@b.co');
    setOnline(false);
    expect(screen.getByText(COPY.offline)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    setOnline(true);
    expect(screen.getByText(COPY.restored)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledWith({ email: 'a@b.co' }, expect.anything());
  });

  it('clears the restored copy after its display window', () => {
    jest.useFakeTimers();
    render(<SignIn onSubmit={jest.fn()} />);
    setOnline(false);
    setOnline(true);
    act((): void => {
      jest.advanceTimersByTime(RESTORED_NOTICE_MS);
    });
    expect(screen.queryByText(COPY.restored)).not.toBeInTheDocument();
  });

  it('stays silent on a mount that is already online', () => {
    render(<SignIn onSubmit={jest.fn()} />);
    setOnline(true);
    expect(screen.queryByText(COPY.restored)).not.toBeInTheDocument();
  });

  it('parks focus on the notice when the focused submit is disabled', () => {
    render(<SignIn onSubmit={jest.fn()} />);
    act((): void => screen.getByRole('button', { name: 'Submit' }).focus());
    setOnline(false);
    expect(screen.getAllByRole('status')[0]).toHaveFocus();
  });

  it('leaves focus where it was when the submit did not hold it', () => {
    render(<SignIn onSubmit={jest.fn()} />);
    act((): void => screen.getByLabelText('Email').focus());
    setOnline(false);
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('ignores connectivity without the offline notice', () => {
    render(<SignIn onSubmit={jest.fn()} offlineAware={false} />);
    setOnline(false);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    expect(screen.queryByText(COPY.offline)).not.toBeInTheDocument();
  });

  it('server-renders as online', () => {
    const view: string = renderToString(<SignIn onSubmit={jest.fn()} />);
    expect(view).not.toContain(COPY.offline);
  });
});
