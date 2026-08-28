import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import React from 'react';

import UiSelectWithSearch from '../../src/components/ui-select-with-search';
import type { UiSelectWithSearchOption } from '../../src/components/ui-select-with-search/types';

const CITIES: UiSelectWithSearchOption[] = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv' },
  { label: 'Kharkiv', value: 'kharkiv' },
];

function ControlledSelect(props: {
  onChange?: (value: UiSelectWithSearchOption | null) => void;
}): React.ReactElement {
  const [value, setValue] = React.useState<UiSelectWithSearchOption | null>(null);
  const handleChange = (next: UiSelectWithSearchOption | null): void => {
    setValue(next);
    props.onChange?.(next);
  };
  return (
    <UiSelectWithSearch aria-label="City" options={CITIES} value={value} onChange={handleChange} />
  );
}

/** The inline ghost overlay, located via its own container class (no data-testid). */
function ghostOverlay(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.ui-ghost-overlay');
}

describe('UiSelectWithSearch — inline ghost completion', () => {
  it('shows the first prefix-matching option completion as a ghost while typing', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSelect />);
    await user.type(screen.getByRole('combobox'), 'Ky');
    const overlay: HTMLElement | null = ghostOverlay();
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveTextContent('Kyiv');
  });

  it('hides the completion from assistive technology', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSelect />);
    await user.type(screen.getByRole('combobox'), 'Ky');
    expect(ghostOverlay()).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows no ghost when the query prefix-matches nothing', async () => {
    const user: UserEvent = userEvent.setup();
    render(<ControlledSelect />);
    await user.type(screen.getByRole('combobox'), 'zzz');
    expect(ghostOverlay()).toBeNull();
  });

  it('selects the ghosted option on ArrowRight at the end of the input', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledSelect onChange={onChange} />);
    await user.type(screen.getByRole('combobox'), 'Ky');
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith({ label: 'Kyiv', value: 'kyiv' });
  });

  it('selects the ghosted option on Tab', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(<ControlledSelect onChange={onChange} />);
    await user.type(screen.getByRole('combobox'), 'Ky');
    await user.keyboard('{Tab}');
    expect(onChange).toHaveBeenCalledWith({ label: 'Kyiv', value: 'kyiv' });
  });

  it('does not select and lets Tab move focus when nothing prefix-matches', async () => {
    const user: UserEvent = userEvent.setup();
    const onChange: jest.Mock = jest.fn();
    render(
      <>
        <ControlledSelect onChange={onChange} />
        <button type="button">next</button>
      </>
    );
    await user.type(screen.getByRole('combobox'), 'zzz');
    await user.tab();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'next' })).toHaveFocus();
  });

  it('accepts without throwing when no onChange handler is provided', async () => {
    const user: UserEvent = userEvent.setup();
    render(<UiSelectWithSearch aria-label="City" options={CITIES} />);
    const combobox: HTMLElement = screen.getByRole('combobox');
    await user.type(combobox, 'Ky');
    await user.keyboard('{ArrowRight}');
    expect(combobox).toHaveValue('Ky');
  });
});
