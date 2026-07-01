import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiButton, UiCheckbox, UiInput, UiLink } from '../../src/components';

import { testText } from './constants';

// Story 1.3 — Accessibility and Interaction Consistency Hardening (Epic 1 gate).
//
// These specs lock the *behavioral* accessibility contract the four core
// controls (UiButton, UiInput, UiCheckbox, UiLink) must uphold for keyboard and
// assistive-technology users: keyboard focus reachability, logical focus order,
// keyboard operability, and consistent disabled/error semantics.
//
// jsdom cannot evaluate `:focus-visible` paint, so the *visible* focus-indicator
// appearance is demonstrated by the Playwright visual state grid
// (tests/visual/states.spec.ts: `*-focus` baselines). Colour/contrast tuning of
// those indicators is intentionally out of scope here and deferred to the
// follow-up accessibility-visuals PR — see the Story 1.3 implementation artifact.

const noop: () => void = () => undefined;

// These specs focus on keyboard/focus/disabled/error behaviour and render
// deliberately minimal inputs; silence UiInput's dev-only accessible-name
// guidance so it does not clutter the suite output.
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Renders `control` between two links and asserts Tab jumps straight from the
// leading link to the trailing one, i.e. the control is not in the tab order.
async function expectSkippedInTabOrder(
  user: UserEvent,
  control: React.ReactElement
): Promise<void> {
  render(
    <>
      <UiLink href="/before">before</UiLink>
      {control}
      <UiLink href="/after">after</UiLink>
    </>
  );

  await user.tab();
  expect(screen.getByRole('link', { name: 'before' })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
}

describe('Core controls accessibility — keyboard focus reachability and order', () => {
  it('reaches every enabled core control in DOM order with Tab', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <UiButton>{testText}</UiButton>
        <UiInput placeholder="email" />
        <UiCheckbox label="terms" onChange={noop} />
        <UiLink href="/docs">docs</UiLink>
      </>
    );

    await user.tab();
    expect(screen.getByRole('button', { name: testText })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'docs' })).toHaveFocus();
  });

  it('exposes each core control through its semantic role and accessible name', () => {
    render(
      <>
        <UiButton>{testText}</UiButton>
        <UiInput slotProps={{ input: { 'aria-label': 'email' } }} />
        <UiCheckbox label="terms" onChange={noop} />
        <UiLink href="/docs">docs</UiLink>
      </>
    );

    expect(screen.getByRole('button', { name: testText })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'email' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'terms' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'docs' })).toBeInTheDocument();
  });
});

describe('Core controls accessibility — keyboard operability', () => {
  it('activates the button with the Enter key', async () => {
    const user: UserEvent = userEvent.setup();
    const onClick: jest.Mock = jest.fn();
    render(<UiButton onClick={onClick}>{testText}</UiButton>);

    await user.tab();
    expect(screen.getByRole('button', { name: testText })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates the button with the Space key', async () => {
    const user: UserEvent = userEvent.setup();
    const onClick: jest.Mock = jest.fn();
    render(<UiButton onClick={onClick}>{testText}</UiButton>);

    await user.tab();
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('lets a keyboard user focus the input and type into it', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiInput onChange={onChange} />);

    await user.tab();
    const input: HTMLElement = screen.getByRole('textbox');
    expect(input).toHaveFocus();
    await user.keyboard('hello');
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue('hello');
  });

  it('toggles the checkbox with the Space key', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<UiCheckbox label={testText} onChange={onChange} />);

    await user.tab();
    const checkbox: HTMLElement = screen.getByRole('checkbox');
    expect(checkbox).toHaveFocus();
    expect(checkbox).not.toBeChecked();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(checkbox).toBeChecked();
  });

  it('is keyboard focusable as a link with an accessible name and href', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiLink href="/docs">{testText}</UiLink>);

    await user.tab();
    const link: HTMLElement = screen.getByRole('link', { name: testText });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute('href', '/docs');
  });
});

describe('Core controls accessibility — disabled semantics are consistent', () => {
  it('marks each disabled control as disabled for assistive technology', () => {
    render(
      <>
        <UiButton disabled>{testText}</UiButton>
        <UiInput disabled />
        <UiCheckbox disabled label="terms" onChange={noop} />
      </>
    );

    expect(screen.getByRole('button', { name: testText })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('removes a disabled button from the keyboard tab order', async () => {
    await expectSkippedInTabOrder(userEvent.setup(), <UiButton disabled>{testText}</UiButton>);
  });

  it('removes a disabled input from the keyboard tab order', async () => {
    await expectSkippedInTabOrder(userEvent.setup(), <UiInput disabled />);
  });

  it('removes a disabled checkbox from the keyboard tab order', async () => {
    await expectSkippedInTabOrder(
      userEvent.setup(),
      <UiCheckbox disabled label="terms" onChange={noop} />
    );
  });
});

describe('Core controls accessibility — error semantics are consistent', () => {
  it('flags an errored input as invalid and a valid input as not invalid', () => {
    const { rerender } = render(<UiInput error={false} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');

    rerender(<UiInput error />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('flags an errored checkbox as invalid through the same aria-invalid channel', () => {
    render(<UiCheckbox error label={testText} onChange={noop} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('leaves a non-errored checkbox without an invalid flag', () => {
    render(<UiCheckbox label={testText} onChange={noop} />);
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-invalid', 'true');
  });
});
