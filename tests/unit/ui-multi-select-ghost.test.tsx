import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiMultiSelect, UiLink } from '../../src/components';
import type { UiMultiSelectOption } from '../../src/components/ui-multi-select/types';

// Tuple-typed so indexing a fixed entry stays a definite option under
// `noUncheckedIndexedAccess`.
const ROLES: [UiMultiSelectOption, UiMultiSelectOption, UiMultiSelectOption] = [
  { label: 'Designer', value: 'design' },
  { label: 'Developer', value: 'dev' },
  { label: 'Manager', value: 'manager' },
];

// A controlled host so appended chips accumulate and the field clears its typed text
// after each accept — the real consumer shape (UiMultiSelect is controlled).
function ControlledMultiSelect(props: {
  initial?: UiMultiSelectOption[];
  onChange?: (value: UiMultiSelectOption[]) => void;
}): React.ReactElement {
  const [value, setValue] = React.useState<UiMultiSelectOption[]>(props.initial ?? []);
  const handleChange = (next: UiMultiSelectOption[]): void => {
    setValue(next);
    props.onChange?.(next);
  };
  return <UiMultiSelect aria-label="Roles" options={ROLES} value={value} onChange={handleChange} />;
}

/** The inline ghost overlay, located via its own container class (no data-testid). */
function ghostOverlay(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.ui-ghost-overlay');
}

describe('UiMultiSelect — inline ghost completion', () => {
  it('shows the first prefix-matching option completion as a ghost while typing', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledMultiSelect />);
    await user.type(screen.getByRole('combobox'), 'Des');
    const overlay: HTMLElement | null = ghostOverlay();
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveTextContent('Designer');
  });

  it('keeps the input value equal to the typed text (never concatenates)', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledMultiSelect />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Des');
    expect(combobox).toHaveValue('Des');
  });

  it('hides the completion from assistive technology', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledMultiSelect />);
    await user.type(screen.getByRole('combobox'), 'Des');
    expect(ghostOverlay()).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows no ghost when the query prefix-matches nothing', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledMultiSelect />);
    await user.type(screen.getByRole('combobox'), 'zzz');
    expect(ghostOverlay()).toBeNull();
  });

  it('skips an already-selected option and ghosts the next unselected match', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledMultiSelect initial={[ROLES[0]]} />);
    // 'De' prefix-matches Designer (already a chip) and Developer; the ghost skips
    // the selected Designer and points to Developer instead.
    await user.type(screen.getByRole('combobox'), 'De');
    expect(ghostOverlay()).toHaveTextContent('Developer');
  });

  it('adds the ghosted option and clears the input on ArrowRight at the end', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledMultiSelect onChange={onChange} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Des');
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith([{ label: 'Designer', value: 'design' }]);
    expect(combobox).toHaveValue('');
  });

  it('does not add on ArrowRight when the cursor is not at the end', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledMultiSelect onChange={onChange} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Des');
    // ArrowLeft moves the caret off the end (Home is swallowed by the open listbox
    // in a non-freeSolo combobox); the next ArrowRight is then mid-text, not at end.
    await user.keyboard('{ArrowLeft}{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
    expect(combobox).toHaveValue('Des');
  });

  it('adds the ghosted option on Tab', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledMultiSelect onChange={onChange} />);
    await user.type(screen.getByRole('combobox'), 'Des');
    await user.keyboard('{Tab}');
    expect(onChange).toHaveBeenCalledWith([{ label: 'Designer', value: 'design' }]);
  });

  it('adds the ghosted option on Enter when no option is arrow-highlighted', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledMultiSelect onChange={onChange} />);
    await user.type(screen.getByRole('combobox'), 'Des');
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith([{ label: 'Designer', value: 'design' }]);
  });

  it('does not commit the ghost while an IME composition is active', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledMultiSelect onChange={onChange} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Des'); // ghost completion = Designer
    // Enter dispatched mid-IME-composition must reach the input to confirm the composed
    // candidate — it must never be stolen to commit the ghosted chip.
    fireEvent.keyDown(combobox, { key: 'Enter', isComposing: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('lets Enter select the arrow-highlighted option instead of the ghost match', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledMultiSelect onChange={onChange} />);
    // 'De' ghosts Designer (first match); arrow down twice highlights Developer, and
    // Enter must commit that highlighted option — not steal Enter for the ghost.
    await user.type(screen.getByRole('combobox'), 'De');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith([{ label: 'Developer', value: 'dev' }]);
    expect(onChange).not.toHaveBeenCalledWith([{ label: 'Designer', value: 'design' }]);
  });

  it('lets Tab move focus normally when nothing prefix-matches', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <ControlledMultiSelect />
        <UiLink href="/after">after</UiLink>
      </>
    );
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'zzz');
    await user.keyboard('{Tab}');
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
  });

  it('accepts without throwing when no onChange handler is provided', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiMultiSelect aria-label="Roles" options={ROLES} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Des');
    await user.keyboard('{ArrowRight}');
    expect(combobox).toHaveValue('');
  });
});
