import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import { UiSearchInput, UiLink } from '../../src/components';

const suggestions: string[] = ['Top performers', 'Top sales this month', 'Top sales this year'];

function ControlledSearch(props: {
  initial?: string;
  options?: string[];
  onChange?: (value: string) => void;
}): React.ReactElement {
  const [value, setValue] = React.useState<string>(props.initial ?? '');
  const handleChange: (next: string) => void = (next: string): void => {
    setValue(next);
    props.onChange?.(next);
  };
  return (
    <UiSearchInput
      aria-label="Search"
      value={value}
      onChange={handleChange}
      options={props.options ?? suggestions}
    />
  );
}

/** The inline ghost overlay, located via its own container class (no data-testid). */
function ghostOverlay(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.ui-ghost-overlay');
}

describe('UiSearchInput — inline ghost completion', () => {
  it('shows the first matching suggestion completion as a ghost while typing', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch />);
    await user.type(screen.getByRole('combobox'), 'Top perf');
    const overlay: HTMLElement | null = ghostOverlay();
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveTextContent('Top performers');
  });

  it('keeps the input value equal to the typed text (never concatenates)', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Top');
    expect(combobox).toHaveValue('Top');
  });

  it('hides the completion from assistive technology (value stays the typed text)', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch />);
    await user.type(screen.getByRole('combobox'), 'Top');
    expect(ghostOverlay()).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('combobox', { name: 'Search' })).toHaveValue('Top');
  });

  it('shows no ghost when the query prefix-matches nothing', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch />);
    await user.type(screen.getByRole('combobox'), 'zzz');
    expect(ghostOverlay()).toBeNull();
  });

  it('hides the ghost once the field is blurred', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <ControlledSearch />
        <button type="button">elsewhere</button>
      </>
    );
    await user.type(screen.getByRole('combobox'), 'Top');
    expect(ghostOverlay()).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'elsewhere' }));
    expect(ghostOverlay()).toBeNull();
  });

  it('shows the ghost on a force-open field even without focus', () => {
    render(
      <UiSearchInput aria-label="Search" options={suggestions} value="Top" open disablePortal />
    );
    expect(ghostOverlay()).not.toBeNull();
    expect(ghostOverlay()).toHaveTextContent('Top performers');
  });

  it('accepts the completion on ArrowRight at the end of the input', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledSearch onChange={onChange} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Top');
    await user.keyboard('{ArrowRight}');
    expect(combobox).toHaveValue('Top performers');
    expect(onChange).toHaveBeenCalledWith('Top performers');
  });

  it('does not accept on ArrowRight when the cursor is not at the end', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSearch />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Top');
    await user.keyboard('{Home}{ArrowRight}');
    expect(combobox).toHaveValue('Top');
  });

  it('accepts the completion on Tab when a ghost is showing', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledSearch onChange={onChange} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Top');
    await user.keyboard('{Tab}');
    expect(combobox).toHaveValue('Top performers');
    expect(onChange).toHaveBeenCalledWith('Top performers');
  });

  it('does not accept on Shift+Tab and lets focus move backward', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <>
        <UiLink href="/before">before</UiLink>
        <ControlledSearch onChange={onChange} />
      </>
    );
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Top');
    await user.tab({ shift: true });
    expect(combobox).toHaveValue('Top');
    expect(onChange).not.toHaveBeenCalledWith('Top performers');
    expect(screen.getByRole('link', { name: 'before' })).toHaveFocus();
  });

  it('lets Tab move focus normally when there is no ghost', async () => {
    const user: UserEvent = userEvent.setup();
    render(
      <>
        <ControlledSearch />
        <UiLink href="/after">after</UiLink>
      </>
    );
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'zzz');
    await user.keyboard('{Tab}');
    expect(screen.getByRole('link', { name: 'after' })).toHaveFocus();
    expect(combobox).toHaveValue('zzz');
  });
});
