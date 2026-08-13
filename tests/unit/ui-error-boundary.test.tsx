import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { createInstance, type i18n as I18nInstance } from 'i18next';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import { UiErrorBoundary } from '../../src/components';
import {
  FALLBACK_KEY,
  FALLBACK_MESSAGE,
} from '../../src/components/ui-error-boundary/default-fallback';

import mockConsoleError from './utils/mock-console-error';
import mockConsoleWarn from './utils/mock-console-warn';

// The message and key literals are duplicated here on purpose: asserting against
// the imported constants would move with a mutant that empties them.
const FALLBACK_TEXT: string = 'Something went wrong.';
const FALLBACK_KEY_TEXT: string = 'error_boundary.default_message';
const MISSING_ON_ERROR_WARNING: string =
  'UiErrorBoundary caught an error but no onError handler was supplied.';
const HEALTHY_TEXT: string = 'healthy child';
const SIBLING_TEXT: string = 'sibling region';
const CUSTOM_FALLBACK_TEXT: string = 'custom fallback';

// React logs every error a boundary catches through console.error; silence it.
mockConsoleError();
// UiErrorBoundary warns through devWarn when no onError handler is attached.
const warn = mockConsoleWarn();

const childMounted = jest.fn();

function Boom({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  if (shouldThrow) {
    throw new Error('boom');
  }

  return <p>{HEALTHY_TEXT}</p>;
}

function Silent(): React.ReactElement {
  throw new Error();
}

// Carries observable mount and state identity, so a recovery can be proven to
// remount the subtree rather than merely re-render it.
function Counter({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  const [count, setCount] = React.useState<number>(0);
  const increment = (): void => setCount((value: number): number => value + 1);

  React.useEffect((): void => {
    childMounted();
  }, []);

  if (shouldThrow) {
    throw new Error('boom');
  }

  return (
    <div>
      <p>{`count: ${count}`}</p>
      <button type="button" onClick={increment}>
        increment
      </button>
    </div>
  );
}

function RecoveringHarness(): React.ReactElement {
  const [shouldThrow, setShouldThrow] = React.useState<boolean>(true);

  const renderFallback = (error: Error, reset: () => void): React.ReactElement => {
    const retry = (): void => {
      setShouldThrow(false);
      reset();
    };

    return (
      <div>
        <p>{`caught: ${error.message}`}</p>
        <button type="button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  };

  return (
    <UiErrorBoundary fallback={renderFallback}>
      <Boom shouldThrow={shouldThrow} />
    </UiErrorBoundary>
  );
}

function boomTree(shouldThrow: boolean, resetKeys?: unknown[]): React.ReactElement {
  return (
    <UiErrorBoundary resetKeys={resetKeys}>
      <Boom shouldThrow={shouldThrow} />
    </UiErrorBoundary>
  );
}

function counterTree(shouldThrow: boolean, resetKeys: unknown[]): React.ReactElement {
  return (
    <UiErrorBoundary resetKeys={resetKeys}>
      <Counter shouldThrow={shouldThrow} />
    </UiErrorBoundary>
  );
}

describe('UiErrorBoundary healthy rendering', () => {
  it('renders its children and shows no alert while nothing throws', () => {
    render(boomTree(false));

    expect(screen.getByText(HEALTHY_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('UiErrorBoundary default fallback', () => {
  it('contains the failure and leaves sibling markup mounted', () => {
    render(
      <div>
        <p>{SIBLING_TEXT}</p>
        <UiErrorBoundary>
          <Boom shouldThrow />
        </UiErrorBoundary>
      </div>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(FALLBACK_TEXT);
    expect(screen.getByText(SIBLING_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(HEALTHY_TEXT)).not.toBeInTheDocument();
  });

  it('renders the default fallback for an explicit null fallback', () => {
    render(
      <UiErrorBoundary fallback={null}>
        <Boom shouldThrow />
      </UiErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(FALLBACK_TEXT);
  });

  it('still renders fallback text for an Error carrying no message', () => {
    render(
      <UiErrorBoundary>
        <Silent />
      </UiErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(FALLBACK_TEXT);
  });

  it('renders the alert as large text so #DC3939 clears the 3:1 bar', () => {
    render(boomTree(true));

    expect(screen.getByRole('alert')).toHaveClass('MuiTypography-bold22');
  });
});

describe('UiErrorBoundary error reporting', () => {
  it('calls onError exactly once with the error and the component stack', () => {
    const onError = jest.fn();

    const { rerender } = render(
      <UiErrorBoundary onError={onError}>
        <Boom shouldThrow />
      </UiErrorBoundary>
    );

    rerender(
      <UiErrorBoundary onError={onError}>
        <Boom shouldThrow />
      </UiErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });

  it('warns once through devWarn when no onError is supplied', () => {
    render(boomTree(true));

    expect(warn.spy).toHaveBeenCalledTimes(1);
    expect(warn.spy).toHaveBeenCalledWith(MISSING_ON_ERROR_WARNING);
  });
});

describe('UiErrorBoundary custom fallbacks', () => {
  it('renders a ReactNode fallback verbatim with no injected role', () => {
    render(
      <UiErrorBoundary fallback={<p>{CUSTOM_FALLBACK_TEXT}</p>}>
        <Boom shouldThrow />
      </UiErrorBoundary>
    );

    expect(screen.getByText(CUSTOM_FALLBACK_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(FALLBACK_TEXT)).not.toBeInTheDocument();
  });

  it('hands the render-prop fallback the error and a working reset', async () => {
    const user: UserEvent = userEvent.setup();

    render(<RecoveringHarness />);

    expect(screen.getByText('caught: boom')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText(HEALTHY_TEXT)).toBeInTheDocument();
    expect(screen.queryByText('caught: boom')).not.toBeInTheDocument();
  });
});

describe('UiErrorBoundary recovery', () => {
  it('remounts the failed subtree instead of restoring its old state', async () => {
    const user: UserEvent = userEvent.setup();
    const { rerender } = render(counterTree(false, ['a']));

    await user.click(screen.getByRole('button', { name: 'increment' }));
    expect(screen.getByText('count: 1')).toBeInTheDocument();

    rerender(counterTree(true, ['a']));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(counterTree(false, ['b']));

    expect(childMounted).toHaveBeenCalledTimes(2);
    expect(screen.getByText('count: 0')).toBeInTheDocument();
  });
});

describe('UiErrorBoundary resetKeys', () => {
  it('recovers when a key value changes', () => {
    const { rerender } = render(boomTree(true, [1]));

    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(boomTree(false, [2]));

    expect(screen.getByText(HEALTHY_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('recovers when the key list length changes', () => {
    const { rerender } = render(boomTree(true, [1]));

    rerender(boomTree(false, [1, 2]));

    expect(screen.getByText(HEALTHY_TEXT)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the fallback while the keys stay identical', () => {
    const { rerender } = render(boomTree(true, [1]));

    rerender(boomTree(false, [1]));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText(HEALTHY_TEXT)).not.toBeInTheDocument();
  });

  it('treats a NaN key compared with NaN as unchanged', () => {
    const { rerender } = render(boomTree(true, [NaN]));

    rerender(boomTree(false, [NaN]));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText(HEALTHY_TEXT)).not.toBeInTheDocument();
  });

  it('leaves a healthy subtree mounted and untouched when keys change', async () => {
    const user: UserEvent = userEvent.setup();
    const { rerender } = render(counterTree(false, ['a']));

    await user.click(screen.getByRole('button', { name: 'increment' }));

    rerender(counterTree(false, ['b']));

    expect(screen.getByText('count: 1')).toBeInTheDocument();
    expect(childMounted).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('UiErrorBoundary fallback message resolution', () => {
  const bareInstance: I18nInstance = createInstance();

  beforeAll(async (): Promise<void> => {
    await bareInstance.init({ lng: 'en', resources: {} });
  });

  it('shows the English default inside a resource-less i18next instance', () => {
    render(
      <I18nextProvider i18n={bareInstance}>
        <UiErrorBoundary>
          <Boom shouldThrow />
        </UiErrorBoundary>
      </I18nextProvider>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(FALLBACK_TEXT);
    expect(screen.queryByText(FALLBACK_KEY_TEXT)).not.toBeInTheDocument();
  });

  it('pins the translation key and the English default value', () => {
    expect(FALLBACK_KEY).toBe(FALLBACK_KEY_TEXT);
    expect(FALLBACK_MESSAGE).toBe(FALLBACK_TEXT);
  });
});
