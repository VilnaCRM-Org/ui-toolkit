import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';

import UiForm from '../../src/components/ui-form';
import { RESTORED_NOTICE_MS } from '../../src/components/ui-form/offline-notice';

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

type FormOptions = {
  titleComponent?: React.ElementType;
  submitLoadingMode?: 'aria-disabled' | 'native';
  isSubmitting?: boolean;
  offlineNotice?: typeof COPY;
};

function renderForm({
  titleComponent,
  submitLoadingMode,
  isSubmitting,
  offlineNotice,
}: FormOptions = {}): void {
  render(
    <UiForm
      onSubmit={jest.fn()}
      defaultValues={{}}
      title="Sign in"
      submitLabel="Submit"
      titleComponent={titleComponent}
      submitLoadingMode={submitLoadingMode}
      isSubmitting={isSubmitting}
      offlineNotice={offlineNotice}
    >
      <span>fields</span>
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

describe('UiForm titleComponent', () => {
  it('renders the title as the given element', () => {
    renderForm({ titleComponent: 'h1' });
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
  });

  it('keeps the title out of the heading outline by default', () => {
    renderForm();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});

describe('UiForm submitLoadingMode', () => {
  it('forwards the native mode to the submit button', () => {
    renderForm({ submitLoadingMode: 'native', isSubmitting: true });
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('keeps the focus-preserving mode by default', () => {
    renderForm({ isSubmitting: true });
    const button: HTMLElement = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('UiForm offlineNotice', () => {
  it('renders an empty status notice described by the submit while online', () => {
    renderForm({ offlineNotice: COPY });
    const button: HTMLElement = screen.getByRole('button', { name: 'Submit' });
    const notice: HTMLElement = screen.getAllByRole('status')[0] as HTMLElement;
    expect(notice).toBeEmptyDOMElement();
    expect(notice.tagName).toBe('SPAN');
    expect(notice).toHaveAttribute('aria-atomic', 'true');
    expect(notice).toHaveAttribute('tabindex', '-1');
    expect(notice).not.toHaveStyle({ marginBottom: '1rem' });
    expect(button).toHaveAttribute('aria-describedby', notice.id);
    expect(button).toBeEnabled();
  });

  it('paints the notice box and renders its copy as a span', () => {
    renderForm({ offlineNotice: COPY });
    setOnline(false);
    expect(screen.getAllByRole('status')[0]).toHaveStyle({ marginBottom: '1rem' });
    expect(screen.getByText(COPY.offline).tagName).toBe('SPAN');
  });

  it('restarts the restored window on every reconnection', () => {
    jest.useFakeTimers();
    renderForm({ offlineNotice: COPY });
    setOnline(false);
    setOnline(true);
    act((): void => {
      jest.advanceTimersByTime(3_000);
    });
    setOnline(false);
    setOnline(true);
    act((): void => {
      jest.advanceTimersByTime(3_000);
    });
    expect(screen.getByText(COPY.restored)).toBeInTheDocument();
  });

  it('disables the submit and shows the offline copy while offline', () => {
    renderForm({ offlineNotice: COPY });
    setOnline(false);
    expect(screen.getByText(COPY.offline)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('shows the restored copy after reconnecting, then clears it', () => {
    jest.useFakeTimers();
    renderForm({ offlineNotice: COPY });
    setOnline(false);
    setOnline(true);
    expect(screen.getByText(COPY.restored)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    act((): void => {
      jest.advanceTimersByTime(RESTORED_NOTICE_MS);
    });
    expect(screen.queryByText(COPY.restored)).not.toBeInTheDocument();
  });

  it('announces nothing on a mount that is already online', () => {
    renderForm({ offlineNotice: COPY });
    setOnline(true);
    expect(screen.queryByText(COPY.restored)).not.toBeInTheDocument();
  });

  it('moves focus from the submit to the notice when the connection drops', () => {
    renderForm({ offlineNotice: COPY });
    const button: HTMLElement = screen.getByRole('button', { name: 'Submit' });
    act((): void => button.focus());
    setOnline(false);
    expect(screen.getAllByRole('status')[0]).toHaveFocus();
  });

  it('leaves focus alone when the submit did not hold it', () => {
    renderForm({ offlineNotice: COPY });
    setOnline(false);
    expect(document.body).toHaveFocus();
  });

  it('ignores connectivity without the prop', () => {
    renderForm();
    setOnline(false);
    const button: HTMLElement = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText(COPY.offline)).not.toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('renders online on the server', () => {
    const view: string = renderToString(
      <UiForm
        onSubmit={jest.fn()}
        defaultValues={{}}
        title="Sign in"
        submitLabel="Submit"
        offlineNotice={COPY}
      >
        <span>fields</span>
      </UiForm>
    );
    expect(view).not.toContain(COPY.offline);
    expect(view).not.toMatch(/<button[^>]*disabled/);
  });
});
