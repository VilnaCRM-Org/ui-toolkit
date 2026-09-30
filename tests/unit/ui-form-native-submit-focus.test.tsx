import { act, render, screen } from '@testing-library/react';
import React from 'react';

import UiForm from '../../src/components/ui-form';

type Mode = 'aria-disabled' | 'native' | undefined;

function form(mode: Mode, isSubmitting: boolean): React.ReactElement {
  return (
    <UiForm
      onSubmit={jest.fn()}
      defaultValues={{}}
      title="Sign in"
      submitLabel="Submit"
      submitLoadingMode={mode}
      isSubmitting={isSubmitting}
    >
      <input aria-label="Email" />
    </UiForm>
  );
}

function submitButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Submit' });
}

function dropFocus(): void {
  act((): void => submitButton().blur());
}

function runSubmit(mode: Mode, focusDuring: () => void): void {
  const { rerender } = render(form(mode, false));
  act((): void => submitButton().focus());
  rerender(form(mode, true));
  focusDuring();
  rerender(form(mode, false));
}

describe('UiForm native submit focus', () => {
  it('returns focus to the submit when the native busy state dropped it', () => {
    runSubmit('native', dropFocus);
    expect(submitButton()).toHaveFocus();
  });

  it('leaves focus where the form moved it during the submit', () => {
    runSubmit('native', (): void => {
      act((): void => screen.getByLabelText('Email').focus());
    });
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('does not restore focus in the default loading mode', () => {
    runSubmit(undefined, dropFocus);
    expect(document.body).toHaveFocus();
  });

  it('leaves focus alone on mount', () => {
    render(form('native', false));
    expect(document.body).toHaveFocus();
  });

  it('does not move focus before a submit has ended', () => {
    const { rerender } = render(form('native', false));
    act((): void => submitButton().focus());
    dropFocus();
    rerender(form('native', false));
    rerender(form('native', true));
    expect(document.body).toHaveFocus();
  });
});
